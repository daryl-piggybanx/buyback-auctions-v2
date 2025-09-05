import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AuctionCard } from "./AuctionCard";

export function FavoritesView() {
  const favorites = useQuery(api.favorites.getUserFavorites);

  if (favorites === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💝</div>
          <p className="text-gray-500 text-lg mb-2">No favorite auctions yet</p>
          <p className="text-gray-400">Click the heart icon on auctions to add them to your favorites!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.filter(auction => auction !== null).map((auction) => (
            <div key={auction!._id} className="relative">
              <AuctionCard auction={auction!} />
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                Favorited {new Date((auction as any).favoritedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
