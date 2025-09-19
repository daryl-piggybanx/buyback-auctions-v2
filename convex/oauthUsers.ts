import { v } from "convex/values";
import { mutation } from "./_generated/server";
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

export const createOrUpdateProfileFromAuth = mutation({
  args: {},
  returns: v.union(v.null(), v.id("userProfiles")),
  handler: async (ctx) => {
    const userId = await getLoggedInUser(ctx);
    const user = await ctx.db.get(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (existingProfile) {
      // Update admin status if needed
      const isAdmin = user.email ? isAdminEmail(user.email) : false;
      if (existingProfile.isAdmin !== isAdmin) {
        await ctx.db.patch(existingProfile._id, { isAdmin });
      }
      return existingProfile._id;
    }

    // Create profile for OAuth users
    if (user.email) {
      const isAdmin = isAdminEmail(user.email);
      const baseUsername = user.email.split('@')[0];
      const randomSuffix = Math.random().toString(36).substr(2, 4);
      const username = `${baseUsername}_${randomSuffix}`;

      return await ctx.db.insert("userProfiles", {
        userId,
        username,
        totalBids: 0,
        totalWins: 0,
        totalAuctions: 0,
        rating: 5.0,
        isVerified: true, // OAuth users are verified
        joinedAt: Date.now(),
        isAdmin,
        isBlacklisted: false, // Default to not blacklisted
      });
    }

    return null;
  },
});
