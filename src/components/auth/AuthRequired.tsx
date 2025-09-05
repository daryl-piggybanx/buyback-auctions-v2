import { Authenticated, Unauthenticated } from "convex/react";
import { EnhancedSignIn } from "~/components/auth/EnhancedSignIn";

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
          <div className="p-8 mx-auto w-full max-w-md">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-gray-900">Welcome to ArtAuction</h2>
              <p className="mb-4 text-gray-600">
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
