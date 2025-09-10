import { v } from "convex/values";
import { query, mutation, internalMutation, internalAction, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

async function getLoggedInUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}

async function requireUserProfile(ctx: any) {
  const userId = await getLoggedInUser(ctx);
  
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();
  
  if (!profile) {
    throw new Error("You must create a user profile before performing this action");
  }
  
  return { userId, profile };
}

export const placeBid = mutation({
  args: {
    auctionId: v.id("auctions"),
    amount: v.number(),
  },
  returns: v.object({ success: v.boolean(), newEndTime: v.number() }),
  handler: async (ctx, args) => {
    const { userId } = await requireUserProfile(ctx);
    
    // Check if user is blacklisted by checking the blacklist table
    // First check by userId
    let blacklistEntry = await ctx.db
      .query("blacklist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    // If not found by userId, also check by email
    if (!blacklistEntry) {
      const user = await ctx.db.get(userId);
      if (user?.email) {
        blacklistEntry = await ctx.db
          .query("blacklist")
          .withIndex("by_email", (q) => q.eq("email", user.email))
          .first();
      }
    }
    
    if (blacklistEntry) {
      throw new Error("User is blacklisted and cannot place bids");
    }

    const auction = await ctx.db.get(args.auctionId);
    if (!auction) {
      throw new Error("Auction not found");
    }

    if (auction.status !== "active") {
      throw new Error("Auction is not active");
    }

    if (auction.isLocked) {
      throw new Error("Auction is temporarily locked");
    }

    if (auction.auctioneerId === userId) {
      throw new Error("Cannot bid on your own auction");
    }

    if (args.amount <= auction.currentBid) {
      throw new Error("Bid must be higher than current bid");
    }

    if (Date.now() > auction.endTime) {
      throw new Error("Auction has ended");
    }

    // Lock auction for bid processing
    await ctx.db.patch(args.auctionId, { isLocked: true });

    try {
      // Mark previous winning bid as not winning
      if (auction.currentBidderId) {
        const previousBids = await ctx.db
          .query("bids")
          .withIndex("by_auction", (q) => q.eq("auctionId", args.auctionId))
          .filter((q) => q.eq(q.field("bidderId"), auction.currentBidderId))
          .filter((q) => q.eq(q.field("isWinning"), true))
          .collect();
        
        for (const bid of previousBids) {
          await ctx.db.patch(bid._id, { isWinning: false });
        }

        // Notify previous bidder they've been outbid
        await ctx.db.insert("notifications", {
          userId: auction.currentBidderId,
          type: "bid_outbid",
          title: "You've been outbid",
          message: `Your bid of $${auction.currentBid} on "${auction.title}" has been outbid.`,
          auctionId: args.auctionId,
          isRead: false,
          priority: "medium",
        });
      }

      // Create new bid
      await ctx.db.insert("bids", {
        auctionId: args.auctionId,
        bidderId: userId,
        amount: args.amount,
        timestamp: Date.now(),
        isValid: true,
        isWinning: true,
      });

      // Update auction
      const newEndTime = auction.isFixedEndTime 
        ? auction.endTime 
        : Math.max(auction.endTime, Date.now() + (5 * 60 * 1000)); // Extend by 5 minutes for popcorn bidding

      await ctx.db.patch(args.auctionId, {
        currentBid: args.amount,
        currentBidderId: userId,
        bidCount: auction.bidCount + 1,
        endTime: newEndTime,
        isLocked: false,
      });

      // Notify auctioneer of new bid
      await ctx.db.insert("notifications", {
        userId: auction.auctioneerId,
        type: "bid_placed",
        title: "New bid received",
        message: `New bid of $${args.amount} placed on "${auction.title}".`,
        auctionId: args.auctionId,
        isRead: false,
        priority: "high",
      });

      return { success: true, newEndTime };
    } catch (error) {
      // Unlock auction if error occurs
      await ctx.db.patch(args.auctionId, { isLocked: false });
      throw error;
    }
  },
});

export const getActiveAuctions = query({
  args: {},
  handler: async (ctx) => {
    const auctions = await ctx.db
      .query("auctions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();

    return Promise.all(
      auctions.map(async (auction) => {
        const artPiece = await ctx.db.get(auction.artPieceId);
        const auctioneerProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", auction.auctioneerId))
          .first();
        const imageUrl = artPiece?.imageId 
          ? await ctx.storage.getUrl(artPiece.imageId) 
          : null;

        return {
          ...auction,
          artPiece,
          auctioneer: auctioneerProfile?.username || "Unknown",
          imageUrl,
          timeRemaining: Math.max(0, auction.endTime - Date.now()),
        };
      })
    );
  },
});

export const getAllCurrentAuctions = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Get all auctions that are still current (draft or active and not expired)
    const allAuctions = await ctx.db
      .query("auctions")
      .order("desc")
      .collect();

    const currentAuctions = allAuctions.filter(auction => {
      // Only include draft auctions or active auctions that haven't expired
      if (auction.status === "draft") {
        return true;
      }
      if (auction.status === "active") {
        return auction.endTime > now;
      }
      return false;
    });

    return Promise.all(
      currentAuctions.map(async (auction) => {
        const artPiece = await ctx.db.get(auction.artPieceId);
        const auctioneerProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", auction.auctioneerId))
          .first();
        const imageUrl = artPiece?.imageId 
          ? await ctx.storage.getUrl(artPiece.imageId) 
          : null;

        return {
          ...auction,
          artPiece,
          auctioneer: auctioneerProfile?.username || "Unknown",
          imageUrl,
          timeRemaining: Math.max(0, auction.endTime - now),
          timeToStart: auction.status === "draft" ? Math.max(0, auction.startTime - now) : 0,
        };
      })
    );
  },
});

