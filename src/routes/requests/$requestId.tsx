import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '~/convex/_generated/api'
import { Id } from '~/convex/_generated/dataModel'
import { AuthRequired } from '~/components/auth/AuthRequired'
import { TZDate } from '@date-fns/tz'

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
      <div className="px-4 py-8 mx-auto max-w-4xl">
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
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
              
              <h1 className="mb-4 text-2xl font-bold text-gray-900">{request.title}</h1>
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
              {request.adminNotes && (
                <div className="p-4 mb-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="mb-2 font-medium text-blue-900">Admin Notes</h3>
                  <p className="text-sm text-blue-800">{request.adminNotes}</p>
                </div>
              )}
              
              {request.status === 'approved' && request.auctionId && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="mb-2 font-medium text-green-900">Auction Approved & Scheduled</h3>
                  <div className="mb-3 space-y-1 text-sm text-green-800">
                    <p>Your request has been approved and an auction has been scheduled.</p>
                    {request.auction && (
                      <>
                        <p><strong>Start:</strong> {new TZDate(request.auction.startTime, Intl.DateTimeFormat().resolvedOptions().timeZone).toLocaleString()}</p>
                        <p><strong>End:</strong> {new TZDate(request.auction.endTime, Intl.DateTimeFormat().resolvedOptions().timeZone).toLocaleString()}</p>
                        <p><strong>Starting Price:</strong> ${request.auction.startingPrice.toLocaleString()}</p>
                      </>
                    )}
                  </div>
                  <a 
                    href={`/auctions/${request.auctionId}`}
                    className="inline-block px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md transition-colors hover:bg-green-700"
                  >
                    View Auction
                  </a>
                </div>
              )}
              
              {request.status === 'rejected' && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="mb-2 font-medium text-red-900">Request Rejected</h3>
                  <p className="text-sm text-red-800">
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
