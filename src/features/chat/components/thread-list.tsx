"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const mockAgents = [
  {
    _id: "agent-1",
    name: "AI Assistant",
    avatar: "",
  },
  {
    _id: "agent-2",
    name: "Writing Assistant",
    avatar: "",
  },
  {
    _id: "agent-3",
    name: "Coding Assistant",
    avatar: "",
  },
];

export function ThreadList() {
  const router = useRouter();
  const [navigatingAgentId, setNavigatingAgentId] = useState<string | null>(
    null,
  );

  const handleAgentClick = (agentId: string) => {
    setNavigatingAgentId(agentId);

    router.push(`/dashboard/chat/${agentId}`);
  };

  return (
    <div className="flex flex-col gap-0.5">
      {mockAgents.length === 0 ? (
        <div className="px-2 py-4">
          <p className="text-center text-sm text-muted-foreground">
            No agents yet.
          </p>
        </div>
      ) : (
        mockAgents.map((agent) => {
          const isNavigating = navigatingAgentId === agent._id;

          return (
            <button
              key={agent._id}
              type="button"
              onClick={() => handleAgentClick(agent._id)}
              disabled={isNavigating}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-colors hover:bg-muted",
              )}
            >
              <Avatar className="size-6 shrink-0">
                <AvatarImage
                  src={agent.avatar}
                  alt={`${agent.name} avatar`}
                />
                <AvatarFallback className="bg-muted text-xs">
                  {agent.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {agent.name}
                </p>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
