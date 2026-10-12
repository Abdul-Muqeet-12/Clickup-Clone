
"use client";

import { MoreHorizontal, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InvitationState } from "@/features/invitations/lib/types";

type InvitationActionsProps = {
  invitationId: string;
  isAdmin: boolean;
  state: InvitationState;
};

export default function InvitationActions({
  invitationId,
  isAdmin,
  state,
}: InvitationActionsProps) {
  if (!isAdmin || state !== "pending") return null;

  const handleResend = () => {
    toast.success("Demo: Invitation resend action selected.");
  };

  const handleRevoke = () => {
    toast.success("Demo: Invitation revoke action selected.");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label={`Actions for invitation ${invitationId}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={handleResend}>
          <RotateCcw className="size-4" />
          Resend
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={handleRevoke}
          className="text-destructive"
        >
          <X className="size-4" />
          Revoke
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
