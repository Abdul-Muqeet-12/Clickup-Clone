"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const mockAgents = [
  {
    id: "agent-1",
    name: "AI Assistant",
  },
  {
    id: "agent-2",
    name: "Writing Assistant",
  },
  {
    id: "agent-3",
    name: "Coding Assistant",
  },
];

export function AgentsSidebarList() {
  const pathname = usePathname();

  return (
    <div className="mt-4 border-t pt-4">
      {mockAgents.length === 0 ? (
        <p className="flex items-center justify-center px-2 text-xs text-muted-foreground">
          No agents yet.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {mockAgents.map((agent) => {
            const href = `/dashboard/agents/${agent.id}`;
            const isActive = pathname === href;

            return (
              <Link
                key={agent.id}
                prefetch={false}
                href={href}
                className={cn(
                  "flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm rounded-md transition-colors hover:bg-muted",
                  isActive && "bg-muted",
                )}
              >
                <Avatar className="size-6">
                  <AvatarFallback>
                    {agent.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <p className="flex-1 truncate font-medium text-foreground">
                  {agent.name}
                </p>

                {isActive && <Check className="size-4" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
