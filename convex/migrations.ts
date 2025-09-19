import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const addAdminFieldToExistingProfiles = internalMutation({
  args: {},
  returns: v.object({ updated: v.number() }),
  handler: async (ctx) => {
    const profiles = await ctx.db.query("userProfiles").collect();
    
    for (const profile of profiles) {
      if (profile.isAdmin === undefined) {
        // Get user email to check if admin
        const user = await ctx.db.get(profile.userId);
        const isAdmin = user?.email ? user.email.endsWith("@piggybanxinc.com") : false;
        
        await ctx.db.patch(profile._id, {
          isAdmin,
        });
      }
    }
    
    return { updated: profiles.length };
  },
});

export const addIsBlacklistedFieldToExistingProfiles = internalMutation({
  args: {},
  returns: v.object({ updated: v.number() }),
  handler: async (ctx) => {
    const profiles = await ctx.db.query("userProfiles").collect();
    let updated = 0;
    
    for (const profile of profiles) {
      // Check if the profile is missing the isBlacklisted field
      if ((profile as any).isBlacklisted === undefined) {
        await ctx.db.patch(profile._id, {
          isBlacklisted: false, // Default to not blacklisted
        });
        updated++;
      }
    }
    
    return { updated };
  },
});

export const removeDisplayNameFromExistingProfiles = internalMutation({
  args: {},
  returns: v.object({ updated: v.number() }),
  handler: async (ctx) => {
    const profiles = await ctx.db.query("userProfiles").collect();
    let updated = 0;
    
    for (const profile of profiles) {
      // Check if the profile has the displayName field that needs to be removed
      if ((profile as any).displayName !== undefined) {
        // Replace the entire document without the displayName field
        await ctx.db.replace(profile._id, {
          userId: profile.userId,
          username: profile.username,
          bio: profile.bio,
          location: profile.location,
          totalBids: profile.totalBids,
          totalWins: profile.totalWins,
          totalAuctions: profile.totalAuctions,
          rating: profile.rating,
          isVerified: profile.isVerified,
          joinedAt: profile.joinedAt,
          isAdmin: profile.isAdmin,
          isBlacklisted: profile.isBlacklisted,
          emailNotifications: profile.emailNotifications,
        });
        updated++;
      }
    }
    
    return { updated };
  },
});
