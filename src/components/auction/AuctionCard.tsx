import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

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
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(auction.timeRemaining);
  const [timeToStart, setTimeToStart] = useState(auction.timeToStart || 0);
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

  const handleNavigateToAuction = () => {
    navigate({ to: `/auctions/${auction._id}` });
  };

  const isEnded = timeLeft <= 0 && auction.status === "active";
  const isUrgent = timeLeft < 60 * 60 * 1000; // Less than 1 hour
  const isScheduled = auction.status === "draft" && timeToStart > 0;

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-md transition-shadow hover:shadow-lg">
      {auction.imageUrl && (
        <div className="overflow-hidden relative aspect-square">
          <img 
            src={auction.imageUrl} 
            alt={auction.title}
            className="object-cover w-full h-full"
          />
          {userProfile && (
            <button
              onClick={() => void handleToggleFavorite()}
              className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                isFavorited 
                  ? "text-white bg-red-500 hover:bg-red-600" 
                  : "text-gray-600 bg-white/80 hover:bg-white hover:text-red-500"
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
          <h3 className="text-lg font-semibold text-gray-900 truncate">{auction.title}</h3>
          <p className="text-sm text-gray-600">by @{auction.auctioneer}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Bid</span>
            <span className="text-lg font-bold text-green-600">
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
          <div className="px-3 py-2 text-sm text-yellow-700 bg-yellow-100 rounded border border-yellow-400">
            Auction temporarily locked for bid processing
          </div>
        )}

        {isScheduled && (
          <div className="px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded border border-blue-200">
            <p className="font-medium">Auction Scheduled</p>
            <p>This auction will start in {formatTime(timeToStart)}</p>
          </div>
        )}

        {/* Navigation button - always visible */}
        <div className="space-y-2">
          <button
            onClick={handleNavigateToAuction}
            className="px-4 py-2 w-full font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
          >
            {isEnded ? "View Results" : isScheduled ? "View Auction" : "View Details"}
          </button>
          
          {!userProfile && (
            <div className="p-3 text-sm text-blue-700 bg-blue-50 rounded border border-blue-200">
              <p className="font-medium">Create a profile to participate</p>
              <p>You can view auctions anonymously, but need a profile to bid or favorite auctions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
