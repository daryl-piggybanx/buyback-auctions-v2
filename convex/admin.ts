import { v } from "convex/values";
import { query, mutation, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function requireAdmin(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Admin access required");
  }

  const userProfile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  
  if (!userProfile?.isAdmin) {
    throw new Error("Admin access required");
  }

  return { userId, userProfile };
}

export const getAllAuctionRequestsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const requests = await ctx.db
      .query("auctionRequests")
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

export const getAllAuctionsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const auctions = await ctx.db
      .query("auctions")
      .order("desc")
      .collect();

    // Enrich with art piece and user data
    const enrichedAuctions = await Promise.all(
      auctions.map(async (auction) => {
        const artPiece = await ctx.db.get(auction.artPieceId);
        const auctioneer = await ctx.db.get(auction.auctioneerId);
        const auctioneerProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", auction.auctioneerId))
          .first();

        return {
          ...auction,
          artPiece,
          auctioneer: auctioneerProfile?.username || auctioneer?.name || "Unknown",
          imageUrl: artPiece?.imageId ? await ctx.storage.getUrl(artPiece.imageId) : undefined,
        };
      })
    );

    return enrichedAuctions;
  },
});
