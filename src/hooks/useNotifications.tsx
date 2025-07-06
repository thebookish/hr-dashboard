"use client";

import { useState, useEffect, useCallback } from "react";
import notificationService, {
  Notification,
} from "@/services/notificationService";
import { useAuth } from "@/hooks/useAuth";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await notificationService.getNotifications(user.email);
      setNotifications(data);

      // Update unread count
      const unread = data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.email) return;

    try {
      const count = await notificationService.getUnreadCount(user.email);
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [user?.email]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.email) return;

    try {
      await notificationService.markAllAsRead(user.email);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, [user?.email]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.deleteNotification(notificationId);
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error("Failed to delete notification:", err);
      }
    },
    [notifications],
  );

  const sendNotification = useCallback(
    async (data: {
      title: string;
      message: string;
      email: string;
      type?: "info" | "warning" | "error" | "success";
    }) => {
      try {
        await notificationService.sendNotification(data);
        // Refresh notifications if sending to current user
        if (data.email === user?.email) {
          await fetchNotifications();
        }
      } catch (err) {
        console.error("Failed to send notification:", err);
        throw err;
      }
    },
    [user?.email, fetchNotifications],
  );

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (user?.email) {
      fetchNotifications();

      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user?.email, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
    refresh: fetchNotifications,
  };
}
