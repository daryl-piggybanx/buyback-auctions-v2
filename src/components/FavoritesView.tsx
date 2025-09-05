import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { AuctionCard } from "./AuctionCard";

export function FavoritesView() {
  const favorites = useQuery(api.favorites.getUserFavorites);

  if (favorites === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Favorites</h2>
        <span className="text-sm text-gray-500">{favorites.length} auction{favorites.length !== 1 ? 's' : ''}</span>
      </div>

      {favorites.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">💝</div>
          <p className="mb-2 text-lg text-gray-500">No favorite auctions yet</p>
          <p className="text-gray-400">Click the heart icon on auctions to add them to your favorites!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.filter(auction => auction !== null).map((auction) => (
            <div key={auction!._id} className="relative">
              <AuctionCard auction={auction!} />
              <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white bg-red-500 rounded">
                Favorited {new Date((auction as any).favoritedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
