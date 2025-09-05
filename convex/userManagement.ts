import { v } from "convex/values";
import { query, mutation, internalMutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { api } from "./_generated/api";

// Internal function to clean up duplicate users
export const cleanupDuplicateUsers = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Find all users with the same email
    const duplicateUsers = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .collect();

    if (duplicateUsers.length <= 1) {
      return { message: "No duplicates found", duplicatesRemoved: 0 };
    }

    // Keep the oldest user (first created)
    const sortedUsers = duplicateUsers.sort((a, b) => a._creationTime - b._creationTime);
    const userToKeep = sortedUsers[0];
    const usersToRemove = sortedUsers.slice(1);

    // For each duplicate user, transfer their data to the main user
    for (const duplicateUser of usersToRemove) {
      // Transfer user profiles
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", duplicateUser._id))
        .first();
      
      if (profile) {
        // Check if main user already has a profile
        const mainProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", userToKeep._id))
          .first();
        
        if (!mainProfile) {
          // Update the profile to point to the main user
          await ctx.db.patch(profile._id, { userId: userToKeep._id });
        } else {
          // Delete the duplicate profile
          await ctx.db.delete(profile._id);
        }
      }

      // Transfer auction requests
      const auctionRequests = await ctx.db
        .query("auctionRequests")
        .withIndex("by_requester", (q) => q.eq("requesterId", duplicateUser._id))
        .collect();
      
      for (const request of auctionRequests) {
        await ctx.db.patch(request._id, { requesterId: userToKeep._id });
      }

      // Transfer auctions
      const auctions = await ctx.db
        .query("auctions")
        .withIndex("by_auctioneer", (q) => q.eq("auctioneerId", duplicateUser._id))
        .collect();
      
      for (const auction of auctions) {
        await ctx.db.patch(auction._id, { auctioneerId: userToKeep._id });
      }

      // Transfer bids
      const bids = await ctx.db
        .query("bids")
        .withIndex("by_bidder", (q) => q.eq("bidderId", duplicateUser._id))
        .collect();
      
      for (const bid of bids) {
        await ctx.db.patch(bid._id, { bidderId: userToKeep._id });
      }

      // Transfer favorites
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_user", (q) => q.eq("userId", duplicateUser._id))
        .collect();
      
      for (const favorite of favorites) {
        // Check if main user already has this favorite
        const existingFavorite = await ctx.db
          .query("favorites")
          .withIndex("by_user_and_auction", (q) => 
            q.eq("userId", userToKeep._id).eq("auctionId", favorite.auctionId)
          )
          .first();
        
        if (!existingFavorite) {
          await ctx.db.patch(favorite._id, { userId: userToKeep._id });
        } else {
          await ctx.db.delete(favorite._id);
        }
      }

      // Transfer notifications
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", duplicateUser._id))
        .collect();
      
      for (const notification of notifications) {
        await ctx.db.patch(notification._id, { userId: userToKeep._id });
      }

      // Transfer art pieces
      const artPieces = await ctx.db
        .query("artPieces")
        .withIndex("by_creator", (q) => q.eq("createdBy", duplicateUser._id))
        .collect();
      
      for (const artPiece of artPieces) {
        await ctx.db.patch(artPiece._id, { createdBy: userToKeep._id });
      }

      // Finally, delete the duplicate user
      await ctx.db.delete(duplicateUser._id);
    }

    return { 
      message: `Cleaned up ${usersToRemove.length} duplicate users for ${args.email}`,
      duplicatesRemoved: usersToRemove.length,
      keptUserId: userToKeep._id
    };
  },
});

// Query to find duplicate users by email
export const findDuplicateUsers = query({
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

    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    
    // Group by email
    const emailGroups: Record<string, any[]> = {};
    for (const user of allUsers) {
      if (user.email) {
        if (!emailGroups[user.email]) {
          emailGroups[user.email] = [];
        }
        emailGroups[user.email].push(user);
      }
    }

    // Find duplicates
    const duplicates = Object.entries(emailGroups)
      .filter(([_, users]) => users.length > 1)
      .map(([email, users]) => ({
        email,
        count: users.length,
        users: users.map(u => ({
          id: u._id,
          creationTime: u._creationTime,
          name: u.name,
        }))
      }));

    return duplicates;
  },
});

// Action to trigger cleanup of duplicate users
export const triggerCleanupDuplicateUsers = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args): Promise<{ message: string; duplicatesRemoved: number; keptUserId?: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Admin access required");
    }

    // Check if user is admin
    const userProfile = await ctx.runQuery(api.users.getUserProfile, {});
    if (!userProfile?.isAdmin) {
      throw new Error("Admin access required");
    }

    return await ctx.runMutation(internal.userManagement.cleanupDuplicateUsers, {
      email: args.email,
    });
  },
});
