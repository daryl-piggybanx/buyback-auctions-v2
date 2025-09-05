import { query } from "./_generated/server";

export const getArchivedAuctions = query({
  args: {},
  handler: async (ctx) => {
    const auctions = await ctx.db
      .query("auctions")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .order("desc")
      .take(50); // Limit to 50 most recent archived auctions

    return Promise.all(
      auctions.map(async (auction) => {
        const artPiece = await ctx.db.get(auction.artPieceId);
        const auctioneerProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", auction.auctioneerId))
          .first();
        const winnerProfile = auction.currentBidderId 
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", auction.currentBidderId!))
              .first()
          : null;
        const imageUrl = artPiece?.imageId 
          ? await ctx.storage.getUrl(artPiece.imageId) 
          : null;

        return {
          ...auction,
          artPiece,
          auctioneer: auctioneerProfile?.username || "Unknown",
          winner: winnerProfile?.username || "Unknown",
          imageUrl,
          soldDate: auction.endTime,
        };
      })
    );
  },
});

export const getEndedAuctions = query({
  args: {},
  handler: async (ctx) => {
    const auctions = await ctx.db
      .query("auctions")
      .withIndex("by_status", (q) => q.eq("status", "ended"))
      .order("desc")
      .take(50);

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
          endedDate: auction.endTime,
        };
      })
    );
  },
});
