import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { toast } from "sonner";

interface AuctionDetailsProps {
  auctionId: Id<"auctions">;
  onBack: () => void;
}

export function AuctionDetails({ auctionId, onBack }: AuctionDetailsProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const auctionDetails = useQuery(api.auctions.getAuctionDetails, { auctionId });
  const placeBid = useMutation(api.auctions.placeBid);
  const currentUser = useQuery(api.auth.loggedInUser);

  useEffect(() => {
    if (auctionDetails) {
      setTimeLeft(auctionDetails.timeRemaining);
    }
  }, [auctionDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    
    if (amount <= auctionDetails!.currentBid) {
      toast.error("Bid must be higher than current bid");
      return;
    }

    try {
      await placeBid({ auctionId, amount });
      toast.success("Bid placed successfully!");
      setBidAmount("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place bid");
    }
  };

  if (!auctionDetails) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
      </div>
    );
  }

  const isEnded = timeLeft <= 0 || auctionDetails.status !== "active";
  const isOwner = currentUser?._id === auctionDetails.auctioneerId;

  return (
    <div className="mx-auto max-w-6xl">
      <button
        onClick={onBack}
        className="mb-6 font-medium text-blue-600 hover:text-blue-700"
      >
        ← Back to Auctions
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {auctionDetails.imageUrl && (
            <div className="overflow-hidden rounded-lg aspect-square">
              <img 
                src={auctionDetails.imageUrl} 
                alt={auctionDetails.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {auctionDetails.videoUrl && (
            <div className="overflow-hidden rounded-lg aspect-video">
              <video 
                src={auctionDetails.videoUrl} 
                controls
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{auctionDetails.title}</h1>
            <p className="mb-4 text-gray-600">{auctionDetails.description}</p>
            <p className="text-sm text-gray-500">by {auctionDetails.auctioneer}</p>
          </div>

          <div className="p-4 space-y-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">Current Bid</span>
              <span className="text-2xl font-bold text-green-600">
                ${auctionDetails.currentBid.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Bids</span>
              <span className="text-sm font-medium">{auctionDetails.bidCount}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                auctionDetails.status === "active" ? "bg-green-100 text-green-800" :
                auctionDetails.status === "completed" ? "bg-blue-100 text-blue-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {auctionDetails.status === "completed" ? "Sold" : 
                 auctionDetails.status === "active" ? "Active" : 
                 auctionDetails.status.charAt(0).toUpperCase() + auctionDetails.status.slice(1)}
              </span>
            </div>

            {auctionDetails.status === "active" && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Time Remaining</span>
                <span className={`text-sm font-medium ${
                  isEnded ? "text-red-600" : timeLeft < 60 * 60 * 1000 ? "text-orange-600" : "text-gray-900"
                }`}>
                  {isEnded ? "AUCTION ENDED" : formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>

          {auctionDetails.isLocked && (
            <div className="px-4 py-3 text-yellow-700 bg-yellow-100 rounded border border-yellow-400">
              Auction temporarily locked for bid processing
            </div>
          )}

          {auctionDetails.status === "completed" && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="mb-2 font-medium text-blue-900">Auction Completed</h3>
              <p className="text-sm text-blue-700">
                This auction has ended and the winning bid has been automatically accepted.
              </p>
            </div>
          )}

          {!isEnded && !auctionDetails.isLocked && !isOwner && auctionDetails.status === "active" && (
            <form onSubmit={handlePlaceBid} className="space-y-3">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Minimum bid: $${(auctionDetails.currentBid + 1).toLocaleString()}`}
                min={auctionDetails.currentBid + 1}
                step="1"
                className="px-4 py-3 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-3 w-full font-medium text-white bg-green-600 rounded-md transition-colors hover:bg-green-700"
              >
                Place Bid
              </button>
            </form>
          )}

          <div className="pt-4 mt-6 border-t">
            <h3 className="mb-3 font-medium text-gray-900">Recent Bids</h3>
            <div className="overflow-y-auto space-y-2 max-h-64">
              {auctionDetails.bidHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No bids yet</p>
              ) : (
                auctionDetails.bidHistory.map((bid) => (
                  <div key={bid._id} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{bid.bidderName}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">${bid.amount.toLocaleString()}</span>
                      <div className="text-xs text-gray-500">
                        {new Date(bid.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
