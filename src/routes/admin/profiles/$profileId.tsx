import { createFileRoute } from '@tanstack/react-router'
import { AuthRequired } from '~/components/auth/AuthRequired'
import { api } from '~/convex/_generated/api'
import { useQuery, useMutation } from 'convex/react'
import { Button } from '~/components/ui/button'
import { Doc, Id } from '~/convex/_generated/dataModel'
import { ArrowLeft, User, Mail, Calendar, Star, Trophy, Gavel, AlertTriangle, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/profiles/$profileId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { profileId } = Route.useParams()
  const navigate = useNavigate()
  const profileDetails = useQuery(api.users.getProfileDetails, { 
    profileId: profileId as Id<"userProfiles"> 
  })
  const toggleBlacklist = useMutation(api.users.toggleBlacklist)
  const deleteProfile = useMutation(api.users.deleteProfile)
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false)
  const [blacklistReason, setBlacklistReason] = useState('')

  const handleToggleBlacklist = async () => {
    if (!profileDetails) return
    
    try {
      await toggleBlacklist({ 
        profileId: profileId as Id<"userProfiles">, 
        reason: blacklistReason || undefined 
      })
      setShowBlacklistDialog(false)
      setBlacklistReason('')
    } catch (error) {
      console.error('Failed to toggle blacklist:', error)
    }
  }

  const handleDeleteProfile = async () => {
    try {
      await deleteProfile({ profileId: profileId as Id<"userProfiles"> })
      setShowDeleteDialog(false)
      // Navigate back to profiles list
      void navigate({ to: '/admin/profiles' })
    } catch (error) {
      console.error('Failed to delete profile:', error)
    }
  }

  if (!profileDetails) {
    return (
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <AuthRequired>
          <div>Loading profile details...</div>
        </AuthRequired>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <AuthRequired>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/admin/profiles">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Profiles
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Profile Details</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={profileDetails.isBlacklisted ? "outline" : "destructive"}
                onClick={() => setShowBlacklistDialog(true)}
                disabled={profileDetails.isAdmin}
              >
                <AlertTriangle className="mr-2 w-4 h-4" />
                {profileDetails.isBlacklisted ? "Remove from Blacklist" : "Add to Blacklist"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={profileDetails.isAdmin}
              >
                <Trash2 className="mr-2 w-4 h-4" />
                Delete Profile
              </Button>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <h2 className="flex items-center mb-4 text-xl font-semibold">
                <User className="mr-2 w-5 h-5" />
                Profile Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Username</label>
                  <p className="text-lg">{profileDetails.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Display Name</label>
                  <p className="text-lg">{profileDetails.displayName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="flex items-center text-lg">
                    <Mail className="mr-2 w-4 h-4" />
                    {profileDetails.email || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  <p className="text-sm text-gray-700">{profileDetails.bio || "No bio provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-sm">{profileDetails.location || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Joined</label>
                  <p className="flex items-center text-sm">
                    <Calendar className="mr-2 w-4 h-4" />
                    {new Date(profileDetails.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${profileDetails.isAdmin ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                    {profileDetails.isAdmin ? "Admin" : "User"}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${profileDetails.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {profileDetails.isVerified ? "Verified" : "Unverified"}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${profileDetails.isBlacklisted ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                    {profileDetails.isBlacklisted ? "Blacklisted" : "Active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <h2 className="flex items-center mb-4 text-xl font-semibold">
                <Trophy className="mr-2 w-5 h-5" />
                Activity Statistics
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Bids</label>
                    <p className="text-2xl font-bold">{profileDetails.totalBids}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Wins</label>
                    <p className="text-2xl font-bold">{profileDetails.totalWins}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Auctions</label>
                    <p className="text-2xl font-bold">{profileDetails.totalAuctions}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rating</label>
                    <p className="flex items-center text-2xl font-bold">
                      <Star className="mr-1 w-5 h-5 text-yellow-500" />
                      {profileDetails.rating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blacklist Information */}
          {profileDetails.isBlacklisted && profileDetails.blacklistEntry && (
            <div className="p-6 bg-white rounded-lg border border-red-200 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-red-700">Blacklist Information</h2>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason</label>
                  <p className="text-sm">{profileDetails.blacklistEntry.reason}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Added</label>
                  <p className="text-sm">{new Date(profileDetails.blacklistEntry._creationTime).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Auctions */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h2 className="flex items-center mb-4 text-xl font-semibold">
              <Gavel className="mr-2 w-5 h-5" />
              Recent Auctions ({profileDetails.auctions.length})
            </h2>
            {profileDetails.auctions.length > 0 ? (
              <div className="space-y-4">
                {profileDetails.auctions.slice(0, 5).map((auction: any) => (
                  <Link to="/auctions/$auctionId" params={{ auctionId: auction._id }}>
                  <div key={auction._id} className="flex justify-between items-center p-3 rounded border hover:bg-gray-400/50">
                    <div className="flex items-center space-x-3">
                      {auction.imageUrl && (
                        <img 
                          src={auction.imageUrl} 
                          alt={auction.title}
                          className="object-cover w-12 h-12 rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{auction.title}</p>
                        <p className="text-sm text-gray-500">
                          Status: <span className={`px-2 py-1 rounded-full text-xs ${auction.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {auction.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${auction.currentBid}</p>
                      <p className="text-sm text-gray-500">{auction.bidCount} bids</p>
                    </div>
                  </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No auctions found</p>
            )}
          </div>

          {/* Recent Bids */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Recent Bids ({profileDetails.bids.length})</h2>
            {profileDetails.bids.length > 0 ? (
              <div className="space-y-4">
                {profileDetails.bids.slice(0, 5).map((bid: any) => (
                  <Link to="/auctions/$auctionId" params={{ auctionId: bid.auction._id }}>
                  <div key={bid._id} className="flex justify-between items-center p-3 rounded border hover:bg-gray-400/50">
                    <div className="flex items-center space-x-3">
                      {bid.imageUrl && (
                        <img 
                          src={bid.imageUrl} 
                          alt={bid.auction?.title || 'Auction'}
                          className="object-cover w-12 h-12 rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{bid.auction?.title || 'Unknown Auction'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(bid.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${bid.amount}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${bid.isWinning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {bid.isWinning ? 'Winning' : 'Outbid'}
                      </span>
                    </div>
                  </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No bids found</p>
            )}
          </div>

          {/* Recent Auction Requests */}
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Auction Requests ({profileDetails.auctionRequests.length})</h2>
            {profileDetails.auctionRequests.length > 0 ? (
              <div className="space-y-4">
                {profileDetails.auctionRequests.slice(0, 5).map((request: any) => (
                  <Link to="/requests/$requestId" params={{ requestId: request._id }}>
                  <div key={request._id} className="flex justify-between items-center p-3 rounded border hover:bg-gray-400/50">
                    <div className="flex items-center space-x-3">
                      {request.imageUrl && (
                        <img 
                          src={request.imageUrl} 
                          alt={request.artPiece?.title || 'Art Piece'}
                          className="object-cover w-12 h-12 rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{request.artPiece?.title || 'Unknown Art Piece'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(request._creationTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No auction requests found</p>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}
        >
          <DialogContent
          className='w-full max-w-md bg-white'
          >
            <DialogHeader>
              <DialogTitle>Delete Profile</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this profile? This action cannot be undone.
                All associated data will be permanently removed.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                className='border-black'
                >
                Cancel
              </Button>
              <Button 
              variant="destructive" 
              onClick={handleDeleteProfile}
              className='border-black'
              >
                Delete Profile
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Blacklist Dialog */}
        <Dialog open={showBlacklistDialog} onOpenChange={setShowBlacklistDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {profileDetails.isBlacklisted ? 'Remove from Blacklist' : 'Add to Blacklist'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4 text-sm text-gray-600">
                {profileDetails.isBlacklisted 
                  ? 'Are you sure you want to remove this user from the blacklist?'
                  : 'Please provide a reason for blacklisting this user.'
                }
              </p>
              {!profileDetails.isBlacklisted && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason</label>
                  <input
                    type="text"
                    value={blacklistReason}
                    onChange={(e) => setBlacklistReason(e.target.value)}
                    placeholder="Enter reason for blacklisting"
                    className="px-3 py-2 w-full rounded-md border"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBlacklistDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant={profileDetails.isBlacklisted ? "outline" : "destructive"} 
                onClick={handleToggleBlacklist}
              >
                {profileDetails.isBlacklisted ? 'Remove from Blacklist' : 'Add to Blacklist'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AuthRequired>
    </div>
  )
}
