import { SecondarySidebar } from "@/components/secondary-sidebar";
import React from "react";
import { ThreadList } from "@/features/chat/components/thread-list";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-1 overflow-hidden">
      <SecondarySidebar title="Chat">
        <div className="flex flex-1 flex-col overflow-hidden p-2">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ThreadList />
          </div>
        </div>
      </SecondarySidebar>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default layout;
