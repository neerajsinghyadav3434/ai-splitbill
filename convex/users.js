import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    // Note: If you don't want to define an index right away, you can use
    // ctx.db.query("users")
    //  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
    //  .unique();
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (user !== null) {
      // If we've seen this identity before but the name has changed, patch the value.
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      return user._id;
    }
    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      imageUrl: identity.pictureUrl,
    });
  },
});

// Get current user
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});

// Search users by name or email (for adding participants)
export const searchUsers = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // Use centralized getCurrentUser function
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    // Don't search if query is too short
    if (args.query.length < 2) {
      return [];
    }

    // Search by name using search index
    const nameResults = await ctx.db
      .query("users")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .collect();

    // Search by email using search index
    const emailResults = await ctx.db
      .query("users")
      .withSearchIndex("search_email", (q) => q.search("email", args.query))
      .collect();

    // Combine results (removing duplicates)
    const users = [
      ...nameResults,
      ...emailResults.filter(
        (email) => !nameResults.some((name) => name._id === email._id)
      ),
    ];

    // Exclude current user and format results
    return users
      .filter((user) => user._id !== currentUser._id)
      .map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      }));
  },
});

// Update user profile (e.g. date of birth)
export const updateProfile = mutation({
  args: {
    dateOfBirth: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const patchData = {};
    if (args.dateOfBirth !== undefined) {
      patchData.dateOfBirth = args.dateOfBirth;

      // Check if the new birthday is today
      if (args.dateOfBirth) {
        const parts = args.dateOfBirth.split("-");
        // format: YYYY-MM-DD
        if (parts.length === 3) {
          const today = new Date();
          const month = today.getMonth() + 1;
          const day = today.getDate();

          if (parseInt(parts[1]) === month && parseInt(parts[2]) === day) {
            // It's today! Schedule notification
            await ctx.scheduler.runAfter(0, internal.users.sendBirthdayNotifications, { userId: user._id });
          }
        }
      }
    }

    await ctx.db.patch(user._id, patchData);
  },
});

// Internal mutation to send birthday notifications immediately
export const sendBirthdayNotifications = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return;

    // Get contacts logic (duplicated for now to avoid refactoring getCloseContacts massively, 
    // or we can extract helper. Let's inline for safety/speed)
    const allGroups = await ctx.db.query("groups").collect();
    const userGroups = allGroups.filter((group) =>
      group.members.some((member) => member.userId === userId)
    );

    const contactIds = new Set();
    userGroups.forEach(group => {
      group.members.forEach(member => {
        if (member.userId !== userId) {
          contactIds.add(member.userId);
        }
      });
    });

    // Send notifications
    for (const contactId of contactIds) {
      // Check for existing notification from today
      const existing = await ctx.db.query("notifications")
        .withIndex("by_user", q => q.eq("targetUserId", contactId))
        .filter(q => q.eq(q.field("type"), "birthday") && q.eq(q.field("relatedUserId"), userId))
        .collect();

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const alreadySent = existing.some(n => n.createdAt > todayStart.getTime());

      if (!alreadySent) {
        await ctx.db.insert("notifications", {
          type: "birthday",
          targetUserId: contactId,
          relatedUserId: userId,
          message: `Today is ${user.name}'s birthday — send wishes?`,
          isRead: false,
          status: "pending",
          createdAt: Date.now(),
        });
      }
    }
  }
});

// Get close contacts (users who share at least one group with the current user)
export const getCloseContacts = query({
  handler: async (ctx) => {
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    // 1. Get all groups this user is a member of
    const allGroups = await ctx.db.query("groups").collect();
    const userGroups = allGroups.filter((group) =>
      group.members.some((member) => member.userId === currentUser._id)
    );

    // 2. Collect all unique user IDs from these groups (excluding current user)
    const contactIds = new Set();
    userGroups.forEach(group => {
      group.members.forEach(member => {
        if (member.userId !== currentUser._id) {
          contactIds.add(member.userId);
        }
      });
    });

    // 3. Fetch user details for these contacts
    const contacts = await Promise.all(
      Array.from(contactIds).map(async (userId) => {
        const user = await ctx.db.get(userId);
        if (!user) return null;
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          dateOfBirth: user.dateOfBirth,
        };
      })
    );

    return contacts.filter(c => c !== null);
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  }
});

