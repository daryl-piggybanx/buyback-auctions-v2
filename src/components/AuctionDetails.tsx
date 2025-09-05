import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isEnded = timeLeft <= 0 || auctionDetails.status !== "active";
  const isOwner = currentUser?._id === auctionDetails.auctioneerId;

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back to Auctions
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {auctionDetails.imageUrl && (
            <div className="aspect-square overflow-hidden rounded-lg">
              <img 
                src={auctionDetails.imageUrl} 
                alt={auctionDetails.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {auctionDetails.videoUrl && (
            <div className="aspect-video overflow-hidden rounded-lg">
              <video 
                src={auctionDetails.videoUrl} 
                controls
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{auctionDetails.title}</h1>
            <p className="text-gray-600 mb-4">{auctionDetails.description}</p>
            <p className="text-sm text-gray-500">by {auctionDetails.auctioneer}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
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
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              Auction temporarily locked for bid processing
            </div>
          )}

          {auctionDetails.status === "completed" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Auction Completed</h3>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                Place Bid
              </button>
            </form>
          )}

          <div className="border-t pt-4 mt-6">
            <h3 className="font-medium text-gray-900 mb-3">Recent Bids</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {auctionDetails.bidHistory.length === 0 ? (
                <p className="text-gray-500 text-sm">No bids yet</p>
              ) : (
                auctionDetails.bidHistory.map((bid) => (
                  <div key={bid._id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
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
