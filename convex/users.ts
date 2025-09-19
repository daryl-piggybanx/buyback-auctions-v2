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

function isAdminEmail(email: string): boolean {
  return email.endsWith("@piggybanxinc.com");
}

// Public mutation to create profile automatically after signup
export const createProfileAfterSignup = mutation({
  args: {
    username: v.string(),
  },
  returns: v.id("userProfiles"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (existingProfile) {
      return existingProfile._id; // Profile already exists
    }

    // Check if username is already taken
    const existingUsername = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    if (existingUsername) {
      // Generate a unique username by appending a number
      let counter = 1;
      let uniqueUsername = `${args.username}${counter}`;
      
      while (await ctx.db
        .query("userProfiles")
        .withIndex("by_username", (q) => q.eq("username", uniqueUsername))
        .first()) {
        counter++;
        uniqueUsername = `${args.username}${counter}`;
      }
      
      args.username = uniqueUsername;
    }

    // Get user email to check if admin
    const user = await ctx.db.get(userId);
    const isAdmin = user?.email ? isAdminEmail(user.email) : false;

    return await ctx.db.insert("userProfiles", {
      userId,
      username: args.username,
      totalBids: 0,
      totalWins: 0,
      totalAuctions: 0,
      rating: 5.0,
      isVerified: false,
      joinedAt: Date.now(),
      isAdmin,
      isBlacklisted: false, // Default to not blacklisted
    });
  },
});

export const createUserProfile = mutation({
  args: {
    username: v.string(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  returns: v.id("userProfiles"),
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (existingProfile) {
      throw new Error("User profile already exists");
    }

    // Check if username is already taken
    const existingUsername = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    if (existingUsername) {
      throw new Error("Username is already taken");
    }

    // Get user email to check if admin
    const user = await ctx.db.get(userId);
    const isAdmin = user?.email ? isAdminEmail(user.email) : false;

    return await ctx.db.insert("userProfiles", {
      userId,
      username: args.username,
      bio: args.bio,
      location: args.location,
      totalBids: 0,
      totalWins: 0,
      totalAuctions: 0,
      rating: 5.0,
      isVerified: false,
      joinedAt: Date.now(),
      isAdmin,
      isBlacklisted: false, // Default to not blacklisted
    });
  },
});

export const getUserProfile = query({
  args: { userId: v.optional(v.id("users")) },
  returns: v.union(v.null(), v.any()), // Simplified since we're joining data from multiple tables
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null; // Allow anonymous users
    }
    
    const targetUserId = args.userId || currentUserId;
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .first();
    
    if (!profile) {
      return null;
    }

    const user = await ctx.db.get(targetUserId);
    
    // Get unread notifications count only for the current user's own profile
    let notifications: any[] = [];
    if (targetUserId === currentUserId) {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", targetUserId))
        .filter((q) => q.eq(q.field("isRead"), false))
        .collect();
    }
    
    return {
      ...profile,
      email: targetUserId === currentUserId ? user?.email : undefined, // Only return email for own profile
      notifications: notifications,
    };
  },
});

export const checkUsernameAvailability = query({
  args: { username: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    return !existingProfile; // Return true if available
  },
});

export const addToBlacklist = mutation({
  args: {
    userId: v.optional(v.id("users")),
    email: v.optional(v.string()),
    reason: v.string(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const adminUserId = await getLoggedInUser(ctx);
    
    // Check if user is admin
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", adminUserId))
      .first();
    
    if (!adminProfile?.isAdmin) {
      throw new Error("Admin access required");
    }
    
    // Either userId or email must be provided, but not both
    if (!args.userId && !args.email) {
      throw new Error("Either userId or email must be provided");
    }
    
    if (args.userId && args.email) {
      throw new Error("Cannot provide both userId and email");
    }
    
    await ctx.db.insert("blacklist", {
      userId: args.userId,
      email: args.email,
      reason: args.reason,
      addedBy: adminUserId,
    });

    return { success: true };
  },
});

export const getAllUsers = query({
  args: {},
  returns: v.array(v.any()), // Simplified since we're joining data from multiple tables
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const userProfiles = await ctx.db.query("userProfiles").collect();
    
    // Join users with their profiles
    return users.map(user => {
      const profile = userProfiles.find(p => p.userId === user._id);
      return {
        ...user,
        profile: profile || null
      };
    });
  },
});

export const getBlacklist = query({
  args: {},
  returns: v.array(v.any()), // Simplified since we're joining data from multiple tables
  handler: async (ctx) => {
    const blacklistEntries = await ctx.db.query("blacklist").collect();
    
    // Get user details for each blacklist entry
    const blacklistWithDetails = await Promise.all(
      blacklistEntries.map(async (entry) => {
        let user = null;
        let profile = null;
        
        if (entry.userId) {
          user = await ctx.db.get(entry.userId);
          if (user) {
            profile = await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", entry.userId!))
              .first();
          }
        }
        
        return {
          ...entry,
          user,
          profile,
        };
      })
    );
    
    return blacklistWithDetails;
  },
});

