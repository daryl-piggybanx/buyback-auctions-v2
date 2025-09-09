import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

export function ArchivedAuctionsView() {
  const [filter, setFilter] = useState<"completed" | "ended">("completed");
  const completedAuctions = useQuery(api.archivedAuctions.getArchivedAuctions);
  const endedAuctions = useQuery(api.archivedAuctions.getEndedAuctions);

  const auctions = filter === "completed" ? completedAuctions : endedAuctions;

  if (auctions === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Archived Auctions</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "completed" 
                ? "bg-green-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Sold ({completedAuctions?.length || 0})
          </button>
          <button
            onClick={() => setFilter("ended")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "ended" 
                ? "bg-gray-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Unsold ({endedAuctions?.length || 0})
          </button>
        </div>
      </div>

      {auctions.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">📦</div>
          <p className="mb-2 text-lg text-gray-500">
            No {filter === "completed" ? "sold" : "unsold"} auctions yet
          </p>
          <p className="text-gray-400">
            {filter === "completed" 
              ? "Completed auctions will appear here" 
              : "Auctions that ended without bids will appear here"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => (
            <div key={auction._id} className="overflow-hidden bg-white rounded-lg shadow-md">
              {auction.imageUrl && (
                <div className="overflow-hidden aspect-square">
                  <img 
                    src={auction.imageUrl} 
                    alt={auction.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{auction.title}</h3>
                  <p className="text-sm text-gray-600">by @{auction.auctioneer}</p>
                </div>

                <div className="space-y-2">
                  {filter === "completed" ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sold For</span>
                        <span className="text-lg font-bold text-green-600">
                          ${auction.currentBid.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Winner</span>
                        <span className="text-sm font-medium">@{(auction as any).winner}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sold Date</span>
                        <span className="text-sm text-gray-900">
                          {new Date(auction.endTime).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Starting Price</span>
                        <span className="text-lg font-bold text-gray-600">
                          ${auction.startingPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Bids</span>
                        <span className="text-sm font-medium">{auction.bidCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ended Date</span>
                        <span className="text-sm text-gray-900">
                          {new Date(auction.endTime).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className={`px-3 py-2 rounded text-center text-sm font-medium ${
                  filter === "completed" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {filter === "completed" ? "SOLD" : "NO SALE"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
