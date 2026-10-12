"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SecondarySidebar } from "@/components/secondary-sidebar";
import SpacesSidebar from "@/features/spaces/components/spaces-sidebar";
import SpaceDialog from "@/features/spaces/components/create-space-dialog";
import { Plus } from "lucide-react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);

  return (
    <div className="flex flex-1 overflow-hidden">
      <SecondarySidebar
        title="Spaces"
        actions={
          <Button
            size="sm"
            onClick={() => setCreateSpaceOpen(true)}
            title="Create"
          >
            <Plus className="size-4" />
          </Button>
        }
      >
        <SpacesSidebar />
      </SecondarySidebar>
      <div className="flex-1 min-w-0">{children}</div>
      <SpaceDialog
        open={createSpaceOpen}
        onOpenChange={setCreateSpaceOpen}
        mode="create"
      />
    </div>
  );
}