export const removeFromBlacklist = mutation({
  args: {
    entryId: v.id("blacklist"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const adminUserId = await getLoggedInUser(ctx);
    
    // Check if user is admin
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", adminUserId))
      .first();
    
    if (!adminProfile?.isAdmin) {
      throw new Error("Admin access required");
    }
    
    await ctx.db.delete(args.entryId);
    return { success: true };
  },
});

export const checkIfUserIsBlacklisted = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false; // Anonymous users are not blacklisted
    }
    
    // Check if user is blacklisted by userId
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
    
    return !!blacklistEntry;
  },
});

export const getAllProfiles = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Admin access required");
    }

    // Check if user is admin
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!adminProfile?.isAdmin) {
      throw new Error("Admin access required");
    }

    const profiles = await ctx.db.query("userProfiles").order("desc").collect();
    
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          ...profile,
          user: user || null,
          email: user?.email || null,
        };
      })
    );

    return enrichedProfiles;
  },
});

export const getProfileDetails = query({
  args: {
    profileId: v.id("userProfiles"),
  },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Admin access required");
    }

    // check if user is admin
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!adminProfile?.isAdmin) {
      throw new Error("Admin access required");
    }

    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      return null;
    }

    const user = await ctx.db.get(profile.userId);
    
    const auctions = await ctx.db
      .query("auctions")
      .withIndex("by_auctioneer", (q) => q.eq("auctioneerId", profile.userId))
      .order("desc")
      .collect();

    const bids = await ctx.db
      .query("bids")
      .withIndex("by_bidder", (q) => q.eq("bidderId", profile.userId))
      .order("desc")
      .collect();

    const auctionRequests = await ctx.db
      .query("auctionRequests")
      .withIndex("by_requester", (q) => q.eq("requesterId", profile.userId))
      .order("desc")
      .collect();

    const blacklistEntry = await ctx.db
      .query("blacklist")
      .withIndex("by_user", (q) => q.eq("userId", profile.userId))
      .first();

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", profile.userId))
      .order("desc")
      .take(20);

    const enrichedAuctions = await Promise.all(
      auctions.map(async (auction) => {
        const artPiece = await ctx.db.get(auction.artPieceId);
        const imageUrl = artPiece?.imageId 
          ? await ctx.storage.getUrl(artPiece.imageId) 
          : null;
        return {
          ...auction,
          artPiece,
          imageUrl,
        };
      })
    );

    // Enrich bids with auction and art piece data
    const enrichedBids = await Promise.all(
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
        };
      })
    );

    const enrichedAuctionRequests = await Promise.all(
      auctionRequests.map(async (request) => {
        const artPiece = await ctx.db.get(request.artPieceId);
        const imageUrl = artPiece?.imageId 
          ? await ctx.storage.getUrl(artPiece.imageId) 
          : null;
        return {
          ...request,
          artPiece,
          imageUrl,
        };
      })
    );

    return {
      ...profile,
      user,
      email: user?.email,
      auctions: enrichedAuctions,
      bids: enrichedBids,
      auctionRequests: enrichedAuctionRequests,
      blacklistEntry,
      notifications,
      isBlacklisted: !!blacklistEntry,
    };
  },
});