export const getAuctionDetails = query({
  args: { auctionId: v.id("auctions") },
  handler: async (ctx, args) => {
    const auction = await ctx.db.get(args.auctionId);
    if (!auction) return null;

    const artPiece = await ctx.db.get(auction.artPieceId);
    const auctioneerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", auction.auctioneerId))
      .first();
    
    const bids = await ctx.db
      .query("bids")
      .withIndex("by_auction", (q) => q.eq("auctionId", args.auctionId))
      .order("desc")
      .take(10);

    const bidHistory = await Promise.all(
      bids.map(async (bid) => {
        const bidderProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", bid.bidderId))
          .first();
        return {
          ...bid,
          bidderName: bidderProfile?.username || "Anonymous",
        };
      })
    );

    const imageUrl = artPiece?.imageId 
      ? await ctx.storage.getUrl(artPiece.imageId) 
      : null;
    const videoUrl = artPiece?.videoId 
      ? await ctx.storage.getUrl(artPiece.videoId) 
      : null;

    return {
      ...auction,
      artPiece,
      auctioneer: auctioneerProfile?.username || "Unknown",
      imageUrl,
      videoUrl,
      bidHistory,
      timeRemaining: Math.max(0, auction.endTime - Date.now()),
    };
  },
});

export const endAuction = internalMutation({
  args: { auctionId: v.id("auctions") },
  handler: async (ctx, args) => {
    const auction = await ctx.db.get(args.auctionId);
    if (!auction || auction.status !== "active") {
      return;
    }

    if (auction.currentBidderId) {
      // Auto-accept the winning bid and complete the auction
      const paymentDeadline = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
      const shippingDeadline = Date.now() + (14 * 24 * 60 * 60 * 1000); // 14 days

      await ctx.db.patch(args.auctionId, {
        status: "completed",
        winnerAccepted: true,
        paymentDeadline,
        shippingDeadline,
      });

      // Create transaction record
      await ctx.db.insert("transactions", {
        auctionId: args.auctionId,
        buyerId: auction.currentBidderId,
        sellerId: auction.auctioneerId,
        amount: auction.currentBid,
        status: "pending",
      });

      // Notify winner
      await ctx.db.insert("notifications", {
        userId: auction.currentBidderId,
        type: "auction_won",
        title: "Congratulations! You won the auction",
        message: `Your bid of $${auction.currentBid} for "${auction.title}" has been accepted. Payment is due within 7 days.`,
        auctionId: args.auctionId,
        isRead: false,
        priority: "high",
      });

      // Notify auctioneer (original requester)
      await ctx.db.insert("notifications", {
        userId: auction.auctioneerId,
        type: "auction_ended",
        title: "Your auction has ended successfully",
        message: `Your auction for "${auction.title}" has ended with a winning bid of $${auction.currentBid}. The bid has been automatically accepted.`,
        auctionId: args.auctionId,
        isRead: false,
        priority: "high",
      });

      // Schedule email notification
      await ctx.scheduler.runAfter(0, internal.notifications.sendWinnerEmail, {
        auctionId: args.auctionId,
      });
    } else {
      // No bids, end auction
      await ctx.db.patch(args.auctionId, { status: "ended" });

      // Notify auctioneer (original requester)
      await ctx.db.insert("notifications", {
        userId: auction.auctioneerId,
        type: "auction_ended",
        title: "Your auction has ended",
        message: `Your auction for "${auction.title}" has ended with no bids.`,
        auctionId: args.auctionId,
        isRead: false,
        priority: "medium",
      });
    }
  },
});

