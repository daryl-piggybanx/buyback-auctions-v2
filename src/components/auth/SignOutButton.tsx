"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "@tanstack/react-router";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to root after successful sign out
      await router.navigate({ to: '/' });
    } catch (error) {
      console.error('Sign out failed:', error);
      // Still redirect to root even if there's an error
      await router.navigate({ to: '/' });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 font-semibold bg-white rounded border border-gray-200 shadow-sm transition-colors text-secondary hover:bg-gray-50 hover:text-secondary-hover hover:shadow"
      onClick={handleSignOut}
    >
      Sign out
    </button>
  );
}
