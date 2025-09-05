import { useEffect } from 'react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';

export function ProfileManager({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.users.getUserProfile, {});
  const createProfile = useMutation(api.users.createProfileAfterSignup);

  useEffect(() => {
    const createProfileIfNeeded = async () => {
      if (isAuthenticated && user && !userProfile) {
        try {
          // Extract username from user name or email
          let username = user.name || user.email?.split('@')[0] || 'user';
          
          // Clean username to only contain valid characters
          username = username.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
          
          // Ensure minimum length
          if (username.length < 3) {
            username = `user${Date.now()}`;
          }
          
          await createProfile({
            username: username,
          });
        } catch (error) {
          console.error('Failed to create user profile:', error);
          // Don't show error to user as this is automatic
        }
      }
    };

    createProfileIfNeeded();
  }, [isAuthenticated, user, userProfile, createProfile]);

  return <>{children}</>;
}
