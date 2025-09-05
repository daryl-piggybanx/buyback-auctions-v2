import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { toast } from "sonner";
import { Link } from '@tanstack/react-router';

export function AdminRequestsManagement() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  
  const allRequests = useQuery(api.admin.getAllAuctionRequestsForAdmin);

  if (allRequests === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
      </div>
    );
  }

  const filteredRequests = allRequests.filter(request => {
    if (filter === "all") return true;
    return request.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">All Auction Requests</h1>
        <Link
          to="/admin"
          className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
        >
          ← Back to Admin Panel
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
            <span className="ml-1 text-xs">
              ({allRequests.filter(r => filter === "all" ? true : r.status === status).length})
            </span>
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
          <h3 className="mb-2 text-lg font-medium text-gray-900">No requests found</h3>
          <p className="text-gray-500">
            {filter === "all" 
              ? "No auction requests have been submitted yet."
              : `No ${filter} requests found.`
            }
          </p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Request
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Requester
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {request.imageUrl && (
                          <img 
                            src={request.imageUrl} 
                            alt={request.title}
                            className="object-cover mr-3 w-10 h-10 rounded-lg"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.title}</div>
                          <div className="max-w-xs text-sm text-gray-500 truncate">
                            {request.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">@{request.requester}</div>
                      <div className="text-sm text-gray-500">{request.artPiece?.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(request._creationTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <Link
                        to="/admin/requests/$requestId"
                        params={{ requestId: request._id }}
                        className="mr-3 text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                      {request.status === 'approved' && request.auctionId && (
                        <a
                          href={`/auctions/${request.auctionId}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          View Auction
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
