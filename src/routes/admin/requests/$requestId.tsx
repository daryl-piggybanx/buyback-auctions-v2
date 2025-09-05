import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { AuthRequired } from '../../../components/AuthRequired'

export const Route = createFileRoute('/admin/requests/$requestId')({
  component: AdminRequestDetailPage,
})

function AdminRequestDetailPage() {
  const { requestId } = Route.useParams()
  const request = useQuery(api.auctionRequests.getAuctionRequestById, {
    requestId: requestId as Id<"auctionRequests">
  })
  const userProfile = useQuery(api.users.getUserProfile, {})

  if (request === undefined || userProfile === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!userProfile?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
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
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Admin Panel</span>
            <span>→</span>
            <span>Auction Requests</span>
            <span>→</span>
            <span className="text-gray-900 font-medium">{request.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin View: {request.title}</h1>
        </div>

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
              
              <h2 className="text-xl font-bold text-gray-900 mb-4">{request.title}</h2>
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
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Request ID:</span>
                  <span className="text-gray-900 font-mono text-sm">{request._id}</span>
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-900 mb-2">Admin Actions</h3>
                <p className="text-blue-800 text-sm mb-3">
                  Use the main admin panel to approve or reject this request.
                </p>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  ← Back to Admin Panel
                </button>
              </div>
              
              {request.adminNotes && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Admin Notes</h3>
                  <p className="text-gray-700 text-sm">{request.adminNotes}</p>
                </div>
              )}
              
              {request.status === 'approved' && request.auctionId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Auction Created</h3>
                  <p className="text-green-800 text-sm mb-3">
                    This request has been approved and an auction has been created.
                  </p>
                  <p className="text-green-700 text-xs font-mono">
                    Auction ID: {request.auctionId}
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
