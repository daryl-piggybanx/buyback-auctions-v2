import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '~/convex/_generated/api'
import { Id } from '~/convex/_generated/dataModel'
import { AuthRequired } from '~/components/auth/AuthRequired'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/auctions/$auctionId')({
  component: AuctionDetailPage,
})

function AuctionDetailPage() {
  const { auctionId } = Route.useParams()
  const navigate = useNavigate()
  const [bidAmount, setBidAmount] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)

  const auctionDetails = useQuery(api.auctions.getAuctionDetails, {
    auctionId: auctionId as Id<"auctions">
  })
  const currentUser = useQuery(api.auth.loggedInUser)
  const userProfile = useQuery(api.users.getUserProfile, {})
  const isBlacklisted = useQuery(api.users.checkIfUserIsBlacklisted, {})
  const placeBid = useMutation(api.auctions.placeBid)

  useEffect(() => {
    if (auctionDetails) {
      setTimeLeft(auctionDetails.timeRemaining)
    }
  }, [auctionDetails])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user has profile
    if (!userProfile) {
      toast.error("You must create a profile before bidding")
      return
    }
    
    // Check if user is blacklisted
    if (isBlacklisted) {
      toast.error("Your account has been restricted from placing bids")
      return
    }
    
    const amount = parseFloat(bidAmount)
    
    if (amount <= auctionDetails!.currentBid) {
      toast.error("Bid must be higher than current bid")
      return
    }

    try {
      await placeBid({ 
        auctionId: auctionId as Id<"auctions">, 
        amount 
      })
      toast.success("Bid placed successfully!")
      setBidAmount("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place bid")
    }
  }

  if (auctionDetails === undefined || currentUser === undefined || userProfile === undefined || isBlacklisted === undefined) {
    return (
      <div className="px-4 py-8 mx-auto max-w-4xl">
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
        </div>
      </div>
    )
  }

  if (auctionDetails === null) {
    return (
      <div className="px-4 py-8 mx-auto max-w-4xl">
        <div className="py-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Auction Not Found</h2>
          <p className="text-gray-600">The auction you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const isEnded = timeLeft <= 0 || auctionDetails.status !== "active"
  const isOwner = currentUser?._id === auctionDetails.auctioneerId
  const isCurrentWinner = currentUser?._id === auctionDetails.currentBidderId

  return (
    <AuthRequired>
      <div className="px-4 py-8 mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="flex gap-2 items-center mb-2 text-sm text-gray-600">
            <span>Auctions</span>
            <span>→</span>
            <span className="font-medium text-gray-900">{auctionDetails.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{auctionDetails.title}</h1>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              {auctionDetails.imageUrl && (
                <img 
                  src={auctionDetails.imageUrl} 
                  alt={auctionDetails.title}
                  className="object-cover mb-4 w-full h-64 rounded-lg"
                />
              )}

              {auctionDetails.videoUrl && (
                <div className="overflow-hidden mb-4 rounded-lg aspect-video">
                  <video 
                    src={auctionDetails.videoUrl} 
                    controls
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              
              <h2 className="mb-4 text-xl font-bold text-gray-900">{auctionDetails.title}</h2>
              <p className="mb-6 text-gray-600">{auctionDetails.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Auctioneer:</span>
                  <span className="text-gray-900">{auctionDetails.auctioneer}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Starting Price:</span>
                  <span className="text-gray-900">${auctionDetails.startingPrice.toLocaleString()}</span>
                </div>
                
                {auctionDetails.artPiece?.category && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="text-gray-900">{auctionDetails.artPiece.category}</span>
                  </div>
                )}
                
                {auctionDetails.artPiece?.dimensions && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Dimensions:</span>
                    <span className="text-gray-900">{auctionDetails.artPiece.dimensions}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Started:</span>
                  <span className="text-gray-900">{new Date(auctionDetails.startTime).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Ends:</span>
                  <span className="text-gray-900">{new Date(auctionDetails.endTime).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="space-y-6">
                {/* Current Bid Section */}
                <div className="p-4 space-y-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-700">Current Winning Bid</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${auctionDetails.currentBid.toLocaleString()}
                    </span>
                  </div>
                  
                  {auctionDetails.currentBidderId && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Winner:</span>
                      <span className={`text-sm font-medium ${
                        isCurrentWinner ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {isCurrentWinner ? 'You!' : 'Someone else'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Bids:</span>
                    <span className="text-sm font-medium">{auctionDetails.bidCount}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
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
                      <span className="text-sm text-gray-600">Time Remaining:</span>
                      <span className={`text-sm font-medium ${
                        isEnded ? "text-red-600" : timeLeft < 60 * 60 * 1000 ? "text-orange-600" : "text-gray-900"
                      }`}>
                        {isEnded ? "AUCTION ENDED" : formatTime(timeLeft)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Messages */}
                {auctionDetails.isLocked && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700">
                      Auction temporarily locked for bid processing
                    </p>
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

                {/* Profile Required Message */}
                {!userProfile && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="mb-2 font-medium text-blue-900">Profile Required</h3>
                    <p className="text-sm text-blue-700">
                      You must create a profile before you can place bids on auctions.
                    </p>
                    <button 
                      onClick={() => void navigate({ to: '/profile' })}
                      className="px-3 py-1 mt-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Create Profile
                    </button>
                  </div>
                )}

                {/* Blacklisted User Message */}
                {userProfile && isBlacklisted && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="mb-2 font-medium text-red-900">Account Restricted</h3>
                    <p className="text-sm text-red-700">
                      Your account has been restricted from placing bids. Please contact support if you believe this is an error.
                    </p>
                  </div>
                )}

                {/* Bidding Form */}
                {userProfile && !isBlacklisted && !isEnded && !auctionDetails.isLocked && !isOwner && auctionDetails.status === "active" && (
                  <div className="p-4 space-y-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900">Place Your Bid</h4>
                    <form onSubmit={handlePlaceBid} className="space-y-3">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Minimum bid: $${(auctionDetails.currentBid + 1).toLocaleString()}`}
                        min={auctionDetails.currentBid + 1}
                        step="1"
                        className="px-4 py-3 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-3 w-full font-medium text-white bg-green-600 rounded-md transition-colors hover:bg-green-700"
                      >
                        Place Bid
                      </button>
                    </form>
                  </div>
                )}

                {isOwner && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="mb-2 font-medium text-blue-900">Your Auction</h3>
                    <p className="text-sm text-blue-700">
                      You are the owner of this auction and cannot place bids.
                    </p>
                  </div>
                )}

                {/* Bid History */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="mb-3 font-medium text-gray-900">Recent Bids</h3>
                  <div className="overflow-y-auto space-y-2 max-h-64">
                    {auctionDetails.bidHistory.length === 0 ? (
                      <p className="text-sm text-gray-500">No bids yet</p>
                    ) : (
                      auctionDetails.bidHistory.map((bid) => (
                        <div key={bid._id} className="flex justify-between items-center px-3 py-2 bg-white rounded">
                          <span className={`text-sm font-medium ${
                            bid.bidderId === currentUser?._id ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {bid.bidderId === currentUser?._id ? 'You' : bid.bidderName}
                          </span>
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

              <div className="pt-4 mt-6 border-t">
                <button 
                  onClick={() => void navigate({ to: '/auctions' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md transition-colors hover:bg-gray-200"
                >
                  ← Back to All Auctions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthRequired>
  )
}
