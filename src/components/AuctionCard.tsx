import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface AuctionCardProps {
  auction: {
    _id: Id<"auctions">;
    title: string;
    currentBid: number;
    bidCount: number;
    timeRemaining: number;
    timeToStart?: number;
    imageUrl: string | null;
    auctioneer: string;
    status: string;
    isLocked: boolean;
  };
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState(auction.timeRemaining);
  const [timeToStart, setTimeToStart] = useState(auction.timeToStart || 0);
  const [showBidForm, setShowBidForm] = useState(false);
  const placeBid = useMutation(api.auctions.placeBid);
  const toggleFavorite = useMutation(api.favorites.toggleFavorite);
  const userProfile = useQuery(api.users.getUserProfile, {});
  const isFavorited = useQuery(api.favorites.checkIsFavorited, { auctionId: auction._id });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1000));
      setTimeToStart(prev => Math.max(0, prev - 1000));
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
    
    if (!userProfile) {
      toast.error("You must create a profile before bidding");
      return;
    }
    
    const amount = parseFloat(bidAmount);
    
    if (amount <= auction.currentBid) {
      toast.error("Bid must be higher than current bid");
      return;
    }

    try {
      await placeBid({ auctionId: auction._id, amount });
      toast.success("Bid placed successfully!");
      setBidAmount("");
      setShowBidForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place bid");
    }
  };

  const handleToggleFavorite = async () => {
    if (!userProfile) {
      toast.error("You must create a profile to favorite auctions");
      return;
    }

    try {
      const result = await toggleFavorite({ auctionId: auction._id });
      toast.success(result.favorited ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update favorites");
    }
  };

  const isEnded = timeLeft <= 0 && auction.status === "active";
  const isUrgent = timeLeft < 60 * 60 * 1000; // Less than 1 hour
  const isScheduled = auction.status === "draft" && timeToStart > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {auction.imageUrl && (
        <div className="aspect-square overflow-hidden relative">
          <img 
            src={auction.imageUrl} 
            alt={auction.title}
            className="w-full h-full object-cover"
          />
          {userProfile && (
            <button
              onClick={handleToggleFavorite}
              className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                isFavorited 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
              }`}
            >
              <svg className="w-5 h-5" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      )}
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 truncate">{auction.title}</h3>
          <p className="text-sm text-gray-600">by @{auction.auctioneer}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Bid</span>
            <span className="font-bold text-lg text-green-600">
              ${auction.currentBid.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Bids</span>
            <span className="text-sm font-medium">{auction.bidCount}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {isScheduled ? "Starts In" : "Time Left"}
            </span>
            <span className={`text-sm font-medium ${
              isEnded ? "text-red-600" : isUrgent ? "text-orange-600" : isScheduled ? "text-blue-600" : "text-gray-900"
            }`}>
              {isEnded ? "ENDED" : isScheduled ? formatTime(timeToStart) : formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {auction.isLocked && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm">
            Auction temporarily locked for bid processing
          </div>
        )}

        {isScheduled && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded text-sm">
            <p className="font-medium">Auction Scheduled</p>
            <p>This auction will start in {formatTime(timeToStart)}</p>
          </div>
        )}

        {!isEnded && !auction.isLocked && !isScheduled && (
          <div className="space-y-2">
            {!showBidForm ? (
              <button
                onClick={() => {
                  if (!userProfile) {
                    toast.error("You must create a profile before bidding");
                    return;
                  }
                  setShowBidForm(true);
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                {userProfile ? "Place Bid" : "Sign In to Bid"}
              </button>
            ) : (
              <form onSubmit={handlePlaceBid} className="space-y-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min: $${(auction.currentBid + 1).toLocaleString()}`}
                  min={auction.currentBid + 1}
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    Bid ${bidAmount || "0"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBidForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {!userProfile && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
            <p className="font-medium">Create a profile to participate</p>
            <p>You can view auctions anonymously, but need a profile to bid or favorite auctions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
