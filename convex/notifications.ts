import { v } from "convex/values";
import { query, mutation, internalAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getLoggedInUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}

export const getUserNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getLoggedInUser(ctx);
    
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    const notification = await ctx.db.get(args.notificationId);
    
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const sendWinnerEmail = internalAction({
  args: { auctionId: v.id("auctions") },
  handler: async (ctx, args) => {
    // This would integrate with email service
    // For now, just log the action
    console.log(`Sending winner email for auction ${args.auctionId}`);
  },
});
