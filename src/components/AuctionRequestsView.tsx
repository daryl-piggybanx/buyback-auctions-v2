import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Link } from '@tanstack/react-router';

export function AuctionRequestsView() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const auctionRequests = useQuery(api.auctionRequests.getUserAuctionRequests);

  if (auctionRequests === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
      </div>
    );
  }

  const filteredRequests = auctionRequests.filter(request => {
    if (filter === "all") return true;
    return request.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Auction Requests</h1>
        <Link
          to="/request-auction"
          className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
        >
          New Request
        </Link>
      </div>

      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== "all" && (
              <span className="ml-1 text-xs">
                ({auctionRequests.filter(r => r.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-gray-400">
            <svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">No auction requests</h3>
          <p className="mb-4 text-gray-500">
            {filter === "all" 
              ? "You haven't submitted any auction requests yet."
              : `You don't have any ${filter} requests.`
            }
          </p>
          <Link
            to="/request-auction"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md border border-transparent hover:bg-blue-700"
          >
            Submit Your First Request
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRequests.map((request) => (
            <Link
              key={request._id}
              to="/requests/$requestId"
              params={{ requestId: request._id }}
              className="block bg-white rounded-lg shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">{request.title}</h3>
                    <p className="text-gray-600 line-clamp-2">{request.description}</p>
                  </div>
                  {request.imageUrl && (
                    <img 
                      src={request.imageUrl} 
                      alt={request.title}
                      className="object-cover ml-4 w-20 h-20 rounded-lg"
                    />
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center text-sm text-gray-500">
                    <span>Submitted {new Date(request._creationTime).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
