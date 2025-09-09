import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { toast } from 'sonner';

export function useNotifications() {
  const notifications = useQuery(api.notifications.getUserNotifications);
  const previousNotificationIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!notifications) return;

    // Get current notification IDs
    const currentNotificationIds = new Set(notifications.map(n => n._id));
    
    // Find new notifications (not in previous set)
    const newNotifications = notifications.filter(
      notification => !previousNotificationIds.current.has(notification._id)
    );

    // Show toast for new notifications
    newNotifications.forEach(notification => {
      if (notification.type === 'auction_request_approved') {
        toast.success(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      } else if (notification.type === 'auction_request_rejected') {
        toast.error(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      } else if (notification.type === 'bid_placed') {
        toast.info(notification.title, {
          description: notification.message,
          duration: 3000,
        });
      } else if (notification.type === 'bid_outbid') {
        toast.warning(notification.title, {
          description: notification.message,
          duration: 3000,
        });
      } else if (notification.type === 'auction_won') {
        toast.success(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      } else if (notification.type === 'auction_started') {
        toast.info(notification.title, {
          description: notification.message,
          duration: 4000,
        });
      } else {
        // Generic notification
        toast(notification.title, {
          description: notification.message,
          duration: 4000,
        });
      }
    });

    // Update the previous notification IDs
    previousNotificationIds.current = currentNotificationIds;
  }, [notifications]);

  return notifications;
}
