import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const create = internalMutation({
    args: {
        type: v.string(), // "birthday", "group_created", "greeting_received"
        targetUserId: v.id("users"),
        relatedUserId: v.optional(v.id("users")),
        groupId: v.optional(v.id("groups")),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            type: args.type,
            targetUserId: args.targetUserId,
            relatedUserId: args.relatedUserId,
            groupId: args.groupId,
            message: args.message,
            isRead: false,
            status: "pending",
            createdAt: Date.now(),
        });
    },
});

export const list = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);
        return await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("targetUserId", user._id))
            .order("desc")
            .collect();
    },
});

export const markAsRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        // optional: verify ownership
        await ctx.db.patch(args.notificationId, { isRead: true });
    },
});

export const sendGreeting = mutation({
    args: {
        notificationId: v.id("notifications"), // Original notification prompting the greeting
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);
        const notification = await ctx.db.get(args.notificationId);

        if (!notification) throw new Error("Notification not found");

        // Mark the original notification as "sent" or "interacted" if we want to change UI state?
        // Requirement says "Greeting is user-initiated only". 
        // Maybe we just mark it read or keep it? 
        // Usually we update the status to prevent re-sending.
        await ctx.db.patch(args.notificationId, { status: "sent", isRead: true });

        // Send a reciprocal notification to the person getting the greeting
        if (notification.relatedUserId) {
            let reciprocalMessage = `${user.name} sent you a greeting!`;
            if (notification.type === "birthday") {
                reciprocalMessage = `${user.name} wished you a happy birthday: "${args.message}"`;
            } else if (notification.type === "group_created") {
                reciprocalMessage = `${user.name} welcomed you to the group: "${args.message}"`;
            }

            await ctx.db.insert("notifications", {
                type: "greeting_received",
                targetUserId: notification.relatedUserId,
                relatedUserId: user._id,
                groupId: notification.groupId,
                message: reciprocalMessage,
                isRead: false,
                status: "pending",
                createdAt: Date.now(),
            });
        }
    },
});

export const checkAndCreateBirthdayNotifications = mutation({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);
        if (!user) return;

        // 1. Get close contacts logic (reused/inlined for reliability)
        const allGroups = await ctx.db.query("groups").collect();
        const userGroups = allGroups.filter((group) =>
            group.members.some((member) => member.userId === user._id)
        );

        const contactIds = new Set();
        userGroups.forEach(group => {
            group.members.forEach(member => {
                if (member.userId !== user._id) {
                    contactIds.add(member.userId);
                }
            });
        });

        // 2. Filter contacts for those who have birthday TODAY
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        const contacts = await Promise.all(
            Array.from(contactIds).map(async (id) => await ctx.db.get(id))
        );

        for (const contact of contacts) {
            if (!contact || !contact.dateOfBirth) continue;

            const parts = contact.dateOfBirth.split("-");
            if (parts.length !== 3) continue;

            const bMonth = parseInt(parts[1]);
            const bDay = parseInt(parts[2]);

            if (bMonth === month && bDay === day) {
                // It is their birthday!
                // Check if we already have a notification for THIS birthday today
                const existing = await ctx.db.query("notifications")
                    .withIndex("by_user", (q) => q.eq("targetUserId", user._id))
                    .filter((q) =>
                        q.eq(q.field("type"), "birthday") &&
                        q.eq(q.field("relatedUserId"), contact._id)
                    )
                    .collect();

                // Check if any existing notification was created TODAY (since midnight)
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                const alreadyNotified = existing.some(n => n.createdAt > todayStart.getTime());

                if (!alreadyNotified) {
                    await ctx.db.insert("notifications", {
                        type: "birthday",
                        targetUserId: user._id, // I am the target of this reminder
                        relatedUserId: contact._id,
                        message: `Today is ${contact.name}'s birthday — send wishes?`,
                        isRead: false,
                        status: "pending",
                        createdAt: Date.now(),
                    });
                }
            }
        }
    }
});
