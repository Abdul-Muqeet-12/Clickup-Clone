"use client";

import React, { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import InviteMemberDialog from "@/features/members/components/invite-member-dialog";
import MemberActions from "@/features/members/components/member-actions";
import MemberStatusBadge from "@/features/members/components/member-status-badge";
import {
  formatDate,
  getMemberDisplayName,
  getMemberInitials,
} from "@/lib/utils";
import { normalizeAdminMemberRole } from "@/features/members/lib/utils";

type DemoMember = {
  id: string;
  membershipId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  role: "admin" | "member";
  membershipStatus: "active";
  lastSignInAt: string;
  createdAt: string;
};

const INITIAL_MEMBERS: DemoMember[] = [
  {
    id: "user-1",
    membershipId: "membership-1",
    email: "admin@example.com",
    firstName: "Workspace",
    lastName: "Admin",
    profilePictureUrl: null,
    role: "admin",
    membershipStatus: "active",
    lastSignInAt: "2026-10-10T09:30:00.000Z",
    createdAt: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "user-2",
    membershipId: "membership-2",
    email: "sarah@example.com",
    firstName: "Sarah",
    lastName: "Johnson",
    profilePictureUrl: null,
    role: "member",
    membershipStatus: "active",
    lastSignInAt: "2026-10-09T12:00:00.000Z",
    createdAt: "2026-08-12T10:00:00.000Z",
  },
  {
    id: "user-3",
    membershipId: "membership-3",
    email: "alex@example.com",
    firstName: "Alex",
    lastName: "Morgan",
    profilePictureUrl: null,
    role: "member",
    membershipStatus: "active",
    lastSignInAt: "2026-10-08T14:15:00.000Z",
    createdAt: "2026-09-02T11:00:00.000Z",
  },
  {
    id: "user-4",
    membershipId: "membership-4",
    email: "jordan@example.com",
    firstName: "Jordan",
    lastName: "Lee",
    profilePictureUrl: null,
    role: "member",
    membershipStatus: "active",
    lastSignInAt: "2026-10-07T16:45:00.000Z",
    createdAt: "2026-09-15T09:00:00.000Z",
  },
];

export default function MembersTable() {
  const [members, setMembers] = useState<DemoMember[]>(INITIAL_MEMBERS);

  const currentUserId = "user-1";
  const currentUserRole = normalizeAdminMemberRole(
    members.find((member) => member.id === currentUserId)?.role,
  );

  const adminCount = members.filter(
    (member) => normalizeAdminMemberRole(member.role) === "admin",
  ).length;

  const canInvite = currentUserRole === "admin";

  const handleDemoAction = (message: string) => {
    toast.info(message);
  };

  return (
    <>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Team members</h2>
          <p className="text-xs text-muted-foreground">
            Manage workspace members and permissions.
          </p>
        </div>

        <InviteMemberDialog canInvite={canInvite} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Membership</TableHead>
            <TableHead>Last sign-in</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center">
                <span className="text-sm text-muted-foreground">
                  No members found yet.
                </span>
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => {
              const displayName = getMemberDisplayName(member);
              const initials = getMemberInitials(member);
              const role = normalizeAdminMemberRole(member.role);

              return (
                <TableRow key={member.membershipId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={member.profilePictureUrl || undefined}
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {member.email}
                        </span>

                        {displayName && (
                          <span className="text-xs text-muted-foreground">
                            {displayName}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm capitalize">
                    {role}
                  </TableCell>

                  <TableCell>
                    <MemberStatusBadge status={member.membershipStatus} />
                  </TableCell>

                  <TableCell className="text-sm">
                    {formatDate(member.lastSignInAt)}
                  </TableCell>

                  <TableCell className="text-sm">
                    {formatDate(member.createdAt)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <MemberActions
                        member={{ ...member, role }}
                        currentUserId={currentUserId}
                        currentUserRole={currentUserRole}
                        adminCount={adminCount}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </>
  );
}