// Admin function to delete a user profile and all related data
export const deleteProfile = mutation({
  args: {
    profileId: v.id("userProfiles"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    // Check if user is admin
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!adminProfile?.isAdmin) {
      throw new Error("Admin access required");
    }

    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Don't allow deleting admin profiles
    if (profile.isAdmin) {
      throw new Error("Cannot delete admin profile");
    }

    const targetUserId = profile.userId;

    // Get the user record to check if it exists
    const user = await ctx.db.get(targetUserId);
    if (!user) {
      throw new Error("User not found");
    }

    // CASCADE DELETE: Remove all related data

    // 1. Delete user's art pieces
    const artPieces = await ctx.db
      .query("artPieces")
      .withIndex("by_creator", (q) => q.eq("createdBy", targetUserId))
      .collect();
    
    for (const artPiece of artPieces) {
      // Delete storage files associated with art pieces
      if (artPiece.imageId) {
        await ctx.storage.delete(artPiece.imageId);
      }
      if (artPiece.videoId) {
        await ctx.storage.delete(artPiece.videoId);
      }
      await ctx.db.delete(artPiece._id);
    }

    // 2. Delete user's auction requests
    const auctionRequests = await ctx.db
      .query("auctionRequests")
      .withIndex("by_requester", (q) => q.eq("requesterId", targetUserId))
      .collect();
    
    for (const request of auctionRequests) {
      await ctx.db.delete(request._id);
    }

    // 3. Handle auctions where user is the auctioneer
    const userAuctions = await ctx.db
      .query("auctions")
      .withIndex("by_auctioneer", (q) => q.eq("auctioneerId", targetUserId))
      .collect();
    
    for (const auction of userAuctions) {
      // Cancel active auctions
      if (auction.status === "active" || auction.status === "draft") {
        await ctx.db.patch(auction._id, {
          status: "cancelled" as const,
          cancelledAt: Date.now(),
          cancelledBy: userId, // Admin who deleted the user
        });
      } else {
        // Delete completed/ended auctions
        await ctx.db.delete(auction._id);
      }
    }

    // 4. Update auctions where user is current bidder (remove current bidder)
    const auctionsWithUserBids = await ctx.db.query("auctions").collect();
    for (const auction of auctionsWithUserBids) {
      if (auction.currentBidderId === targetUserId) {
        // Find the second highest bid to set as current
        const bids = await ctx.db
          .query("bids")
          .withIndex("by_auction", (q) => q.eq("auctionId", auction._id))
          .filter((q) => q.neq(q.field("bidderId"), targetUserId))
          .order("desc")
          .collect();
        
        const nextHighestBid = bids[0];
        
        if (nextHighestBid) {
          await ctx.db.patch(auction._id, {
            currentBid: nextHighestBid.amount,
            currentBidderId: nextHighestBid.bidderId,
          });
        } else {
          // No other bids, reset to starting price
          await ctx.db.patch(auction._id, {
            currentBid: auction.startingPrice,
            currentBidderId: undefined,
          });
        }
      }
    }

    // 5. Delete user's bids
    const userBids = await ctx.db
      .query("bids")
      .withIndex("by_bidder", (q) => q.eq("bidderId", targetUserId))
      .collect();
    
    for (const bid of userBids) {
      await ctx.db.delete(bid._id);
    }

    // 6. Delete blacklist entries for this user
    const blacklistEntries = await ctx.db
      .query("blacklist")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .collect();
    
    for (const entry of blacklistEntries) {
      await ctx.db.delete(entry._id);
    }

    // 7. Delete user's notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .collect();
    
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // 8. Delete user's favorites
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .collect();
    
    for (const favorite of favorites) {
      await ctx.db.delete(favorite._id);
    }

    // 9. Handle transactions (mark as disputed or delete based on status)
    const buyerTransactions = await ctx.db.query("transactions").collect();
    const sellerTransactions = await ctx.db.query("transactions").collect();
    
    const allUserTransactions = [
      ...buyerTransactions.filter(t => t.buyerId === targetUserId),
      ...sellerTransactions.filter(t => t.sellerId === targetUserId)
    ];
    
    for (const transaction of allUserTransactions) {
      if (transaction.status === "pending" || transaction.status === "paid") {
        // Mark as disputed for manual review
        await ctx.db.patch(transaction._id, {
          status: "disputed" as const,
        });
      } else if (transaction.status === "completed") {
        // Keep completed transactions for record-keeping
        // Don't delete them
      }
    }

    // 10. Update auction requests where user was approver/rejecter (set to null)
    const allAuctionRequests = await ctx.db.query("auctionRequests").collect();
    for (const request of allAuctionRequests) {
      let needsUpdate = false;
      const updates: any = {};
      
      if (request.approvedBy === targetUserId) {
        updates.approvedBy = undefined;
        needsUpdate = true;
      }
      if (request.rejectedBy === targetUserId) {
        updates.rejectedBy = undefined;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await ctx.db.patch(request._id, updates);
      }
    }

    // 11. Update blacklist entries where user was the one who added others
    const blacklistEntriesAddedByUser = await ctx.db.query("blacklist").collect();
    for (const entry of blacklistEntriesAddedByUser) {
      if (entry.addedBy === targetUserId) {
        await ctx.db.patch(entry._id, {
          addedBy: userId, // Transfer to the admin who deleted the user
        });
      }
    }

    // 12. Finally, delete the user profile and user record
    await ctx.db.delete(args.profileId);
    await ctx.db.delete(targetUserId);

    return { success: true };
  },
});

// blicklist status
export const toggleBlacklist = mutation({
  args: {
    profileId: v.id("userProfiles"),
    reason: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean(), isBlacklisted: v.boolean() }),
  handler: async (ctx, args) => {
    const adminUserId = await getLoggedInUser(ctx);
    
    // check if user is admin
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", adminUserId))
      .first();
    
    if (!adminProfile?.isAdmin) {
      throw new Error("Admin access required");
    }

    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    if (profile.isAdmin) {
      throw new Error("Cannot blacklist admin profile");
    }

    const user = await ctx.db.get(profile.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const existingEntry = await ctx.db
      .query("blacklist")
      .withIndex("by_user", (q) => q.eq("userId", profile.userId))
      .first();

    if (existingEntry) {
      await ctx.db.delete(existingEntry._id);
      return { success: true, isBlacklisted: false };
    } else {
      await ctx.db.insert("blacklist", {
        userId: profile.userId,
        email: user.email,
        reason: args.reason || "Added by admin",
        addedBy: adminUserId,
      });
      return { success: true, isBlacklisted: true };
    }
  },
});
