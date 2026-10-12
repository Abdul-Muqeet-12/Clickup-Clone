export const STATUSES = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  COMPLETE: "complete",
} as const;

export const STATUS_LIST = [
  { id: "todo", name: "To Do", color: "#6b7280" },
  { id: "in-progress", name: "In Progress", color: "#8b5cf6" },
  { id: "complete", name: "Complete", color: "#10b981" },
] as const;

export const PRIORITIES = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const PRIORITY_LIST = [
  { id: "low", name: "Low" },
  { id: "normal", name: "Normal" },
  { id: "high", name: "High" },
  { id: "urgent", name: "Urgent" },
] as const;

export type Status = (typeof STATUSES)[keyof typeof STATUSES];
export type Priority = (typeof PRIORITIES)[keyof typeof PRIORITIES];

export const AVAILABLE_TOOLS = [
  { id: "createSpace", name: "Create space" },
  { id: "updateSpace", name: "Update space" },
  { id: "createList", name: "Create list" },
  { id: "updateList", name: "Update list" },
  { id: "createTask", name: "Create task" },
  { id: "updateTask", name: "Update task" },
] as const;

export const DEFAULT_AGENT_TOOLS = [
  { id: "listSpaces", name: "List spaces" },
  { id: "getSpace", name: "Get space" },
  { id: "findSpaceByName", name: "Find space by name" },
  { id: "listListsBySpace", name: "List lists by space" },
  { id: "getList", name: "Get list" },
  { id: "findListByName", name: "Find list by name" },
  { id: "listTasks", name: "List tasks" },
  { id: "getTask", name: "Get task" },
  { id: "findTask", name: "Find task by name" },
  { id: "listMembers", name: "List members" },
] as const;
