import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "~/convex/_generated/dataModel";
import { Link } from '@tanstack/react-router';
import { DuplicateUsersManager } from "~/components/DuplicateUsersManager";

export function AdminPanel() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [startingPrice, setStartingPrice] = useState<number>(750);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isFixedEndTime, setIsFixedEndTime] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  const pendingRequests = useQuery(api.auctionRequests.getPendingAuctionRequests);
  const approveRequest = useMutation(api.auctionRequests.approveAuctionRequest);
  const rejectRequest = useMutation(api.auctionRequests.rejectAuctionRequest);

  const handleApprove = async (requestId: string) => {
    if (!startDate || !startTime || !endDate || !endTime) {
      toast.error("Please set auction start and end date/time");
      return;
    }

    // Create dates in Pacific Time
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    // Convert Pacific Time to UTC for storage
    const startDateTimeUTC = new Date(startDateTime.toLocaleString("en-US", { timeZone: "UTC" }));
    const endDateTimeUTC = new Date(endDateTime.toLocaleString("en-US", { timeZone: "UTC" }));
    
    if (startDateTimeUTC.getTime() <= Date.now()) {
      toast.error("Auction start time must be in the future");
      return;
    }
    
    if (endDateTimeUTC.getTime() <= startDateTimeUTC.getTime()) {
      toast.error("Auction end time must be after start time");
      return;
    }

    const durationMs = endDateTimeUTC.getTime() - startDateTimeUTC.getTime();
    const calculatedDurationHours = Math.ceil(durationMs / (1000 * 60 * 60));

    try {
      await approveRequest({
        requestId: requestId as Id<"auctionRequests">,
        startingPrice: startingPrice as 750 | 4250,
        startTime: startDateTimeUTC.getTime(),
        endTime: endDateTimeUTC.getTime(),
        durationHours: calculatedDurationHours,
        isFixedEndTime,
        adminNotes: adminNotes || undefined,
      });

      setSelectedRequest(null);
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setAdminNotes("");
      setStartingPrice(750);
      toast.success("Auction request approved and auction scheduled!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await rejectRequest({
        requestId: requestId as Id<"auctionRequests">,
        adminNotes: rejectNotes,
      });

      setShowRejectForm(null);
      setRejectNotes("");
      toast.success("Auction request rejected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject request");
    }
  };

  // Calculate duration display
  const calculateDuration = () => {
    if (startDate && startTime && endDate && endTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      
      // Convert to UTC for accurate calculation
      const startDateTimeUTC = new Date(startDateTime.toLocaleString("en-US", { timeZone: "UTC" }));
      const endDateTimeUTC = new Date(endDateTime.toLocaleString("en-US", { timeZone: "UTC" }));
      
      const durationMs = endDateTimeUTC.getTime() - startDateTimeUTC.getTime();
      const hours = Math.ceil(durationMs / (1000 * 60 * 60));
      return hours > 0 ? `${hours} hours` : "Invalid duration";
    }
    return "Not calculated";
  };

  if (pendingRequests === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DuplicateUsersManager />
      
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pending Auction Requests</h2>
          <Link
            to="/admin/requests"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
          >
            View All Requests
          </Link>
        </div>
        
        {pendingRequests.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No pending auction requests</p>
        ) : (
          <div className="space-y-6">
            {pendingRequests.map((request) => (
              <div key={request._id} className="p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    {request.imageUrl && (
                      <img 
                        src={request.imageUrl} 
                        alt={request.title}
                        className="object-cover mb-4 w-full h-48 rounded-lg"
                      />
                    )}
                    
                    <h3 className="mb-2 text-xl font-bold text-gray-900">{request.title}</h3>
                    <p className="mb-4 text-gray-600">{request.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Requester:</span> @{request.requester}</p>
                      <p><span className="font-medium">Category:</span> {request.artPiece?.category}</p>
                      {request.artPiece?.dimensions && (
                        <p><span className="font-medium">Dimensions:</span> {request.artPiece.dimensions}</p>
                      )}
                      {request.artPiece?.variation && (
                        <p><span className="font-medium">Variation:</span> {request.artPiece.variation}</p>
                      )}
                      {request.artPiece?.purchaseDate && (
                        <p><span className="font-medium">Purchase Date:</span> {new Date(request.artPiece.purchaseDate).toLocaleDateString()}</p>
                      )}
                      <p><span className="font-medium">Submitted:</span> {new Date(request._creationTime).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedRequest === request._id ? (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Approve Auction</h4>
                        
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
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
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
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
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
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              min={startDate || new Date().toISOString().split('T')[0]}
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
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md">
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
                            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Any notes for the requester..."
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={(e) => { e.preventDefault(); void handleApprove(request._id); }}
                            className="flex-1 px-4 py-2 font-medium text-white bg-green-600 rounded-md transition-colors hover:bg-green-700"
                          >
                            Approve & Schedule Auction
                          </button>
                          <button
                            onClick={() => setSelectedRequest(null)}
                            className="px-4 py-2 rounded-md border border-gray-300 transition-colors hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : showRejectForm === request._id ? (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Reject Auction Request</h4>
                        
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
                            onClick={(e) => { e.preventDefault(); void handleReject(request._id); }}
                            className="flex-1 px-4 py-2 font-medium text-white bg-red-600 rounded-md transition-colors hover:bg-red-700"
                          >
                            Reject Request
                          </button>
                          <button
                            onClick={() => setShowRejectForm(null)}
                            className="px-4 py-2 rounded-md border border-gray-300 transition-colors hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedRequest(request._id)}
                          className="flex-1 px-4 py-2 font-medium text-white bg-green-600 rounded-md transition-colors hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setShowRejectForm(request._id)}
                          className="flex-1 px-4 py-2 font-medium text-white bg-red-600 rounded-md transition-colors hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
