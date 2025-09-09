import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Link } from '@tanstack/react-router';
import { DuplicateUsersManager } from "~/components/DuplicateUsersManager";
import { Button } from "~/components/ui/button";

export function AdminPanel() {
  const pendingRequests = useQuery(api.auctionRequests.getPendingAuctionRequests);

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

      <Link 
        to="/admin/blacklist"
      >
        <Button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
        >
          Manage Blacklist
        </Button>
      </Link>
      
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Auction Requests Overview</h2>
          <Link
            to="/admin/requests"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
          >
            Manage All Requests
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-800">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-800">Total Requests</p>
                <p className="text-2xl font-bold text-blue-900">{pendingRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-800">Ready to Review</p>
                <p className="text-2xl font-bold text-green-900">{pendingRequests.length > 0 ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>

        {pendingRequests.length > 0 && (
          <div className="p-4 mt-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <svg className="mr-2 w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-yellow-800">
                You have <strong>{pendingRequests.length}</strong> auction request{pendingRequests.length === 1 ? '' : 's'} pending review.
              </p>
            </div>
            <div className="mt-3">
              <Link
                to="/admin/requests"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-md transition-colors hover:bg-yellow-200"
              >
                Review Requests Now
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {pendingRequests.length === 0 && (
          <div className="p-6 mt-6 text-center bg-gray-50 rounded-lg">
            <svg className="mx-auto mb-4 w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mb-2 text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-gray-600">No auction requests are currently pending review.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
