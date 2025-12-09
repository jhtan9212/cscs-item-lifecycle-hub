import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { notificationService, type Notification } from '@/services/notificationService';
import { formatDateTime } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const [allNotifications, count] = await Promise.all([
        notificationService.getAll({ limit: 10, unreadOnly: false }),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(allNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      WORKFLOW_ADVANCED: 'Workflow Updated',
      TASK_ASSIGNED: 'Task Assigned',
      PROJECT_CREATED: 'Project Created',
      ITEM_UPDATED: 'Item Updated',
    };
    return labels[type] || 'Notification';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between px-2 py-1.5">
          <h3 className="text-sm font-semibold">Notifications</h3>
          <div className="flex gap-2">
            <Link
              to="/notifications"
              className="text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View All
            </Link>
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAllAsRead();
                }}
                disabled={loading}
                className="text-xs text-primary hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-3 hover:bg-accent cursor-pointer transition-colors',
                    !notification.isRead && 'bg-accent/50'
                  )}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {getNotificationTypeLabel(notification.type)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
