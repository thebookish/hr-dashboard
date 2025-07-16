import axiosInstance from "@/utils/axiosInstance";
import notificationService from "./notificationService";
import { getUser } from "@/utils/storage";

export interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeEmail: string;
  leaveType: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedDate?: string;
  // New fields from updated LeaveModel
  noOfDays: number;
  whatsapp: string;
  emergencyContact: string;
  substituteName: string;
  substituteContact: string;
  signature: string;
  designation: string;
  wing: string;
}

export interface LeaveModel {
  id: string;
  name: string;
  email: string;
  type: string;
  reason: string;
  fromDate: string;
  toDate: string;
  status: "Pending" | "Approved" | "Rejected";
  // New fields
  noOfDays: number;
  whatsapp: string;
  emergencyContact: string;
  substituteName: string;
  substituteContact: string;
  signature: string;
  designation: string;
  wing: string;
}

class LeaveService {
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    try {
      const response = await axiosInstance.get("/leaves");
      // Transform the data to match our LeaveRequest interface
      const leaves = response.data.map((leave: any) => ({
        id: leave.id || leave._id,
        employeeName: leave.name || leave.employeeName,
        employeeEmail: leave.email || leave.employeeEmail,
        leaveType: leave.type || leave.leaveType,
        reason: leave.reason || "",
        startDate: leave.fromDate || leave.startDate,
        endDate: leave.toDate || leave.endDate,
        status: leave.status?.toLowerCase() || "pending",
        approvedBy: leave.approvedBy,
        approvedDate: leave.approvedDate,
        // New fields from updated LeaveModel
        noOfDays: leave.noOfDays || 0,
        whatsapp: leave.whatsapp || "",
        emergencyContact: leave.emergencyContact || "",
        substituteName: leave.substituteName || "",
        substituteContact: leave.substituteContact || "",
        signature: leave.signature || "",
        designation: leave.designation || "",
        wing: leave.wing || "",
      }));
      return leaves;
    } catch (error: any) {
      console.error("Failed to fetch leave requests:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch leave requests",
      );
    }
  }

  async approveLeave(email: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.put(
        `/leaves/approve?email=${encodeURIComponent(email)}`,
      );

      // Send notification to employee
      try {
        const currentUser = getUser();
        const adminName = currentUser?.name || "HR Admin";

        await notificationService.sendNotification({
          title: "Leave Request Approved",
          message: `Great news! Your leave request has been approved by ${adminName}. Enjoy your time off!`,
          email: email,
          type: "success",
        });
      } catch (notifError) {
        console.error(
          "Failed to send leave approval notification:",
          notifError,
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to approve leave:", error);
      throw new Error(
        error.response?.data?.message || "Failed to approve leave request",
      );
    }
  }

  async rejectLeave(email: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.put(
        `/leaves/reject?email=${encodeURIComponent(email)}`,
      );

      // Send notification to employee
      try {
        const currentUser = getUser();
        const adminName = currentUser?.name || "HR Admin";

        await notificationService.sendNotification({
          title: "Leave Request Rejected",
          message: `Your leave request has been rejected by ${adminName}. Please contact HR if you need clarification or wish to discuss alternative arrangements.`,
          email: email,
          type: "warning",
        });
      } catch (notifError) {
        console.error(
          "Failed to send leave rejection notification:",
          notifError,
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to reject leave:", error);
      throw new Error(
        error.response?.data?.message || "Failed to reject leave request",
      );
    }
  }
}

export default new LeaveService();
