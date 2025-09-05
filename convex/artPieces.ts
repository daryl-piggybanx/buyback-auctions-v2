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

export const createArtPiece = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    dimensions: v.union(v.literal("100%"), v.literal("400%"), v.literal("10000%")),
    variation: v.optional(v.string()),
    purchaseDate: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")),
    videoId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    return await ctx.db.insert("artPieces", {
      ...args,
      createdBy: userId,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getLoggedInUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUserArtPieces = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getLoggedInUser(ctx);
    
    const artPieces = await ctx.db
      .query("artPieces")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .order("desc")
      .collect();

    return Promise.all(
      artPieces.map(async (piece) => {
        const imageUrl = piece.imageId 
          ? await ctx.storage.getUrl(piece.imageId) 
          : null;
        const videoUrl = piece.videoId 
          ? await ctx.storage.getUrl(piece.videoId) 
          : null;

        return {
          ...piece,
          imageUrl,
          videoUrl,
        };
      })
    );
  },
});
