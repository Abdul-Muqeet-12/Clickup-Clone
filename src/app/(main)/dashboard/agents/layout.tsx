"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SecondarySidebar } from "@/components/secondary-sidebar";
import { AgentsSidebarList } from "@/features/agents/components/agents-sidebar-list";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-1 overflow-hidden">
      <SecondarySidebar title="AI Agents">
        <div className="flex flex-col gap-2 p-2">
          <Button size="sm" className="w-full justify-start gap-2" asChild>
            <Link href="/dashboard/agents" prefetch={true}>
              <Plus className="size-4" />
              New Super Agent
            </Link>
          </Button>
          <AgentsSidebarList />
        </div>
      </SecondarySidebar>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default layout;
