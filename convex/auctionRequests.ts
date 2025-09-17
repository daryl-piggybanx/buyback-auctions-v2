import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
// import { Id } from "./_generated/dataModel"; // Not used after refactoring
import { internal } from "./_generated/api";

export const createAuctionRequest = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    selectedArtPieceId: v.optional(v.id("artPieces")),
    artPiece: v.optional(v.object({
      category: v.string(),
      dimensions: v.optional(v.string()),
      variation: v.optional(v.string()),
      purchaseDate: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to create auction request");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) {
      throw new Error("User profile not found. Please complete your profile first.");
    }

    // Create art piece first (if not using existing one)
    let artPieceId;
    
    if (args.selectedArtPieceId) {
      // Use existing art piece
      artPieceId = args.selectedArtPieceId;
    } else {
      // Create new art piece
      artPieceId = await ctx.db.insert("artPieces", {
        title: args.title,
        createdBy: userId,
        category: args.artPiece?.category || "Other",
        dimensions: "100%", // Default dimension
        variation: args.artPiece?.variation,
        purchaseDate: args.artPiece?.purchaseDate,
      });
    }

    const requestId = await ctx.db.insert("auctionRequests", {
      requesterId: userId,
      artPieceId: artPieceId,
      title: args.title,
      description: args.description,
      status: "pending",
    });

    return requestId;
  },
});

export const getUserAuctionRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const requests = await ctx.db
      .query("auctionRequests")
      .withIndex("by_requester", (q) => q.eq("requesterId", userId))
      .order("desc")
      .collect();

    // Enrich with art piece and user data
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const artPiece = await ctx.db.get(request.artPieceId);
        const requester = await ctx.db.get(request.requesterId);
        const requesterProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", request.requesterId))
          .first();

        return {
          ...request,
          artPiece,
          requester: requesterProfile?.username || requester?.name || "Unknown",
          imageUrl: artPiece?.imageId ? await ctx.storage.getUrl(artPiece.imageId) : undefined,
        };
      })
    );

    return enrichedRequests;
  },
});

export const getAuctionRequestById = query({
  args: {
    requestId: v.id("auctionRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      return null;
    }

    const userId = await getAuthUserId(ctx);
    
    // Allow access if user is the requester or an admin
    if (userId === request.requesterId) {
      const artPiece = await ctx.db.get(request.artPieceId);
      const requester = await ctx.db.get(request.requesterId);
      const requesterProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", request.requesterId))
        .first();

      let auction = null;
      if (request.auctionId) {
        auction = await ctx.db.get(request.auctionId);
      }

      return {
        ...request,
        artPiece,
        auction,
        requester: requesterProfile?.username || requester?.name || "Unknown",
        imageUrl: artPiece?.imageId ? await ctx.storage.getUrl(artPiece.imageId) : undefined,
      };
    }

    // Check if user is admin
    if (userId) {
      const userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      
      if (userProfile?.isAdmin) {
        const artPiece = await ctx.db.get(request.artPieceId);
        const requester = await ctx.db.get(request.requesterId);
        const requesterProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", request.requesterId))
          .first();

        let auction = null;
        if (request.auctionId) {
          auction = await ctx.db.get(request.auctionId);
        }

        return {
          ...request,
          artPiece,
          auction,
          requester: requesterProfile?.username || requester?.name || "Unknown",
          imageUrl: artPiece?.imageId ? await ctx.storage.getUrl(artPiece.imageId) : undefined,
        };
      }
    }

    // For non-authenticated users or non-owners/non-admins, don't return the request
    return null;
  },
});

export const getPendingAuctionRequests = query({
  args: {},
  handler: async (ctx) => {
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

    const requests = await ctx.db
      .query("auctionRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    // Enrich with art piece and user data
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const artPiece = await ctx.db.get(request.artPieceId);
        const requester = await ctx.db.get(request.requesterId);
        const requesterProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", request.requesterId))
          .first();

        return {
          ...request,
          artPiece,
          requester: requesterProfile?.username || requester?.name || "Unknown",
          imageUrl: artPiece?.imageId ? await ctx.storage.getUrl(artPiece.imageId) : undefined,
        };
      })
    );

    return enrichedRequests;
  },
});

export const approveAuctionRequest = mutation({
  args: {
    requestId: v.id("auctionRequests"),
    startingPrice: v.number(),
    startTime: v.number(),
    endTime: v.number(),
    durationHours: v.number(),
    isFixedEndTime: v.boolean(),
    adminNotes: v.optional(v.string()),
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

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Auction request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Only pending requests can be approved");
    }

    const artPiece = await ctx.db.get(request.artPieceId);
    if (!artPiece) {
      throw new Error("Art piece not found");
    }

    // Note: requesterProfile not used in current logic but kept for potential future use
    // const requesterProfile = await ctx.db
    //   .query("userProfiles")
    //   .withIndex("by_user", (q) => q.eq("userId", request.requesterId))
    //   .first();

    // Create the auction
    const auctionId = await ctx.db.insert("auctions", {
      artPieceId: request.artPieceId,
      auctioneerId: request.requesterId,
      title: request.title,
      description: request.description,
      startingPrice: args.startingPrice,
      currentBid: args.startingPrice,
      startTime: args.startTime,
      endTime: args.endTime,
      isFixedEndTime: args.isFixedEndTime,
      status: args.startTime <= Date.now() ? "active" : "draft",
      bidCount: 0,
      isLocked: false,
      flaggedCount: 0,
      auctionRequestId: args.requestId,
    });

    // Schedule events based on timing
    if (args.startTime <= Date.now()) {
      // Auction should start immediately, schedule end event
      const delay = Math.max(0, args.endTime - Date.now());
      await ctx.scheduler.runAfter(delay, internal.auctions.endAuction, {
        auctionId,
      });
    } else {
      // Schedule auction start
      const startDelay = Math.max(0, args.startTime - Date.now());
      await ctx.scheduler.runAfter(startDelay, internal.auctions.startAuction, {
        auctionId,
      });
    }

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: "approved",
      auctionId: auctionId,
      adminNotes: args.adminNotes,
      approvedBy: userId,
      approvedAt: Date.now(),
    });

    // Create notification for the requester
    await ctx.db.insert("notifications", {
      userId: request.requesterId,
      type: "auction_request_approved",
      title: "Auction Request Approved",
      message: `Your auction request "${request.title}" has been approved and scheduled. Start: ${new Date(args.startTime).toLocaleString()}, End: ${new Date(args.endTime).toLocaleString()}`,
      auctionId: auctionId,
      auctionRequestId: args.requestId,
      isRead: false,
      priority: "high",
    });

    return auctionId;
  },
});

export const rejectAuctionRequest = mutation({
  args: {
    requestId: v.id("auctionRequests"),
    adminNotes: v.string(),
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

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Auction request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Only pending requests can be rejected");
    }

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      adminNotes: args.adminNotes,
      rejectedBy: userId,
      rejectedAt: Date.now(),
    });

    // Create notification for the requester
    await ctx.db.insert("notifications", {
      userId: request.requesterId,
      type: "auction_request_rejected",
      title: "Auction Request Rejected",
      message: `Your auction request "${request.title}" has been rejected. Reason: ${args.adminNotes}`,
      auctionRequestId: args.requestId,
      isRead: false,
      priority: "medium",
    });

    return true;
  },
});
