import { components, internal } from "./_generated/api";
import { Crons } from "@convex-dev/crons";
import { ConvexError, v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { getOrganizationId } from "./auth";
import { createAgent } from "./chat";

const crons = new Crons(components.crons);

export const runScheduledAgent = internalMutation({
  args: {
    scheduleId: v.id("agentSchedules"),
  },
  handler: async (ctx, { scheduleId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) {
      const cronName = `agent-schedule-${scheduleId}`;
      try {
        await crons.delete(ctx, { name: cronName });
      } catch (error) {
        console.warn("Failed to delete orphaned cron:", error);
      }
      return;
    }

    if (!schedule.isActive) {
      return;
    }

    const now = Date.now();

    if (schedule.startDate > now) {
      return;
    }

    if (schedule.endDate != null && schedule.endDate < now) {
      if (schedule.cronId) {
        try {
          await crons.delete(ctx, { id: schedule.cronId });
        } catch (error) {
          console.warn("Failed to delete cron job:", error);
        }
      }
      await ctx.db.delete(scheduleId);
      return;
    }

    await ctx.db.patch(scheduleId, {
      lastRunAt: now,
      updatedAt: now,
    });

    const agentDoc = await ctx.runQuery(internal.agentsCreation.getAgent, {
      agentId: schedule.agentId,
    });

    if (!agentDoc) {
      console.warn(
        `Agent ${schedule.agentId} not found for schedule ${scheduleId}`,
      );
      return;
    }

    const userId = agentDoc.ownerId;
    const organizationId = agentDoc.organizationId;

    const agent = createAgent({
      name: agentDoc.name,
      instructions: agentDoc.instructions,
      tools: agentDoc.tools,
    });

    const existingThread = await ctx.db
      .query("chatThreads")
      .withIndex("by_user_agent", (q) =>
        q.eq("userId", userId).eq("agentId", schedule.agentId),
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
        agentId: schedule.agentId,
        createdAt: Date.now(),
      });
    }

    const prompt =
      schedule.instructions?.trim() || "Execute your scheduled task.";

    const { messageId } = await agent.saveMessage(ctx, {
      threadId,
      prompt,
      skipEmbeddings: true,
    });

    await ctx.scheduler.runAfter(0, internal.chat.streamAsync, {
      threadId,
      promptMessageId: messageId,
      agentId: schedule.agentId,
      organizationId,
      userId,
    });
  },
});

export const createAgentSchedule = mutation({
  args: {
    agentId: v.id("agents"),
    intervalType: v.union(v.literal("day"), v.literal("week")),
    intervalValue: v.number(),
    daysOfWeek: v.array(
      v.union(
        v.literal(0),
        v.literal(1),
        v.literal(2),
        v.literal(3),
        v.literal(4),
        v.literal(5),
        v.literal(6),
      ),
    ),
    timeOfDay: v.string(),
    timezone: v.string(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const organizationId = await getOrganizationId(ctx);

    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Agent not found",
      });
    }
    if (agent.organizationId !== organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to create schedules for this agent",
      });
    }

    const [hours, minutes] = args.timeOfDay.split(":").map(Number);

    let cronspec: string;
    if (args.intervalType === "day") {
      cronspec = `${minutes} ${hours} * * *`;
    } else {
      const cronDays = args.daysOfWeek
        .sort((a, b) => a - b)
        .join(",");
      cronspec = `${minutes} ${hours} * * ${cronDays}`;
    }

    const now = Date.now();
    const scheduleId = await ctx.db.insert("agentSchedules", {
      agentId: args.agentId,
      intervalType: args.intervalType,
      intervalValue: args.intervalValue,
      daysOfWeek: args.daysOfWeek,
      timeOfDay: args.timeOfDay,
      timezone: args.timezone,
      startDate: args.startDate,
      endDate: args.endDate,
      instructions: args.instructions,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const cronName = `agent-schedule-${scheduleId}`;
    const cronId = await crons.register(
      ctx,
      {
        kind: "cron",
        cronspec,
        tz: args.timezone,
      },
      internal.cronJobs.runScheduledAgent,
      {
        scheduleId,
      },
      cronName,
    );

    await ctx.db.patch(scheduleId, {
      cronId,
      updatedAt: Date.now(),
    });

    return scheduleId;
  },
});

export const deleteAgentSchedule = mutation({
  args: {
    scheduleId: v.id("agentSchedules"),
  },
  handler: async (ctx, { scheduleId }) => {
    const organizationId = await getOrganizationId(ctx);

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Schedule not found",
      });
    }

    const agent = await ctx.db.get(schedule.agentId);
    if (!agent) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Agent not found",
      });
    }
    if (agent.organizationId !== organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to delete this schedule",
      });
    }

    if (schedule.cronId) {
      try {
        await crons.delete(ctx, { id: schedule.cronId });
      } catch (error) {
        console.warn("Failed to delete cron job:", error);
      }
    }

    await ctx.db.delete(scheduleId);
  },
});
