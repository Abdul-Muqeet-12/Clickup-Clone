import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query, internalAction } from "./_generated/server";
import { getOrganizationId, getUserId } from "./auth";
import { components, internal } from "./_generated/api";
import {
  Agent,
  stepCountIs,
  listUIMessages,
  syncStreams,
  vStreamArgs,
  type ToolCtx,
} from "@convex-dev/agent";
import { tools } from "./tools";
import type { ToolSet } from "ai";
import { groq } from "@ai-sdk/groq";

export type ChatCtx = ToolCtx & {
  organizationId: string;
  userId: string;
};

export function createAgent(doc: {
  name: string;
  instructions: string;
  tools: string[];
}): Agent<ChatCtx> {
  const agentTools: ToolSet = {};
  for (const toolId of doc.tools) {
    if (toolId in tools) {
      agentTools[toolId] = tools[toolId as keyof typeof tools];
    }
  }
  return new Agent(components.agent, {
    name: doc.name,
    languageModel: groq("openai/gpt-oss-120b"),
    instructions: doc.instructions,
    tools: agentTools,
    stopWhen: stepCountIs(10),
    callSettings: { maxRetries: 10 },
  });
}

export const getOrCreateThread = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, { agentId }) => {
    const userId = await getUserId(ctx);
    const orgId = await getOrganizationId(ctx);

    const agentDoc = await ctx.db.get(agentId);
    if (!agentDoc || agentDoc.organizationId !== orgId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Agent not found" });
    }

    const existing = await ctx.db
      .query("chatThreads")
      .withIndex("by_user_agent", (q) =>
        q.eq("userId", userId).eq("agentId", agentId),
      )
      .first();

    if (existing) return existing.threadId;

    const agent = createAgent(agentDoc);
    const { threadId } = await agent.createThread(ctx, { userId });

    await ctx.db.insert("chatThreads", {
      threadId,
      userId,
      agentId,
      createdAt: Date.now(),
    });

    const { messageId } = await agent.saveMessage(ctx, {
      threadId,
      prompt: "Hey, let's get started!",
      skipEmbeddings: true,
    });

    await ctx.scheduler.runAfter(0, internal.chat.streamAsync, {
      threadId,
      promptMessageId: messageId,
      agentId: agentId,
      organizationId: orgId,
      userId,
    });
    return threadId;
  },
});

export const listThreads = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const userId = await getUserId(ctx);

    const result = await ctx.db
      .query("chatThreads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(paginationOpts);

    const threadsWithAgents = await Promise.all(
      result.page.map(async (thread) => {
        const agent = await ctx.db.get(thread.agentId);
        return {
          ...thread,
          agent: agent ? { _id: agent._id, name: agent.name } : null,
        };
      }),
    );

    return { ...result, page: threadsWithAgents };
  },
});

export const getThread = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const userId = await getUserId(ctx);
    const thread = await ctx.db
      .query("chatThreads")
      .withIndex("by_user_thread", (q) =>
        q.eq("userId", userId).eq("threadId", threadId),
      )
      .first();

    if (!thread) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Not authorized",
      });
    }

    const agent = await ctx.db.get(thread.agentId);
    if (!agent) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Agent not found" });
    }

    return {
      ...thread,
      agent: { _id: agent._id, name: agent.name, avatar: agent.avatar },
    };
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    await getOrganizationId(ctx);

    const streams = await syncStreams(ctx, components.agent, {
      threadId: args.threadId,
      streamArgs: args.streamArgs,
    });

    const paginated = await listUIMessages(ctx, components.agent, args);
    return { ...paginated, streams };
  },
});

export const sendMessage = mutation({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, prompt }) => {
    const userId = await getUserId(ctx);
    const orgId = await getOrganizationId(ctx);

    const thread = await ctx.db
      .query("chatThreads")
      .withIndex("by_user_thread", (q) =>
        q.eq("userId", userId).eq("threadId", threadId),
      )
      .first();

    if (!thread) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Not authorized",
      });
    }

    const agentDoc = await ctx.db.get(thread.agentId);
    if (!agentDoc) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Agent not found" });
    }

    const agent = createAgent(agentDoc);
    const { messageId } = await agent.saveMessage(ctx, {
      threadId,
      prompt: prompt.trim(),
      skipEmbeddings: true,
    });

    await ctx.scheduler.runAfter(0, internal.chat.streamAsync, {
      threadId,
      promptMessageId: messageId,
      agentId: thread.agentId,
      organizationId: orgId,
      userId,
    });

    return { threadId };
  },
});

export const streamAsync = internalAction({
  args: {
    promptMessageId: v.string(),
    threadId: v.string(),
    agentId: v.id("agents"),
    organizationId: v.string(),
    userId: v.string(),
  },
  handler: async (
    ctx,
    { promptMessageId, threadId, agentId, organizationId, userId },
  ) => {
    const agentDoc = await ctx.runQuery(internal.agentsCreation.getAgent, {
      agentId,
    });
    if (!agentDoc) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Agent not found" });
    }

    const agent = createAgent(agentDoc);
    const formattingGuidance = `
    OUTPUT FORMAT:
    - **Language**: Respond in the user's language when you can detect it from their message. If the language is unclear or unsupported, respond in English.
    - **Structure**: Use clear headings (###), bullet points, and numbered lists.
    - **Visuals**: Use emojis sparingly to highlight key sections.
    - **Clarity**: Use **bold** for key values and labels (e.g., **Priority:** High).
    - **Conciseness**: Avoid walls of text. Be direct and easy to scan.
    - **Tone**: Professional, helpful, and action-oriented.
    `.trim();

    const result = await agent.streamText(
      { ...ctx, organizationId, userId } as ChatCtx,
      { threadId },
      {
        promptMessageId,
        messages: [{ role: "user", content: formattingGuidance }],
      },
      { saveStreamDeltas: { chunking: "word", throttleMs: 100 } },
    );
    await result.consumeStream();
  },
});
