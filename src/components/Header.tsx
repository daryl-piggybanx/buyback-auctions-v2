import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { SignOutButton } from "./auth/SignOutButton";
import { Link, useLocation } from '@tanstack/react-router'

export function Header() {
  const userProfile = useQuery(api.users.getUserProfile, {});
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/auctions') {
      return location.pathname === '/' || location.pathname === '/auctions';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-10 border-b shadow-sm backdrop-blur-sm bg-white/80">
      <div className="flex justify-between items-center px-4 mx-auto max-w-7xl h-16">
        <div className="flex gap-8 items-center">
          <Link to="/auctions" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
            eBanx
          </Link>
          <nav className="flex gap-6">
            <Link
              to="/auctions"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${ isActive("/auctions") 
                  ? "text-blue-700 bg-blue-100" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Live Auctions
            </Link>
            <Link
              to="/archive"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${ isActive("/archive") 
                  ? "text-blue-700 bg-blue-100" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Archive
            </Link>
            <Authenticated>
              <Link
                to="/favorites"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${ isActive("/favorites") 
                    ? "text-blue-700 bg-blue-100" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Favorites
              </Link>
              <Link
                to="/requests"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${ isActive("/requests") 
                    ? "text-blue-700 bg-blue-100" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Requests
              </Link>
              <Link
                to="/request-auction"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${ isActive("/request-auction") 
                    ? "text-blue-700 bg-blue-100" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Request Auction
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${ isActive("/profile") 
                    ? "text-blue-700 bg-blue-100" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Profile
              </Link>
              <Link
                to="/notifications"
                className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${ isActive("/notifications") 
                    ? "text-blue-700 bg-blue-100" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Notifications
                {userProfile?.notifications && userProfile.notifications.length > 0 && (
                  <span className="flex absolute -top-1 -right-1 justify-center items-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {userProfile.notifications.length}
                  </span>
                )}
              </Link>
              {userProfile?.isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${ isActive("/admin") 
                      ? "text-red-700 bg-red-100" 
                      : "text-red-600 hover:text-red-700"
                  }`}
                >
                  Admin Panel
                </Link>
              )}
            </Authenticated>
          </nav>
        </div>
        <div className="flex gap-4 items-center">
          <Authenticated>
            {userProfile?.isAdmin && (
              <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded">
                ADMIN
              </span>
            )}
            <SignOutButton />
          </Authenticated>
          <Unauthenticated>
            <div className="text-sm text-gray-600">
              <span className="mr-2">Viewing anonymously</span>
              <Link 
                to="/auth"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Sign In
              </Link>
            </div>
          </Unauthenticated>
        </div>
      </div>
    </header>
  );
}
