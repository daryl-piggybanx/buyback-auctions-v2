import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { AuthRequired } from '../../components/AuthRequired'

export const Route = createFileRoute('/requests/$requestId')({
  component: RequestDetailPage,
})

function RequestDetailPage() {
  const { requestId } = Route.useParams()
  const request = useQuery(api.auctionRequests.getAuctionRequestById, {
    requestId: requestId as Id<"auctionRequests">
  })

  if (request === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (request === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h2>
          <p className="text-gray-600">The auction request you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <AuthRequired>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {request.imageUrl && (
                <img 
                  src={request.imageUrl} 
                  alt={request.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{request.title}</h1>
              <p className="text-gray-600 mb-6">{request.description}</p>
              
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
                
                {request.suggestedStartingPrice && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Suggested Price:</span>
                    <span className="text-gray-900">${request.suggestedStartingPrice.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Submitted:</span>
                  <span className="text-gray-900">{new Date(request._creationTime).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              {request.adminNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-blue-900 mb-2">Admin Notes</h3>
                  <p className="text-blue-800 text-sm">{request.adminNotes}</p>
                </div>
              )}
              
              {request.status === 'approved' && request.auctionId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Auction Approved & Scheduled</h3>
                  <div className="text-green-800 text-sm space-y-1 mb-3">
                    <p>Your request has been approved and an auction has been scheduled.</p>
                    {request.auction && (
                      <>
                        <p><strong>Start:</strong> {new Date(request.auction.startTime).toLocaleString()}</p>
                        <p><strong>End:</strong> {new Date(request.auction.endTime).toLocaleString()}</p>
                        <p><strong>Starting Price:</strong> ${request.auction.startingPrice.toLocaleString()}</p>
                      </>
                    )}
                  </div>
                  <a 
                    href={`/auctions/${request.auctionId}`}
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    View Auction
                  </a>
                </div>
              )}
              
              {request.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-900 mb-2">Request Rejected</h3>
                  <p className="text-red-800 text-sm">
                    Unfortunately, your auction request was not approved.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthRequired>
  )
}
