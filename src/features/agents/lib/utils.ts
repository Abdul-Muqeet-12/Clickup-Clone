import type { Doc } from "../../../../convex/_generated/dataModel";
import {
  AVAILABLE_TOOLS,
  DEFAULT_AGENT_TOOLS,
} from "../../../../convex/lib/constants";
import { DAYS } from "./constants";

export function splitTools(tools: string[]): {
  defaultTools: string[];
  otherTools: string[];
} {
  const defaultToolsArray: string[] = DEFAULT_AGENT_TOOLS.map((t) => t.id);
  const defaultTools: string[] = [];
  const otherTools: string[] = [];

  for (const tool of tools) {
    if (defaultToolsArray.includes(tool)) {
      defaultTools.push(tool);
    } else {
      otherTools.push(tool);
    }
  }

  return { defaultTools, otherTools };
}

const TOOL_NAME_MAP = new Map<string, string>([
  ...AVAILABLE_TOOLS.map((tool) => [tool.id, tool.name] as const),
  ...DEFAULT_AGENT_TOOLS.map((tool) => [tool.id, tool.name] as const),
]);

export function getToolDisplayName(toolId: string): string {
  return TOOL_NAME_MAP.get(toolId) ?? humanizeToolId(toolId);
}

export function formatScheduleLabel(schedule: Doc<"agentSchedules">): string {
  const dayLabels = DAYS.reduce(
    (acc, d) => ({ ...acc, [d.value]: d.label }),
    {} as Record<number, string>,
  );
  const timeStr = schedule.timeOfDay;
  if (schedule.intervalType === "day") {
    return `Every ${schedule.intervalValue} day${schedule.intervalValue > 1 ? "s" : ""} at ${timeStr}`;
  }
  const days =
    schedule.daysOfWeek.length > 0
      ? schedule.daysOfWeek
          .sort((a, b) => a - b)
          .map((d) => dayLabels[d] ?? d)
          .join(", ")
      : "—";
  return `Every ${schedule.intervalValue} week${schedule.intervalValue > 1 ? "s" : ""} on ${days} at ${timeStr}`;
}

function humanizeToolId(toolId: string): string {
  const withSpaces = toolId
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}