export const getUserAuctions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getLoggedInUser(ctx);
    
    const auctions = await ctx.db
      .query("auctions")
      .withIndex("by_auctioneer", (q) => q.eq("auctioneerId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      auctions.map(async (auction) => {
        const artPiece = await ctx.db.get(auction.artPieceId);
        const imageUrl = artPiece?.imageId 
          ? await ctx.storage.getUrl(artPiece.imageId) 
          : null;

        return {
          ...auction,
          artPiece,
          imageUrl,
          timeRemaining: Math.max(0, auction.endTime - Date.now()),
        };
      })
    );
  },
});

export const getUserBids = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getLoggedInUser(ctx);
    
    const bids = await ctx.db
      .query("bids")
      .withIndex("by_bidder", (q) => q.eq("bidderId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      bids.map(async (bid) => {
        const auction = await ctx.db.get(bid.auctionId);
        const artPiece = auction ? await ctx.db.get(auction.artPieceId) : null;
        const imageUrl = artPiece?.imageId 
          ? await ctx.storage.getUrl(artPiece.imageId) 
          : null;

        return {
          ...bid,
          auction,
          artPiece,
          imageUrl,
          isCurrentWinner: auction?.currentBidderId === userId,
        };
      })
    );
  },
});

export const checkExpiredAuctions = internalAction({
  args: {},
  returns: v.object({ processed: v.number() }),
  handler: async (ctx) => {
    const now = Date.now();
    
    // Get all active auctions that have passed their end time
    const expiredAuctions: Id<"auctions">[] = await ctx.runQuery(internal.auctions.getExpiredAuctions, {
      currentTime: now,
    });

    // Get all draft auctions that should start
    const startingAuctions: Id<"auctions">[] = await ctx.runQuery(internal.auctions.getStartingAuctions, {
      currentTime: now,
    });

    // Process each expired auction
    for (const auctionId of expiredAuctions) {
      await ctx.runMutation(internal.auctions.endAuction, {
        auctionId,
      });
    }

    // Process each starting auction
    for (const auctionId of startingAuctions) {
      await ctx.runMutation(internal.auctions.startAuction, {
        auctionId,
      });
    }

    return { processed: expiredAuctions.length + startingAuctions.length };
  },
});

