import { DEFAULT_AGENT_TOOLS } from "./constants";

export type DataRef = {
  type: "member" | "list" | "task" | "space";
  id: string;
  name: string;
};
export type ToolRef = {
  toolId: string;
  name: string;
};

// Format: {{type:id:name}} e.g. {{list:abc123:Lamy}} or {{space:xyz:En}}
export function parseDataRefs(text: string): DataRef[] {
  const regex = /\{\{(member|list|task|space):([^:}]+):([^}]+)\}\}/g;
  const refs: DataRef[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    refs.push({
      type: match[1] as DataRef["type"],
      id: match[2],
      name: match[3],
    });
  }
  return refs;
}

// Format: {{tool:toolId:name}} e.g. {{tool:updateTask:Update task}}
export function parseToolRefs(text: string): ToolRef[] {
  const regex = /\{\{tool:([^:}]+):([^}]+)\}\}/g;
  const refs: ToolRef[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    refs.push({
      toolId: match[1],
      name: match[2],
    });
  }
  return refs;
}

export function computeTools(instructions: string): string[] {
  const toolRefs = parseToolRefs(instructions);
  const instructionTools = toolRefs.map((r) => r.toolId);
  return [
    ...new Set([...DEFAULT_AGENT_TOOLS.map((t) => t.id), ...instructionTools]),
  ];
}
