import axiosInstance from "@/utils/axiosInstance";
import employeeService from "./employeeService";
import leaveService from "./leaveService";
import verificationService from "./verificationService";

export interface ActivityItem {
  id: string;
  employeeName: string;
  employeeEmail: string;
  action: string;
  type: "employee" | "leave" | "verification" | "general";
  status: "pending" | "completed" | "rejected";
  timestamp: string;
  avatar?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  verificationRequests: number;
  recentActivities?: ActivityItem[];
  notifications?: any[];
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    try {
      // Fetch data from existing endpoints
      const [employees, leaves, verificationRequests] = await Promise.all([
        employeeService.getAllEmployees(),
        leaveService.getLeaveRequests(),
        verificationService.getVerificationRequests(),
      ]);

      const totalEmployees = employees.length;
      const pendingLeaves = leaves.filter(
        (leave) => leave.status === "pending",
      ).length;
      const pendingVerifications = verificationRequests.filter(
        (req) => req.status === "pending",
      ).length;

      return {
        totalEmployees,
        pendingLeaves,
        verificationRequests: pendingVerifications,
      };
    } catch (error: any) {
      console.error("Failed to fetch dashboard stats:", error);
      throw new Error(error.message || "Failed to fetch dashboard statistics");
    }
  }

  async getRecentActivities(): Promise<ActivityItem[]> {
    try {
      // Fetch data from existing endpoints
      const [employees, leaves, verificationRequests] = await Promise.all([
        employeeService.getAllEmployees(),
        leaveService.getLeaveRequests(),
        verificationService.getVerificationRequests(),
      ]);

      const activities: ActivityItem[] = [];

      // Create activities from recent leave requests
      leaves.slice(0, 5).forEach((leave, index) => {
        activities.push({
          id: `leave-${leave.id}`,
          employeeName: leave.employeeName,
          employeeEmail: leave.employeeEmail,
          action: `Requested ${leave.leaveType} from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
          type: "leave",
          status:
            leave.status === "pending"
              ? "pending"
              : leave.status === "approved"
                ? "completed"
                : "rejected",
          timestamp: leave.reviewedAt,
        });
      });

      // Create activities from recent verification requests
      verificationRequests.slice(0, 3).forEach((request) => {
        activities.push({
          id: `verification-${request.id}`,
          employeeName: request.employeeName,
          employeeEmail: request.employeeEmail,
          action: `Submitted documents for ${request.personalInfo.position} position verification`,
          type: "verification",
          status:
            request.status === "pending"
              ? "pending"
              : request.status === "approved"
                ? "completed"
                : "rejected",
          timestamp: request.submittedDate,
        });
      });

      // Sort by timestamp (most recent first)
      return activities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    } catch (error: any) {
      console.error("Failed to fetch recent activities:", error);
      throw new Error(error.message || "Failed to fetch recent activities");
    }
  }
}

export default new DashboardService();
