
"use client";

import { MoreHorizontal, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  MemberRole,
  MembershipStatus,
} from "@/features/members/lib/types";

export type MemberRowItem = {
  id: string;
  email: string;
  membershipId: string;
  role: MemberRole;
  membershipStatus: MembershipStatus;
};

type MemberActionsProps = {
  member: MemberRowItem;
  currentUserId?: string | null;
  currentUserRole: MemberRole;
  adminCount: number;
};

export default function MemberActions({
  member,
  currentUserId,
  currentUserRole,
  adminCount,
}: MemberActionsProps) {
  const isSelf = member.id === currentUserId;
  const canManage = currentUserRole === "admin" && !isSelf;
  const canLeave =
    isSelf && (currentUserRole === "member" || adminCount >= 2);
  const canRemove = currentUserRole === "admin" && !isSelf;

  if (!canManage && !canLeave) return null;

  const demoAction = (message: string) => {
    toast.success(`${message} (Demo mode only)`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label={`Actions for ${member.email}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {canLeave && (
          <DropdownMenuItem
            onSelect={() => demoAction("Leave workspace action selected.")}
            className="text-destructive"
          >
            Leave workspace
          </DropdownMenuItem>
        )}

        {canManage && (
          <>
            {member.role !== "member" && (
              <DropdownMenuItem
                onSelect={() => demoAction("Member role changed to member.")}
              >
                Set as member
              </DropdownMenuItem>
            )}

            {member.role !== "admin" && (
              <DropdownMenuItem
                onSelect={() => demoAction("Member role changed to admin.")}
              >
                Set as admin
              </DropdownMenuItem>
            )}

            {(member.role === "member" || member.role === "admin") && (
              <DropdownMenuSeparator />
            )}

            {member.membershipStatus !== "pending" &&
              (member.membershipStatus === "inactive" ? (
                <DropdownMenuItem
                  onSelect={() => demoAction("Member reactivated.")}
                >
                  <UserPlus className="size-4" />
                  Reactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() => demoAction("Member deactivated.")}
                >
                  <UserMinus className="size-4" />
                  Deactivate
                </DropdownMenuItem>
              ))}

            {canRemove && (
              <DropdownMenuItem
                onSelect={() => demoAction("Remove member action selected.")}
                className="text-destructive"
              >
                Remove member
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
