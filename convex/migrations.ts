import { internalMutation } from "./_generated/server";

export const addAdminFieldToExistingProfiles = internalMutation({
  args: {},
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
