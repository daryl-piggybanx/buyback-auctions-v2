import { v } from "convex/values";
import { query, mutation, internalAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export type NotificationType = "bid_placed" | "bid_outbid" | "auction_won" | "auction_ended" | "auction_started" | "payment_due" | "shipping_due" | "auction_request_approved" | "auction_request_rejected" | "auction_cancelled";

export type NotificationPriority = "low" | "medium" | "high";

export type Notification = {
  userId: Id<"users">;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  priority: NotificationPriority;
  auctionId?: Id<"auctions">;
  auctionRequestId?: Id<"auctionRequests">;
};

async function getLoggedInUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}

export const getUserNotifications = query({
  args: {},
  returns: v.array(v.any()), // Using v.any() for simplicity since this returns Doc<"notifications">
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    
    // Return empty array if user is not authenticated (signed out)
    if (!userId) {
      return [];
    }
    
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

/* might not be needed cuz of: await ctx.db.insert("notifications" */
export const sendNotification = mutation({
  args: { notification: v.object({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    priority: v.string(),
    auctionId: v.optional(v.id("auctions")),
    auctionRequestId: v.optional(v.id("auctionRequests")),
  })},
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", args.notification as Notification);
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    const notification = await ctx.db.get(args.notificationId);
    
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
    return null;
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
