import { v, ConvexError } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getOrganizationId, getUserId } from "./auth";
import { STATUSES } from "./lib/constants";
import { Id } from "./_generated/dataModel";
import { createAgent } from "./chat";
import { internal } from "./_generated/api";

async function triggerAssignedAgents(
  ctx: MutationCtx,
  taskId: Id<"tasks">,
  assigneeIds: string[],
  organizationId: string,
  userId: string,
  previousAssigneeIds: string[] = [],
) {
  const newlyAssignedIds = assigneeIds.filter(
    (id) => !previousAssigneeIds.includes(id),
  );
  if (!newlyAssignedIds.length) return;

  const agents = await ctx.db
    .query("agents")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();
  const agentMap = new Map(agents.map((a) => [a._id as string, a]));

  for (const assigneeId of newlyAssignedIds) {
    const agentDoc = agentMap.get(assigneeId);
    if (!agentDoc?.isActive || !agentDoc.manualTriggers?.assignTask) continue;

    const { _id: agentId } = agentDoc;
    const agent = createAgent({
      name: agentDoc.name,
      instructions: agentDoc.instructions,
      tools: agentDoc.tools,
    });

    const existingThread = await ctx.db
      .query("chatThreads")
      .withIndex("by_user_agent", (q) =>
        q.eq("userId", userId).eq("agentId", agentId),
      )
      .first();

    let threadId: string;
    if (existingThread) {
      threadId = existingThread.threadId;
    } else {
      const newThread = await agent.createThread(ctx, { userId });
      threadId = newThread.threadId;
      await ctx.db.insert("chatThreads", {
        threadId,
        userId,
        agentId,
        createdAt: Date.now(),
      });
    }

    const task = await ctx.db.get(taskId);
    if (!task) continue;

    const prompt = `Task assigned: ${task.title}`;

    const { messageId } = await agent.saveMessage(ctx, {
      threadId,
      prompt,
      skipEmbeddings: true,
    });
    await ctx.scheduler.runAfter(0, internal.chat.streamAsync, {
      threadId,
      promptMessageId: messageId,
      agentId,
      organizationId,
      userId,
    });
  }
}

export const listByList = query({
  args: {
    listId: v.id("lists"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { listId, paginationOpts }) => {
    const org_id = await getOrganizationId(ctx);

    return ctx.db
      .query("tasks")
      .withIndex("by_organizationId_and_listId", (q) =>
        q.eq("organizationId", org_id).eq("listId", listId),
      )
      .order("asc")
      .paginate(paginationOpts);
  },
});

export const listByListAndStatus = query({
  args: {
    listId: v.id("lists"),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("complete"),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { listId, status, paginationOpts }) => {
    const org_id = await getOrganizationId(ctx);

    const list = await ctx.db.get(listId);
    if (!list) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "List not found",
      });
    }
    if (list.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to view tasks in this list",
      });
    }

    return ctx.db
      .query("tasks")
      .withIndex("by_org_list_status_sort", (q) =>
        q
          .eq("organizationId", org_id)
          .eq("listId", listId)
          .eq("status", status),
      )
      .order("asc")
      .paginate(paginationOpts);
  },
});

export const create = mutation({
  args: {
    listId: v.id("lists"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("complete"),
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("urgent"),
      ),
    ),
    assigneeIds: v.optional(v.array(v.string())),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx);
    const userId = await getUserId(ctx);
    const now = Date.now();

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "List not found",
      });
    }
    if (list.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to create tasks in this list",
      });
    }

    const lastTask = await ctx.db
      .query("tasks")
      .withIndex("by_list_status_and_sort", (q) =>
        q.eq("listId", args.listId).eq("status", args.status),
      )
      .order("desc")
      .first();

    const sortOrder = lastTask ? lastTask.sortOrder + 1 : 0;

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      listId: args.listId,
      status: args.status,
      sortOrder,
      priority: args.priority,
      assigneeIds: args.assigneeIds ?? [],
      startDate: args.startDate,
      dueDate: args.dueDate,
      organizationId: org_id,
      createdAt: now,
      updatedAt: now,
    });

    if (args.assigneeIds?.length) {
      await triggerAssignedAgents(
        ctx,
        taskId,
        args.assigneeIds,
        org_id,
        userId,
      );
    }

    return taskId;
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in-progress"),
        v.literal("complete"),
      ),
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("urgent"),
      ),
    ),
    assigneeIds: v.optional(v.array(v.string())),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx);
    const userId = await getUserId(ctx);

    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }
    if (task.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to update this task",
      });
    }

    let sortOrder = task.sortOrder;
    if (args.status !== undefined && args.status !== task.status) {
      const newStatus: "todo" | "in-progress" | "complete" = args.status;
      const lastTask = await ctx.db
        .query("tasks")
        .withIndex("by_list_status_and_sort", (q) =>
          q.eq("listId", task.listId).eq("status", newStatus),
        )
        .order("desc")
        .first();
      sortOrder = lastTask ? lastTask.sortOrder + 1 : 0;
    }

    await ctx.db.patch(args.id, {
      ...(args.title !== undefined && { title: args.title }),
      description: args.description,
      ...(args.status !== undefined && { status: args.status }),
      ...(args.status !== undefined &&
        args.status !== task.status && { sortOrder }),
      priority: args.priority,
      assigneeIds: args.assigneeIds,
      startDate: args.startDate,
      dueDate: args.dueDate,
      updatedAt: Date.now(),
    });

    const previousAssigneeIds = task.assigneeIds ?? [];
    const newAssigneeIds = args.assigneeIds ?? [];
    const hasNewAssignees = newAssigneeIds.some(
      (id) => !previousAssigneeIds.includes(id),
    );
    if (hasNewAssignees) {
      await triggerAssignedAgents(
        ctx,
        args.id,
        newAssigneeIds,
        org_id,
        userId,
        previousAssigneeIds,
      );
    }
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("complete"),
    ),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx);

    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }
    if (task.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to update this task",
      });
    }

    const validStatuses = Object.values(STATUSES);
    if (
      !validStatuses.includes(args.status as (typeof validStatuses)[number])
    ) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Invalid status value",
      });
    }

    return ctx.db.patch(args.id, {
      status: args.status,
      sortOrder: args.sortOrder,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx);

    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }
    if (task.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to delete this task",
      });
    }

    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    listId: v.id("lists"),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("complete"),
    ),
    orderedIds: v.array(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx);
    const now = Date.now();

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "List not found",
      });
    }
    if (list.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to reorder tasks in this list",
      });
    }

    const validStatuses = Object.values(STATUSES);
    if (
      !validStatuses.includes(args.status as (typeof validStatuses)[number])
    ) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Invalid status value",
      });
    }

    for (let i = 0; i < args.orderedIds.length; i++) {
      const task = await ctx.db.get(args.orderedIds[i]);
      if (!task) {
        throw new ConvexError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }
      if (task.organizationId !== org_id) {
        throw new ConvexError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to reorder this task",
        });
      }
      if (task.listId !== args.listId) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Task does not belong to the specified list",
        });
      }

      await ctx.db.patch(args.orderedIds[i], {
        status: args.status,
        sortOrder: i,
        updatedAt: now,
      });
    }
  },
});
