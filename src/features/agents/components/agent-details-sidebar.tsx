"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Plus,
  Wrench,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

interface AgentDetailsSidebarProps {
  threadId: string;
}

const agentData: Record<
  string,
  {
    name: string;
    description: string;
    instructions: string;
    tools: string[];
  }
> = {
  "agent-1": {
    name: "AI Assistant",
    description: "A general-purpose assistant for everyday tasks.",
    instructions:
      "Help users with questions, explain concepts clearly, and provide useful suggestions.",
    tools: ["Web Search", "Text Generation"],
  },
  "agent-2": {
    name: "Writing Assistant",
    description: "An assistant for writing, editing, and improving content.",
    instructions:
      "Help users write clear content, improve grammar, and adjust tone for different audiences.",
    tools: ["Text Generation", "Writing Support"],
  },
  "agent-3": {
    name: "Coding Assistant",
    description: "An assistant for programming questions and code guidance.",
    instructions:
      "Help users understand programming concepts, review code, and suggest implementation approaches.",
    tools: ["Code Assistance", "Text Generation"],
  },
};

export function AgentDetailsSidebar({
  threadId,
}: AgentDetailsSidebarProps) {
  const router = useRouter();

  const agent = agentData[threadId] ?? {
    name: "Demo Agent",
    description: "A sample agent for previewing the interface.",
    instructions: "Instructions for this demo agent.",
    tools: ["Text Generation"],
  };

  const handleMessageAgent = () => {
    router.push(`/dashboard/chat/${threadId}`);
  };

  return (
    <aside className="w-full min-w-0 flex-1 shrink-0 overflow-y-auto border-l bg-background">
      <div className="sticky top-0 z-10 bg-background p-6">
        <div className="flex flex-col items-start gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">
              {agent.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="w-full min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold leading-tight">
              {agent.name}
            </h2>

            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
              {agent.description}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarFallback className="text-[9px]">
                  DEMO
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                Managed by{" "}
                <span className="font-medium text-foreground">
                  Demo User
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button
            className="flex-1 gap-2 shadow-none"
            size="sm"
            onClick={handleMessageAgent}
          >
            <MessageSquare className="size-4" />
            Message
          </Button>

          <Button
            variant="secondary"
            className="flex-1 gap-2 shadow-none"
            size="sm"
            onClick={() =>
              toast.info("Running an agent requires a backend integration.")
            }
          >
            Run agent
          </Button>
        </div>
      </div>

      <div className="py-4">
        <InstructionsSection instructions={agent.instructions} />

        <div className="p-8">
          <Separator className="bg-border/50" />
        </div>

        <TriggersSection />

        <div className="p-8">
          <Separator className="bg-border/50" />
        </div>

        <ToolsSection tools={agent.tools} />
      </div>
    </aside>
  );
}

function InstructionsSection({
  instructions,
}: {
  instructions: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-2">
        {isOpen ? (
          <ChevronDown className="size-3.5 text-muted-foreground/70" />
        ) : (
          <ChevronRight className="size-3.5 text-muted-foreground/70" />
        )}

        <span className="text-[15px] font-semibold">Instructions</span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-11 py-2 text-sm leading-6 text-muted-foreground">
          {instructions}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function TriggersSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-2">
        {isOpen ? (
          <ChevronDown className="size-3.5 text-muted-foreground/70" />
        ) : (
          <ChevronRight className="size-3.5 text-muted-foreground/70" />
        )}

        <Zap className="size-4 text-muted-foreground" />
        <span className="text-[15px] font-semibold">Triggers</span>
        <Badge variant="secondary" className="h-4 rounded-full px-1 text-[10px]">
          0
        </Badge>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-11 py-2">
          <p className="text-sm text-muted-foreground">
            No triggers configured in this demo.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ToolsSection({ tools }: { tools: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-2">
        {isOpen ? (
          <ChevronDown className="size-3.5 text-muted-foreground/70" />
        ) : (
          <ChevronRight className="size-3.5 text-muted-foreground/70" />
        )}

        <Wrench className="size-4 text-muted-foreground" />
        <span className="text-[15px] font-semibold">Tools</span>
        <Badge variant="secondary" className="h-4 rounded-full px-1 text-[10px]">
          {tools.length}
        </Badge>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-1 px-11 py-2">
          {tools.map((tool) => (
            <div key={tool} className="flex items-center gap-2 rounded-md py-1">
              <Wrench className="size-3.5 text-muted-foreground" />
              <span className="text-sm">{tool}</span>
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mt-2 h-8 w-full justify-start gap-2 text-muted-foreground"
            onClick={() =>
              toast.info("Adding tools requires backend functionality.")
            }
          >
            <Plus className="size-3.5" />
            Add tools
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}