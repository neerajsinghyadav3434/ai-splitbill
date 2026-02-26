import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Razorpay credentials (test mode)
const RAZORPAY_KEY_ID = "rzp_test_RA1AUogXD8OjPG";
const RAZORPAY_KEY_SECRET = "J3ycOP7n19Wgtj6tI72vmXca";

/**
 * Generate UPI payment string for QR code
 * Format: upi://pay?pa=PAYEE_VPA&pn=PAYEE_NAME&am=AMOUNT&cu=INR&tn=NOTE
 */
export const generateUpiQrData = query({
    args: {
        payeeUpiId: v.string(), // UPI ID of the person receiving payment
        payeeName: v.string(),
        amount: v.number(),
        note: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Construct UPI payment string
        const upiString = `upi://pay?pa=${encodeURIComponent(args.payeeUpiId)}&pn=${encodeURIComponent(
            args.payeeName
        )}&am=${args.amount}&cu=INR${args.note ? `&tn=${encodeURIComponent(args.note)}` : ""}`;

        return {
            upiString,
            qrData: upiString,
            displayData: {
                payeeName: args.payeeName,
                payeeUpiId: args.payeeUpiId,
                amount: args.amount,
                note: args.note,
            },
        };
    },
});

/**
 * Create a Razorpay order (server-side only due to secret key)
 * This would typically use Razorpay SDK, but for Convex we'll use fetch
 */
export const createRazorpayOrder = mutation({
    args: {
        amount: v.number(), // in rupees
        currency: v.optional(v.string()),
        receipt: v.string(), // unique receipt id
        notes: v.optional(v.object({
            settlementNote: v.optional(v.string()),
            payerName: v.optional(v.string()),
            payeeName: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const caller = await ctx.runQuery(internal.users.getCurrentUser);

        // Convert amount to paisa
        const amountInPaisa = Math.round(args.amount * 100);

        // In a real implementation, we would call Razorpay API
        // For development mode, we'll create a mock order
        const isDev = RAZORPAY_KEY_ID.includes("test");

        if (isDev) {
            // Mock order for development
            const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            return {
                id: orderId,
                entity: "order",
                amount: amountInPaisa,
                amount_paid: 0,
                amount_due: amountInPaisa,
                currency: args.currency || "INR",
                receipt: args.receipt,
                status: "created",
                attempts: 0,
                notes: args.notes || {},
                created_at: Math.floor(Date.now() / 1000),
            };
        }

        // TODO: Implement production Razorpay API integration
        throw new Error("Production Razorpay integration not yet implemented");
    },
});

/**
 * Verify Razorpay payment signature
 * This ensures the payment callback is legitimate
 */
export const verifyRazorpayPayment = mutation({
    args: {
        orderId: v.string(),
        paymentId: v.string(),
        signature: v.string(),
        settlementId: v.id("settlements"),
    },
    handler: async (ctx, args) => {
        const caller = await ctx.runQuery(internal.users.getCurrentUser);

        // Get the settlement
        const settlement = await ctx.db.get(args.settlementId);
        if (!settlement) {
            throw new Error("Settlement not found");
        }

        // Verify user is authorized
        if (settlement.paidByUserId !== caller._id && settlement.receivedByUserId !== caller._id) {
            throw new Error("Unauthorized to update this settlement");
        }

        // In development mode, accept any signature
        const isDev = RAZORPAY_KEY_ID.includes("test");

        if (isDev) {
            // Update settlement with payment details
            await ctx.db.patch(args.settlementId, {
                paymentStatus: "completed",
                paymentMethod: "razorpay",
                paymentId: args.paymentId,
                paymentMetadata: {
                    razorpayOrderId: args.orderId,
                    razorpayPaymentId: args.paymentId,
                    razorpaySignature: args.signature,
                    timestamp: Date.now(),
                },
            });

            return { verified: true, status: "completed" };
        }

        // TODO: Implement production signature verification with crypto
        throw new Error("Production Razorpay verification not yet implemented");
    },
});

/**
 * Update payment status manually (for UPI or cash payments)
 */
export const updatePaymentStatus = mutation({
    args: {
        settlementId: v.id("settlements"),
        status: v.string(), // "completed" | "failed" | "pending"
        paymentMethod: v.optional(v.string()),
        transactionId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const caller = await ctx.runQuery(internal.users.getCurrentUser);

        // Get the settlement
        const settlement = await ctx.db.get(args.settlementId);
        if (!settlement) {
            throw new Error("Settlement not found");
        }

        // Verify user is authorized
        if (settlement.paidByUserId !== caller._id && settlement.receivedByUserId !== caller._id) {
            throw new Error("Unauthorized to update this settlement");
        }

        // Update settlement
        await ctx.db.patch(args.settlementId, {
            paymentStatus: args.status,
            paymentMethod: args.paymentMethod || settlement.paymentMethod,
            paymentId: args.transactionId,
            paymentMetadata: {
                ...settlement.paymentMetadata,
                upiTransactionId: args.transactionId,
                timestamp: Date.now(),
            },
        });

        return { success: true, status: args.status };
    },
});

/**
 * Get payment status for a settlement
 */
export const getPaymentStatus = query({
    args: {
        settlementId: v.id("settlements"),
    },
    handler: async (ctx, args) => {
        const caller = await ctx.runQuery(internal.users.getCurrentUser);

        const settlement = await ctx.db.get(args.settlementId);
        if (!settlement) {
            throw new Error("Settlement not found");
        }

        // Verify user is authorized
        if (settlement.paidByUserId !== caller._id && settlement.receivedByUserId !== caller._id) {
            throw new Error("Unauthorized to view this settlement");
        }

        return {
            settlementId: settlement._id,
            paymentMethod: settlement.paymentMethod || "cash",
            paymentStatus: settlement.paymentStatus || "completed",
            paymentId: settlement.paymentId,
            paymentMetadata: settlement.paymentMetadata,
        };
    },
});
