import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/components/ui/use-toast";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  recipientEmail: string;
  read: boolean;
  createdDate: string;
  avatar?: string;
}

export interface NotificationModel {
  id: string;
  title: string;
  message: string;
  email: string;
  isRead: boolean;
  date: string;
}

export interface NotificationData {
  title: string;
  message: string;
  email: string;
  type?: "info" | "warning" | "error" | "success";
}

class NotificationService {
  async sendNotification(data: NotificationData): Promise<NotificationModel> {
    try {
      const response = await axiosInstance.post("/notifications/send", data);

      // Show success toast
      toast({
        title: "Notification Sent",
        description: `Notification sent to ${data.email}`,
        variant: "default",
      });

      return response.data;
    } catch (error: any) {
      // Show error toast
      toast({
        title: "Failed to Send Notification",
        description:
          error.response?.data?.message ||
          "An error occurred while sending the notification",
        variant: "destructive",
      });

      throw new Error(
        error.response?.data?.message || "Failed to send notification",
      );
    }
  }

  async sendBulkNotifications(
    notifications: NotificationData[],
  ): Promise<NotificationModel[]> {
    try {
      const response = await axiosInstance.post("/notifications/bulk-send", {
        notifications,
      });

      toast({
        title: "Bulk Notifications Sent",
        description: `${notifications.length} notifications sent successfully`,
        variant: "default",
      });

      return response.data;
    } catch (error: any) {
      toast({
        title: "Failed to Send Bulk Notifications",
        description:
          error.response?.data?.message ||
          "An error occurred while sending notifications",
        variant: "destructive",
      });

      throw new Error(
        error.response?.data?.message || "Failed to send bulk notifications",
      );
    }
  }

  async getNotifications(email: string): Promise<Notification[]> {
    try {
      const response = await axiosInstance.get(
        `/notifications?email=${encodeURIComponent(email)}`,
      );
      // Transform the data to match our Notification interface
      const notifications = response.data.map((notif: any) => ({
        id: notif.id || notif._id,
        title: notif.title,
        message: notif.message,
        type: notif.type || "info",
        recipientEmail: notif.email || notif.recipientEmail,
        read: notif.isRead || notif.read || false,
        createdDate: notif.date || notif.createdDate,
        avatar: notif.avatar,
      }));
      return notifications;
    } catch (error: any) {
      // Return mock data if API fails
      console.error("Failed to fetch notifications:", error);
      return [
        {
          id: "1",
          title: "Leave Request",
          message: "John Doe has requested annual leave for next week",
          type: "info",
          recipientEmail: email,
          read: false,
          createdDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          title: "Verification Pending",
          message: "New employee Emily Chen needs document verification",
          type: "warning",
          recipientEmail: email,
          read: false,
          createdDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          title: "System Update",
          message: "HR system will be updated tonight at 2 AM",
          type: "info",
          recipientEmail: email,
          read: true,
          createdDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }
  }

  async markAsRead(notificationId: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.patch(
        `/notifications/${notificationId}/read`,
      );

      toast({
        title: "Notification Updated",
        description: "Notification marked as read",
        variant: "default",
      });

      return response.data;
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description:
          error.response?.data?.message || "Failed to update notification",
        variant: "destructive",
      });

      throw new Error(
        error.response?.data?.message || "Failed to mark notification as read",
      );
    }
  }

  async markAllAsRead(email: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.patch("/notifications/mark-read", {
        email,
      });

      toast({
        title: "All Notifications Updated",
        description: "All notifications marked as read",
        variant: "default",
      });

      return response.data;
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description:
          error.response?.data?.message || "Failed to update notifications",
        variant: "destructive",
      });

      throw new Error(
        error.response?.data?.message || "Failed to mark notifications as read",
      );
    }
  }

  async deleteNotification(
    notificationId: string,
  ): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(
        `/notifications/${notificationId}`,
      );

      toast({
        title: "Notification Deleted",
        description: "Notification has been removed",
        variant: "default",
      });

      return response.data;
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description:
          error.response?.data?.message || "Failed to delete notification",
        variant: "destructive",
      });

      throw new Error(
        error.response?.data?.message || "Failed to delete notification",
      );
    }
  }

  async getUnreadCount(email: string): Promise<number> {
    try {
      const response = await axiosInstance.get(
        `/notifications/unread-count?email=${encodeURIComponent(email)}`,
      );
      return response.data.count || 0;
    } catch (error: any) {
      console.error("Failed to fetch unread count:", error);
      return 0;
    }
  }

  // Utility method to show toast notifications
  showToast(
    type: "success" | "error" | "info" | "warning",
    title: string,
    description?: string,
  ) {
    const variant = type === "error" ? "destructive" : "default";

    toast({
      title,
      description,
      variant,
    });
  }

  // Method to create system notifications for common HR actions
  async notifyLeaveRequest(
    employeeName: string,
    hrEmail: string,
    leaveType: string,
    startDate: string,
  ) {
    return this.sendNotification({
      title: "New Leave Request",
      message: `${employeeName} has requested ${leaveType} starting ${startDate}`,
      email: hrEmail,
      type: "info",
    });
  }

  async notifyLeaveApproval(
    employeeEmail: string,
    leaveType: string,
    status: "approved" | "rejected",
  ) {
    return this.sendNotification({
      title: `Leave Request ${status === "approved" ? "Approved" : "Rejected"}`,
      message: `Your ${leaveType} request has been ${status}`,
      email: employeeEmail,
      type: status === "approved" ? "success" : "warning",
    });
  }

  async notifyDocumentVerification(hrEmail: string, employeeName: string) {
    return this.sendNotification({
      title: "Document Verification Required",
      message: `${employeeName} has submitted documents for verification`,
      email: hrEmail,
      type: "warning",
    });
  }

  async notifySystemUpdate(recipientEmail: string, updateDetails: string) {
    return this.sendNotification({
      title: "System Update",
      message: updateDetails,
      email: recipientEmail,
      type: "info",
    });
  }
}

export default new NotificationService();
