import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    imageUrl: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_email", { searchField: "email" }),

  // Notifications
  notifications: defineTable({
    type: v.string(), // "birthday", "group_created", "greeting_received"
    targetUserId: v.id("users"), // Who sees the notification
    relatedUserId: v.optional(v.id("users")), // Whose birthday / Who added you / Who sent greeting
    groupId: v.optional(v.id("groups")), // Related group
    message: v.string(),
    isRead: v.boolean(),
    status: v.optional(v.string()), // "pending", "sent", "dismissed"
    createdAt: v.number(),
  })
    .index("by_user", ["targetUserId"])
    .index("by_user_and_status", ["targetUserId", "status"]),

  // Expenses
  expenses: defineTable({
    description: v.string(),
    amount: v.number(),
    category: v.optional(v.string()),
    date: v.number(), // timestamp
    paidByUserId: v.id("users"), // Reference to users table
    splitType: v.string(), // "equal", "percentage", "exact"
    splits: v.array(
      v.object({
        userId: v.id("users"), // Reference to users table
        amount: v.number(), // amount owed by this user
        paid: v.boolean(),
      })
    ),
    groupId: v.optional(v.id("groups")), // null for one-on-one expenses
    createdBy: v.id("users"), // Reference to users table
  })
    .index("by_group", ["groupId"])
    .index("by_user_and_group", ["paidByUserId", "groupId"])
    .index("by_date", ["date"]),

  // Settlements
  settlements: defineTable({
    amount: v.number(),
    note: v.optional(v.string()),
    date: v.number(), // timestamp
    paidByUserId: v.id("users"), // Reference to users table
    receivedByUserId: v.id("users"), // Reference to users table
    groupId: v.optional(v.id("groups")), // null for one-on-one settlements
    relatedExpenseIds: v.optional(v.array(v.id("expenses"))), // Which expenses this settlement covers
    createdBy: v.id("users"), // Reference to users table
    // Payment integration fields
    paymentMethod: v.optional(v.string()), // "razorpay" | "upi" | "cash"
    paymentStatus: v.optional(v.string()), // "pending" | "completed" | "failed"
    paymentId: v.optional(v.string()), // External payment ID (Razorpay order_id, transaction_id)
    paymentMetadata: v.optional(v.object({
      razorpayOrderId: v.optional(v.string()),
      razorpayPaymentId: v.optional(v.string()),
      razorpaySignature: v.optional(v.string()),
      upiTransactionId: v.optional(v.string()),
      upiQrData: v.optional(v.string()),
      timestamp: v.optional(v.number()),
    })),
  })
    .index("by_group", ["groupId"])
    .index("by_user_and_group", ["paidByUserId", "groupId"])
    .index("by_receiver_and_group", ["receivedByUserId", "groupId"])
    .index("by_date", ["date"]),

  // Groups
  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"), // Reference to users table
    members: v.array(
      v.object({
        userId: v.id("users"), // Reference to users table
        role: v.string(), // "admin" or "member"
        joinedAt: v.number(),
      })
    ),
  }),
});
