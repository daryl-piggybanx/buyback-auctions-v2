import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getLoggedInUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}

export const toggleFavorite = mutation({
  args: {
    auctionId: v.id("auctions"),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    // Check if already favorited
    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_auction", (q) => 
        q.eq("userId", userId).eq("auctionId", args.auctionId)
      )
      .first();
    
    if (existingFavorite) {
      // Remove from favorites
      await ctx.db.delete(existingFavorite._id);
      return { favorited: false };
    } else {
      // Add to favorites
      await ctx.db.insert("favorites", {
        userId,
        auctionId: args.auctionId,
      });
      return { favorited: true };
    }
  },
});

export const getUserFavorites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getLoggedInUser(ctx);
    
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      favorites.map(async (favorite) => {
        const auction = await ctx.db.get(favorite.auctionId);
        if (!auction) return null;
        
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
          favoritedAt: favorite._creationTime,
        };
      })
    ).then(results => results.filter(Boolean));
  },
});

export const checkIsFavorited = query({
  args: { auctionId: v.id("auctions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_auction", (q) => 
        q.eq("userId", userId).eq("auctionId", args.auctionId)
      )
      .first();
    
    return !!favorite;
  },
});
