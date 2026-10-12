"use node";

import { WorkOS } from "@workos-inc/node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

export const listMembersIds = internalAction({
  args: {
    organizationId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { organizationId, limit }) => {
    const workos = new WorkOS({ apiKey: process.env.WORKOS_API_KEY });
    const members = await workos.userManagement.listOrganizationMemberships({
      organizationId: organizationId,
      limit: limit,
    });

    const membersWithNames = await Promise.all(
      members.data.map(async (membership) => {
        const user = await workos.userManagement.getUser(membership.userId);
        const name = `${user.firstName} ${user.lastName}`.trim();
        return {
          userId: membership.userId,
          name: name,
        };
      }),
    );

    return membersWithNames;
  },
});

export const listMembersWithDetails = internalAction({
  args: {
    organizationId: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { organizationId, limit = 100, cursor }) => {
    const workos = new WorkOS({ apiKey: process.env.WORKOS_API_KEY });
    const memberships = await workos.userManagement.listOrganizationMemberships(
      {
        organizationId,
        limit,
        after: cursor,
        order: "desc",
        statuses: ["active", "inactive", "pending"],
      },
    );

    const membersWithDetails = await Promise.all(
      memberships.data.map(async (membership) => {
        const user = await workos.userManagement.getUser(membership.userId);
        const fullName =
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
        const name = fullName || (user.email ?? "");
        return {
          id: user.id,
          name,
          avatar: user.profilePictureUrl ?? null,
          email: user.email ?? "",
          lastSignInAt: user.lastSignInAt ?? null,
        };
      }),
    );

    const nextCursor = memberships.listMetadata?.after ?? null;
    return {
      members: membersWithDetails,
      nextCursor,
      isDone: nextCursor === null,
    };
  },
});
