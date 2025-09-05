import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { AuctionCard } from "./AuctionCard";
import { useState } from "react";

export function AuctionDashboard() {
  const auctions = useQuery(api.auctions.getAllCurrentAuctions);
  const [filter, setFilter] = useState<"all" | "ending-soon">("all");

  if (auctions === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
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
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">No active auctions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAuctions.map((auction) => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
