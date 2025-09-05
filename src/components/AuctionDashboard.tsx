import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AuctionCard } from "./AuctionCard";
import { useState } from "react";

export function AuctionDashboard() {
  const auctions = useQuery(api.auctions.getAllCurrentAuctions);
  const [filter, setFilter] = useState<"all" | "ending-soon">("all");

  if (auctions === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredAuctions = auctions.filter(auction => {
    if (filter === "ending-soon") {
      return auction.timeRemaining < 60 * 60 * 1000; // Less than 1 hour
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Live Auctions</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "all" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Auctions
          </button>
          <button
            onClick={() => setFilter("ending-soon")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "ending-soon" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Ending Soon
          </button>
        </div>
      </div>

      {filteredAuctions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No active auctions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
