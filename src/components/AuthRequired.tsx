import { Authenticated, Unauthenticated } from "convex/react";
import { EnhancedSignIn } from "./EnhancedSignIn";

interface AuthRequiredProps {
  children: React.ReactNode;
}

export function AuthRequired({ children }: AuthRequiredProps) {
  return (
    <>
      <Authenticated>
        {children}
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-full max-w-md mx-auto p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ArtAuction</h2>
              <p className="text-gray-600 mb-4">
                You can browse auctions anonymously, but you'll need to create an account to request auctions, bid, or favorite items.
              </p>
              <p className="text-sm text-gray-500">
                Your email will remain private - only your username will be visible to other users.
              </p>
            </div>
            <EnhancedSignIn />
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}
