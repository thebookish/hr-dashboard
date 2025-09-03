"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, X } from "lucide-react";
import notificationService, {
  Notification,
} from "@/services/notificationService";
import { useAuth } from "@/hooks/useAuth";

interface NotificationsFeedProps {
  notifications?: Notification[];
}

const NotificationsFeed = ({
  notifications: propNotifications,
}: NotificationsFeedProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(
    propNotifications || [],
  );
  const [isLoading, setIsLoading] = useState(!propNotifications);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propNotifications && user?.email) {
      fetchNotifications();
    }
  }, [propNotifications, user?.email]);

  const fetchNotifications = async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications(user.email);
      setNotifications(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.email) return;

    try {
      await notificationService.markAllAsRead(user.email);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );
    } catch (err: any) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  if (isLoading) {
    return (
      <Card className="w-full bg-background">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-gray-50 dark:border-gray-700 gap-2">
        <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          Notifications
          {unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {unreadCount} new
            </Badge>
          )}
        </CardTitle>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Mark all as read</span>
            <span className="sm:hidden">Mark all</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-4">
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${notification.read ? "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700" : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"}`}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {formatTime(notification.createdDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 py-0 text-xs border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex-1 sm:flex-none"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Mark as read</span>
                        <span className="sm:hidden">Read</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 py-0 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex-1 sm:flex-none"
                        onClick={() => handleDismiss(notification.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
                No notifications
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You're all caught up!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsFeed;
