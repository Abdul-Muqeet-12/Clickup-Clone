
"use client";

import React from "react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InvitationActions from "@/features/invitations/components/invitation-actions";
import InvitationStatusBadge from "@/features/invitations/components/invitation-status-badge";

import { formatDate } from "@/lib/utils";

type DemoInvitation = {
  id: string;
  email: string;
  createdAt: Date;
  state: "pending" | "accepted" | "expired";
};

const initialInvitations: DemoInvitation[] = [
  {
    id: "invitation-1",
    email: "sarah@example.com",
    createdAt: new Date("2026-10-08T10:00:00"),
    state: "pending",
  },
  {
    id: "invitation-2",
    email: "alex@example.com",
    createdAt: new Date("2026-10-06T14:30:00"),
    state: "accepted",
  },
  {
    id: "invitation-3",
    email: "jordan@example.com",
    createdAt: new Date("2026-10-04T09:15:00"),
    state: "expired",
  },
];

export default function InvitationsTable() {
  const [invitations, setInvitations] =
    React.useState<DemoInvitation[]>(initialInvitations);

  const handleInvitationAction = (message: string) => {
    toast.success(`${message} Demo mode only.`);
  };

  return (
    <>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Invitations</h2>
          <p className="text-xs text-muted-foreground">
            Manage member invitations.
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Sent at</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {invitations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center">
                <span className="text-sm text-muted-foreground">
                  No invitations found.
                </span>
              </TableCell>
            </TableRow>
          ) : (
            invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="text-sm font-medium">
                  {invitation.email}
                </TableCell>

                <TableCell className="text-sm">
                  {formatDate(invitation.createdAt.toISOString())}
                </TableCell>

                <TableCell>
                  <InvitationStatusBadge state={invitation.state} />
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <InvitationActions
                      invitationId={invitation.id}
                      isAdmin={true}
                      state={invitation.state}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