export const getExpiredAuctions = internalQuery({
  args: { currentTime: v.number() },
  returns: v.array(v.id("auctions")),
  handler: async (ctx, args) => {
    const activeAuctions = await ctx.db
      .query("auctions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const expiredAuctionIds: Id<"auctions">[] = [];
    
    for (const auction of activeAuctions) {
      if (auction.endTime <= args.currentTime) {
        expiredAuctionIds.push(auction._id);
      }
    }

    return expiredAuctionIds;
  },
});

export const archiveAuction = mutation({
  args: {
    auctionId: v.id("auctions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Admin access required");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!userProfile?.isAdmin) {
      throw new Error("Admin access required");
    }

    const auction = await ctx.db.get(args.auctionId);
    if (!auction) {
      throw new Error("Auction not found");
    }

    // Only allow archiving of active or draft auctions
    if (auction.status !== "active" && auction.status !== "draft") {
      throw new Error("Only active or draft auctions can be archived");
    }

    // Update auction status to cancelled
    await ctx.db.patch(args.auctionId, {
      status: "cancelled",
      cancelledAt: Date.now(),
      cancelledBy: userId,
    });

    // Notify the auctioneer
    await ctx.db.insert("notifications", {
      userId: auction.auctioneerId,
      type: "auction_cancelled",
      title: "Auction Cancelled",
      message: `Your auction "${auction.title}" has been cancelled by an administrator.`,
      auctionId: args.auctionId,
      isRead: false,
      priority: "high",
    });

    // If there was a current bidder, notify them too
    if (auction.currentBidderId) {
      await ctx.db.insert("notifications", {
        userId: auction.currentBidderId,
        type: "auction_cancelled",
        title: "Auction Cancelled",
        message: `The auction "${auction.title}" you were bidding on has been cancelled.`,
        auctionId: args.auctionId,
        isRead: false,
        priority: "high",
      });
    }

    return { success: true };
  },
});

export const updateAuction = mutation({
  args: {
    auctionId: v.id("auctions"),
    startingPrice: v.number(),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Admin access required");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!userProfile?.isAdmin) {
      throw new Error("Admin access required");
    }

    const auction = await ctx.db.get(args.auctionId);
    if (!auction) {
      throw new Error("Auction not found");
    }

    // Update the auction
    await ctx.db.patch(args.auctionId, {
      startingPrice: args.startingPrice,
      startTime: args.startTime,
      endTime: args.endTime,
    });

    return { success: true };
  },
});

export const deleteAuction = mutation({
  args: {
    auctionId: v.id("auctions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Admin access required");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!userProfile?.isAdmin) {
      throw new Error("Admin access required");
    }

    const auction = await ctx.db.get(args.auctionId);
    if (!auction) {
      throw new Error("Auction not found");
    }

    // Only allow deletion of cancelled or ended auctions
    if (auction.status !== "cancelled" && auction.status !== "ended") {
      throw new Error("Only cancelled or ended auctions can be deleted");
    }

    // Delete all related bids
    const bids = await ctx.db
      .query("bids")
      .withIndex("by_auction", (q) => q.eq("auctionId", args.auctionId))
      .collect();

    for (const bid of bids) {
      await ctx.db.delete(bid._id);
    }

    // Delete all related notifications
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("auctionId"), args.auctionId))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // Delete any related transactions
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("auctionId"), args.auctionId))
      .collect();

    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }

    // Finally, delete the auction itself
    await ctx.db.delete(args.auctionId);

    return { success: true };
  },
});

export const getStartingAuctions = internalQuery({
  args: { currentTime: v.number() },
  returns: v.array(v.id("auctions")),
  handler: async (ctx, args) => {
    const draftAuctions = await ctx.db
      .query("auctions")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .collect();

    return draftAuctions
      .filter(auction => auction.startTime <= args.currentTime)
      .map(auction => auction._id);
  },
});

export const startAuction = internalMutation({
  args: { auctionId: v.id("auctions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const auction = await ctx.db.get(args.auctionId);
    if (!auction) {
      throw new Error("Auction not found");
    }

    if (auction.status !== "draft") {
      return; // Already processed or not a draft
    }

    // Update auction status to active
    await ctx.db.patch(args.auctionId, {
      status: "active",
    });

    // Notify the auctioneer that their auction has started
    await ctx.db.insert("notifications", {
      userId: auction.auctioneerId,
      type: "auction_started",
      title: "Auction Started",
      message: `Your auction "${auction.title}" has started and is now accepting bids!`,
      auctionId: args.auctionId,
      isRead: false,
      priority: "high",
    });
  },
});
