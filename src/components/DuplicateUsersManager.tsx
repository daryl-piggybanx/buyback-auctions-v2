import { useQuery, useAction } from "convex/react";
import { api } from "~/convex/_generated/api";
import { toast } from "sonner";

export function DuplicateUsersManager() {
  const duplicateUsers = useQuery(api.userManagement.findDuplicateUsers);
  const cleanupDuplicates = useAction(api.userManagement.triggerCleanupDuplicateUsers);

  const handleCleanupDuplicates = async (email: string) => {
    try {
      const result = await cleanupDuplicates({ email });
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cleanup duplicates");
    }
  };

  if (duplicateUsers === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">User Management - Duplicate Users</h2>
      
      {duplicateUsers.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No duplicate users found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Duplicate Users Detected
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Found {duplicateUsers.length} email(s) with duplicate user accounts. This can cause login issues.</p>
                </div>
              </div>
            </div>
          </div>

          {duplicateUsers.map((duplicate) => (
            <div key={duplicate.email} className="p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{duplicate.email}</h3>
                  <p className="mb-2 text-sm text-gray-500">{duplicate.count} duplicate accounts</p>
                  <div className="space-y-1">
                    {duplicate.users.map((user) => (
                      <div key={user.id} className="p-2 text-xs text-gray-600 bg-gray-50 rounded">
                        <div>ID: {user.id}</div>
                        <div>Created: {new Date(user.creationTime).toLocaleDateString()}</div>
                        <div>Name: {user.name || 'No name'}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleCleanupDuplicates(duplicate.email)}
                  className="px-4 py-2 ml-4 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
                >
                  Cleanup Duplicates
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
