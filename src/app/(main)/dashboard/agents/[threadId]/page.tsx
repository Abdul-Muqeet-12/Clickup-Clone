"use client";

import { useParams } from "next/navigation";
import { AgentChatSection } from "@/features/agents/components/agent-chat-section";
import { AgentDetailsSidebar } from "@/features/agents/components/agent-details-sidebar";

export default function Page() {
  const params = useParams<{ threadId: string }>();
  const threadId = params.threadId;

  return (
    <div className="flex size-full min-h-0 overflow-hidden">
      <AgentChatSection threadId={threadId} />
      <AgentDetailsSidebar threadId={threadId} />
    </div>
  );
}