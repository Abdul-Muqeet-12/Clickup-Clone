import type { Id } from "../../../../convex/_generated/dataModel";
import type { Doc } from "../../../../convex/_generated/dataModel";

export type ChatThread = Doc<"chatThreads">;
export type ChatThreadId = Id<"chatThreads">;

export type AgentInfo = { _id: string; name: string } | null;
