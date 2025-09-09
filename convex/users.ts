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
      displayName: args.username, // Use username as display name initially
      totalBids: 0,
      totalWins: 0,
      totalAuctions: 0,
      rating: 5.0,
      isVerified: false,
      joinedAt: Date.now(),
      isAdmin,
    });
  },
});

export const createUserProfile = mutation({
  args: {
    username: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
  },
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
      displayName: args.displayName,
      bio: args.bio,
      location: args.location,
      totalBids: 0,
      totalWins: 0,
      totalAuctions: 0,
      rating: 5.0,
      isVerified: false,
      joinedAt: Date.now(),
      isAdmin,
    });
  },
});

export const getUserProfile = query({
  args: { userId: v.optional(v.id("users")) },
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
    
    // Get unread notifications count
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();
    
    return {
      ...profile,
      email: user?.email, // Only return email for own profile
      notifications: notifications,
    };
  },
});

export const checkUsernameAvailability = query({
  args: { username: v.string() },
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
    userId: v.id("users"),
    reason: v.string(),
  },
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
    
    await ctx.db.insert("blacklist", {
      userId: args.userId,
      reason: args.reason,
      addedBy: adminUserId,
      isActive: true,
    });

    return { success: true };
  },
});
