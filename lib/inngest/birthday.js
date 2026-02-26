import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { inngest } from "./client";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export const birthdayNotifications = inngest.createFunction(
    { id: "send-birthday-notifications" },
    { cron: "0 9 * * *" }, // Daily at 9 AM
    async ({ step }) => {
        // 1. Get users with birthday today
        const birthdayUsers = await step.run("fetch-birthday-users", async () => {
            // We need a query that returns users whose birthday matches today (MM-DD)
            // Since dob is string YYYY-MM-DD or similar, we might need to filter in JS or Convex
            return await convex.query(api.inngest.getBirthdayUsers);
        });

        if (!birthdayUsers.length) return { processed: 0 };

        const results = [];

        // 2. For each user, find close contacts and notify
        for (const user of birthdayUsers) {
            const contacts = await step.run(`fetch-contacts-${user._id}`, async () => {
                return await convex.query(api.inngest.getContactsForUser, { userId: user._id });
            });

            if (!contacts.length) continue;

            await step.run(`notify-contacts-${user._id}`, async () => {
                for (const contact of contacts) {
                    // Create notification for contact
                    await convex.mutation(api.notifications.create, {
                        type: "birthday",
                        targetUserId: contact._id,
                        relatedUserId: user._id,
                        message: `Today is ${user.name}'s birthday — send wishes?`,
                        // No groupId for birthday generally, or maybe we pick one? 
                        // The prompt says "Identify close contacts as users who share at least one common group". 
                        // We can leave groupId null or pick a common group if we want to show context.
                    });
                }
            });

            results.push(user._id);
        }

        return { processed: results.length, users: results };
    }
);
