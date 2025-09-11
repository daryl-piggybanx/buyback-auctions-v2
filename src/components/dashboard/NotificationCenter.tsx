import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Link } from "@tanstack/react-router";

export function NotificationCenter() {
  const notifications = useQuery(api.notifications.getUserNotifications);
  const markRead = useMutation(api.notifications.markNotificationRead);

  const handleMarkRead = async (notificationId: string) => {
    try {
      await markRead({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  if (notifications === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-1">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        notification.priority === "high" ? "bg-red-100 text-red-800" :
                        notification.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(notification._creationTime).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkRead(notification._id)}
                      className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Mark Read
                    </button>
                  )}
                  {notification.auctionId && (
                    <Link
                      to="/auctions/$auctionId"
                      params={{ auctionId: notification.auctionId }}
                      className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View Auction
                    </Link>
                  )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
