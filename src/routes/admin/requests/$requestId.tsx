import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '~/convex/_generated/api'
import { Id } from '~/convex/_generated/dataModel'
import { AuthRequired } from '~/components/auth/AuthRequired'
import { useState } from 'react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import React from 'react'

export const Route = createFileRoute('/admin/requests/$requestId')({
  component: AdminRequestDetailPage,
})

function AdminRequestDetailPage() {
  const { requestId } = Route.useParams()
  const navigate = useNavigate()
  const [startingPrice, setStartingPrice] = useState<number>(750)
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isFixedEndTime, setIsFixedEndTime] = useState(true)
  const [adminNotes, setAdminNotes] = useState("")
  const [rejectNotes, setRejectNotes] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showApproveForm, setShowApproveForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editStartingPrice, setEditStartingPrice] = useState<number>(750)
  const [editStartDate, setEditStartDate] = useState("")
  const [editStartTime, setEditStartTime] = useState("")
  const [editEndDate, setEditEndDate] = useState("")
  const [editEndTime, setEditEndTime] = useState("")
  const [editIsFixedEndTime, setEditIsFixedEndTime] = useState(true)
  const [editAdminNotes, setEditAdminNotes] = useState("")

  const request = useQuery(api.auctionRequests.getAuctionRequestById, {
    requestId: requestId as Id<"auctionRequests">
  })
  const userProfile = useQuery(api.users.getUserProfile, {})
  const approveRequest = useMutation(api.auctionRequests.approveAuctionRequest)
  const rejectRequest = useMutation(api.auctionRequests.rejectAuctionRequest)
  const archiveAuction = useMutation(api.auctions.archiveAuction)
  const deleteAuction = useMutation(api.auctions.deleteAuction)
  const updateAuction = useMutation(api.auctions.updateAuction)

  const handleApprove = async () => {
    if (!startDate || !startTime || !endDate || !endTime) {
      toast.error("Please set auction start and end date/time")
      return
    }

    // Create dates in Pacific Time
    const startDateTime = new Date(`${startDate}T${startTime}`)
    const endDateTime = new Date(`${endDate}T${endTime}`)
    
    // Convert Pacific Time to UTC properly
    // Pacific Time is UTC-8 (PST) or UTC-7 (PDT)
    // We need to subtract the offset to get UTC time
    const pacificOffset = 8 * 60 * 60 * 1000 // 8 hours in milliseconds (PST)
    const startDateTimeUTC = new Date(startDateTime.getTime() - pacificOffset)
    const endDateTimeUTC = new Date(endDateTime.getTime() - pacificOffset)
    
    if (startDateTimeUTC.getTime() <= Date.now()) {
      toast.error("Auction start time must be in the future")
      return
    }
    
    if (endDateTimeUTC.getTime() <= startDateTimeUTC.getTime()) {
      toast.error("Auction end time must be after start time")
      return
    }

    const durationMs = endDateTimeUTC.getTime() - startDateTimeUTC.getTime()
    const calculatedDurationHours = Math.ceil(durationMs / (1000 * 60 * 60))

    try {
      await approveRequest({
        requestId: requestId as Id<"auctionRequests">,
        startingPrice: startingPrice as 750 | 4250,
        startTime: startDateTimeUTC.getTime(),
        endTime: endDateTimeUTC.getTime(),
        durationHours: calculatedDurationHours,
        isFixedEndTime,
        adminNotes: adminNotes || undefined,
      })

      toast.success("Auction request approved and auction scheduled!")
      void navigate({ to: '/admin/requests' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve request")
    }
  }

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    try {
      await rejectRequest({
        requestId: requestId as Id<"auctionRequests">,
        adminNotes: rejectNotes,
      })

      toast.success("Auction request rejected")
      void navigate({ to: '/admin/requests' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject request")
    }
  }

  const handleArchiveAuction = async () => {
    if (!request?.auctionId) {
      toast.error("Auction not found")
      return
    }

    try {
      await archiveAuction({
        auctionId: request.auctionId as Id<"auctions">,
      })
      toast.success("Auction archived successfully")
      void navigate({ to: '/admin/requests' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to archive auction")
    }
  }
  
  const handleDeleteAuction = async () => {
    if (!confirm("Are you sure you want to permanently delete this auction? This action cannot be undone.")) {
      return
    }

    if (!request?.auctionId) {
      toast.error("Auction not found")
      return
    }

    try {
      await deleteAuction({
        auctionId: request.auctionId as Id<"auctions">,
      })
      toast.success("Auction deleted successfully")
      void navigate({ to: '/admin/requests' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete auction")
    }
  }

  const handleEditAuction = async () => {
    if (!request?.auctionId) {
      toast.error("Auction not found")
      return
    }

    if (!editStartDate || !editStartTime || !editEndDate || !editEndTime) {
      toast.error("Please set auction start and end date/time")
      return
    }

    // Create dates in Pacific Time
    const startDateTime = new Date(`${editStartDate}T${editStartTime}`)
    const endDateTime = new Date(`${editEndDate}T${editEndTime}`)
    
    // Convert Pacific Time to UTC properly
    // Pacific Time is UTC-8 (PST) or UTC-7 (PDT)
    // We need to subtract the offset to get UTC time
    const pacificOffset = 8 * 60 * 60 * 1000 // 8 hours in milliseconds (PST)
    const startDateTimeUTC = new Date(startDateTime.getTime() - pacificOffset)
    const endDateTimeUTC = new Date(endDateTime.getTime() - pacificOffset)
    
    if (startDateTimeUTC.getTime() <= Date.now()) {
      toast.error("Auction start time must be in the future")
      return
    }
    
    if (endDateTimeUTC.getTime() <= startDateTimeUTC.getTime()) {
      toast.error("Auction end time must be after start time")
      return
    }

    const durationMs = endDateTimeUTC.getTime() - startDateTimeUTC.getTime()
    const calculatedDurationHours = Math.ceil(durationMs / (1000 * 60 * 60))

    try {
      await updateAuction({
        auctionId: request.auctionId as Id<"auctions">,
        startingPrice: editStartingPrice as 750 | 4250,
        startTime: startDateTimeUTC.getTime(),
        endTime: endDateTimeUTC.getTime(),
      })

      toast.success("Auction updated successfully!")
      setShowEditForm(false)
      // No need for window.location.reload() - Convex will automatically refresh the data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update auction")
    }
  }

  // Calculate duration display
  const calculateDuration = () => {
    if (startDate && startTime && endDate && endTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`)
      const endDateTime = new Date(`${endDate}T${endTime}`)
      
      // Convert to UTC for accurate calculation (same logic as above)
      const pacificOffset = 8 * 60 * 60 * 1000 // 8 hours in milliseconds (PST)
      const startDateTimeUTC = new Date(startDateTime.getTime() - pacificOffset)
      const endDateTimeUTC = new Date(endDateTime.getTime() - pacificOffset)
      
      const durationMs = endDateTimeUTC.getTime() - startDateTimeUTC.getTime()
      const hours = Math.ceil(durationMs / (1000 * 60 * 60))
      return hours > 0 ? `${hours} hours` : "Invalid duration"
    }
    return "Not calculated"
  }

  // Calculate duration display for edit form
  const calculateEditDuration = () => {
    if (editStartDate && editStartTime && editEndDate && editEndTime) {
      const startDateTime = new Date(`${editStartDate}T${editStartTime}`)
      const endDateTime = new Date(`${editEndDate}T${editEndTime}`)
      
      // Convert to UTC for accurate calculation
      const pacificOffset = 8 * 60 * 60 * 1000 // 8 hours in milliseconds (PST)
      const startDateTimeUTC = new Date(startDateTime.getTime() - pacificOffset)
      const endDateTimeUTC = new Date(endDateTime.getTime() - pacificOffset)
      
      const durationMs = endDateTimeUTC.getTime() - startDateTimeUTC.getTime()
      const hours = Math.ceil(durationMs / (1000 * 60 * 60))
      return hours > 0 ? `${hours} hours` : "Invalid duration"
    }
    return "Not calculated"
  }

  // Initialize edit form when auction data is loaded
  React.useEffect(() => {
    if (request?.auctionId && request.auction) {
      const auction = request.auction
      setEditStartingPrice(auction.startingPrice)
      
      // Convert UTC times back to Pacific Time for display
      const startDate = new Date(auction.startTime + (8 * 60 * 60 * 1000))
      const endDate = new Date(auction.endTime + (8 * 60 * 60 * 1000))
      
      setEditStartDate(startDate.toISOString().split('T')[0])
      setEditStartTime(startDate.toTimeString().slice(0, 5))
      setEditEndDate(endDate.toISOString().split('T')[0])
      setEditEndTime(endDate.toTimeString().slice(0, 5))
      setEditIsFixedEndTime(auction.isFixedEndTime)
      setEditAdminNotes(request.adminNotes || "")
    }
  }, [request])

  if (request === undefined || userProfile === undefined) {
    return (
      <div className="px-4 py-8 mx-auto max-w-4xl">
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!userProfile?.isAdmin) {
    return (
      <div className="px-4 py-8 mx-auto max-w-4xl">
        <div className="py-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  if (request === null) {
    return (
      <div className="px-4 py-8 mx-auto max-w-4xl">
        <div className="py-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Request Not Found</h2>
          <p className="text-gray-600">The auction request you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <AuthRequired>
      <div className="px-4 py-8 mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="flex gap-2 items-center mb-2 text-sm text-gray-600">
            <span>Admin Panel</span>
            <span>→</span>
            <span>Auction Requests</span>
            <span>→</span>
            <span className="font-medium text-gray-900">{request.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin View: {request.title}</h1>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              {request.imageUrl && (
                <img 
                  src={request.imageUrl} 
                  alt={request.title}
                  className="object-cover mb-4 w-full h-64 rounded-lg"
                />
              )}
              
              <h2 className="mb-4 text-xl font-bold text-gray-900">{request.title}</h2>
              <p className="mb-6 text-gray-600">{request.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Requester:</span>
                  <span className="text-gray-900">@{request.requester}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Request ID:</span>
                  <span className="font-mono text-sm text-gray-900">{request._id}</span>
                </div>
                
                {request.artPiece?.category && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="text-gray-900">{request.artPiece.category}</span>
                  </div>
                )}
                
                {request.artPiece?.dimensions && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Dimensions:</span>
                    <span className="text-gray-900">{request.artPiece.dimensions}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Submitted:</span>
                  <span className="text-gray-900">{new Date(request._creationTime).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              {request.status === 'pending' ? (
                <div className="space-y-6">
                  {!showApproveForm && !showRejectForm && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Admin Actions</h3>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowApproveForm(true)}
                          className="flex-1 px-4 py-2 font-medium text-white bg-green-600 rounded-md transition-colors hover:bg-green-700"
                        >
                          Approve Request
                        </button>
                        <button
                          onClick={() => setShowRejectForm(true)}
                          className="flex-1 px-4 py-2 font-medium text-white bg-red-600 rounded-md transition-colors hover:bg-red-700"
                        >
                          Reject Request
                        </button>
                      </div>
                    </div>
                  )}

                  {showApproveForm && (
                    <div className="p-4 space-y-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900">Approve Auction Request</h4>
                      
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Starting Price *
                        </label>
                        <input
                          type="number"
                          value={startingPrice}
                          onChange={(e) => setStartingPrice(parseInt(e.target.value) || 750)}
                          min="1"
                          step="1"
                          className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Common values: $750 or $4,250
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Start Date * (Pacific Time)
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Start Time * (Pacific Time)
                          </label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            End Date * (Pacific Time)
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split('T')[0]}
                            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            End Time * (Pacific Time)
                          </label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Duration:</span> {calculateDuration()}
                        </p>
                      </div>

                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={!isFixedEndTime}
                            onChange={(e) => setIsFixedEndTime(!e.target.checked)}
                            className="mr-2"
                          />
                          Enable popcorn bidding (extend auction on late bids)
                        </label>
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Admin Notes (optional)
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows={2}
                          className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Any notes for the requester..."
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => void handleApprove()}
                          className="flex-1 px-4 py-2 font-medium text-white bg-green-600 rounded-md transition-colors hover:bg-green-700"
                        >
                          Approve & Schedule Auction
                        </button>
                        <button
                          onClick={() => setShowApproveForm(false)}
                          className="px-4 py-2 rounded-md border border-gray-300 transition-colors hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {showRejectForm && (
                    <div className="p-4 space-y-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-900">Reject Auction Request</h4>
                      
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Reason for Rejection *
                        </label>
                        <textarea
                          value={rejectNotes}
                          onChange={(e) => setRejectNotes(e.target.value)}
                          rows={3}
                          className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Explain why this request is being rejected..."
                          required
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => void handleReject()}
                          className="flex-1 px-4 py-2 font-medium text-white bg-red-600 rounded-md transition-colors hover:bg-red-700"
                        >
                          Reject Request
                        </button>
                        <button
                          onClick={() => setShowRejectForm(false)}
                          className="px-4 py-2 rounded-md border border-gray-300 transition-colors hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="mb-2 font-medium text-blue-900">Request Status</h3>
                    <p className="text-sm text-blue-800">
                      This request has been {request.status}.
                    </p>
                  </div>
                  
                  {request.adminNotes && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="mb-2 font-medium text-gray-900">Admin Notes</h3>
                      <p className="text-sm text-gray-700">{request.adminNotes}</p>
                    </div>
                  )}
                  
                  {request.status === 'approved' && request.auctionId && (
                    <>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="mb-2 font-medium text-green-900">Auction Created</h3>
                      <p className="mb-3 text-sm text-green-800">
                        This request has been approved and an auction has been created.
                      </p>
                      <p className="font-mono text-xs text-green-700">
                        Auction ID: {request.auctionId}
                      </p>
                    </div>

                    {showEditForm ? (
                      <div className="p-4 space-y-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900">Edit Auction</h4>
                        
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Starting Price *
                          </label>
                          <input
                            type="number"
                            value={editStartingPrice}
                            onChange={(e) => setEditStartingPrice(parseInt(e.target.value) || 750)}
                            min="1"
                            step="1"
                            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Common values: $750 or $4,250
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                              Start Date * (Pacific Time)
                            </label>
                            <input
                              type="date"
                              value={editStartDate}
                              onChange={(e) => setEditStartDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                              Start Time * (Pacific Time)
                            </label>
                            <input
                              type="time"
                              value={editStartTime}
                              onChange={(e) => setEditStartTime(e.target.value)}
                              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                              End Date * (Pacific Time)
                            </label>
                            <input
                              type="date"
                              value={editEndDate}
                              onChange={(e) => setEditEndDate(e.target.value)}
                              min={editStartDate || new Date().toISOString().split('T')[0]}
                              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                              End Time * (Pacific Time)
                            </label>
                            <input
                              type="time"
                              value={editEndTime}
                              onChange={(e) => setEditEndTime(e.target.value)}
                              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-md">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Duration:</span> {calculateEditDuration()}
                          </p>
                        </div>

                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={!editIsFixedEndTime}
                              onChange={(e) => setEditIsFixedEndTime(!e.target.checked)}
                              className="mr-2"
                            />
                            Enable popcorn bidding (extend auction on late bids)
                          </label>
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Admin Notes (optional)
                          </label>
                          <textarea
                            value={editAdminNotes}
                            onChange={(e) => setEditAdminNotes(e.target.value)}
                            rows={2}
                            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Any notes for the requester..."
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => void handleEditAuction()}
                            className="flex-1 px-4 py-2 font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
                          >
                            Update Auction
                          </button>
                          <button
                            onClick={() => setShowEditForm(false)}
                            className="px-4 py-2 rounded-md border border-gray-300 transition-colors hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setShowEditForm(true)}
                            className="px-4 py-2 rounded-md border border-gray-300 transition-colors hover:bg-gray-50">
                            Edit Auction
                          </button>
                          <button 
                            onClick={() => void handleArchiveAuction()}
                            className="px-4 py-2 rounded-md border border-gray-300 transition-colors hover:bg-gray-50">
                            Archive Auction
                          </button>
                          <button 
                            onClick={() => void handleDeleteAuction()}
                            className="px-4 py-2 rounded-md border border-gray-300 transition-colors hover:bg-gray-50">
                            Delete Auction
                          </button>
                        </div>
                      </div>
                    )}
                    </>
                  )}
                </div>
              )}

              <div className="pt-4 mt-6 border-t">
                <button 
                  onClick={() => void navigate({ to: '/admin/requests' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md transition-colors hover:bg-gray-200"
                >
                  ← Back to All Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthRequired>
  )
}
