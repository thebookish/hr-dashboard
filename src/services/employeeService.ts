import axiosInstance from "@/utils/axiosInstance";
import notificationService from "./notificationService";
import { getUser } from "@/utils/storage";

export interface ChildInfo {
  name: string;
  gender: string;
  dob: string;
  schoolingYear: string;
  school: string;
}

export interface EmployeeModelNew {
  // Personal Info
  firstName?: string;
  surname?: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  presentAddress?: string;
  permanentAddress?: string;
  passportNo?: string;
  emirateIdNo?: string;
  eidIssue?: string;
  eidExpiry?: string;
  passportIssue?: string;
  passportExpiry?: string;
  visaNo?: string;
  visaExpiry?: string;
  visaType?: string;
  sponsor?: string;

  // Job Info
  position?: string;
  wing?: string;
  homeLocal?: string;
  joinDate?: string;
  retireDate?: string;

  // Contact Info
  landPhone?: string;
  mobile?: string;
  email?: string;
  altMobile?: string;
  botim?: string;
  whatsapp?: string;
  emergency?: string;

  // Salary Info
  bank?: string;
  accountNo?: string;
  accountName?: string;
  iban?: string;

  // Emergency Contact
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
  emergencyEmail?: string;
  emergencyBotim?: string;
  emergencyWhatsapp?: string;

  // Family Info
  spouseName?: string;
  childDetails?: ChildInfo[];

  // Uploaded Files
  photo?: string;
  passport?: string;
  eid?: string;
  visa?: string;
  cv?: string;
  cert?: string;
  ref?: string;

  // Leave Info
  sickLeave?: number;
  casualLeave?: number;
  paidLeave?: number;

  status?: string;
}

// Legacy Employee interface for backward compatibility
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: "active" | "inactive" | "pending";
  verified: boolean;
  avatar?: string;
  joinDate: string;
  salary: number;
  sickLeave: number;
  casualLeave: number;
  paidLeave: number;
}

export interface EmployeeUpdateData {
  firstName?: string;
  surname?: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  presentAddress?: string;
  permanentAddress?: string;
  passportNo?: string;
  emirateIdNo?: string;
  eidIssue?: string;
  eidExpiry?: string;
  passportIssue?: string;
  passportExpiry?: string;
  visaNo?: string;
  visaExpiry?: string;
  visaType?: string;
  sponsor?: string;
  position?: string;
  wing?: string;
  homeLocal?: string;
  joinDate?: string;
  retireDate?: string;
  landPhone?: string;
  mobile?: string;
  email?: string;
  altMobile?: string;
  botim?: string;
  whatsapp?: string;
  emergency?: string;
  bank?: string;
  accountNo?: string;
  accountName?: string;
  iban?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
  emergencyEmail?: string;
  emergencyBotim?: string;
  emergencyWhatsapp?: string;
  spouseName?: string;
  childDetails?: ChildInfo[];
  photo?: string;
  passport?: string;
  eid?: string;
  visa?: string;
  cv?: string;
  cert?: string;
  ref?: string;
  sickLeave?: number;
  casualLeave?: number;
  paidLeave?: number;
  status?: string;
}

class EmployeeService {
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const response = await axiosInstance.get("/employees/approved");
      // Transform the data to match our Employee interface
      const employees = response.data.map((emp: any) => ({
        id: emp.id || emp._id,
        name:
          `${emp.firstName || ""} ${emp.surname || ""}`.trim() ||
          emp.fullName ||
          emp.name,
        email: emp.email,
        phone: emp.mobile || emp.phone,
        department: emp.wing || emp.department || "General",
        position: emp.position || "Employee",
        status: emp.status || "active",
        verified: true, // All employees from /approved endpoint are verified
        avatar: emp.photo || emp.avatar,
        joinDate: emp.joinDate,
        salary: parseInt(emp.salary) || 0,
        sickLeave: emp.sickLeave || 0,
        casualLeave: emp.casualLeave || 0,
        paidLeave: emp.paidLeave || 0,
      }));
      return employees;
    } catch (error: any) {
      console.error("Failed to fetch approved employees:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch employees",
      );
    }
  }

  async getEmployee(email: string): Promise<EmployeeModelNew> {
    try {
      const response = await axiosInstance.get(
        `/employees/emp-data?email=${encodeURIComponent(email)}`,
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch employee:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch employee data",
      );
    }
  }

  async updateEmployee(
    email: string,
    data: EmployeeUpdateData,
  ): Promise<EmployeeModelNew> {
    try {
      const response = await axiosInstance.put(
        `/employees/edit/?email=${encodeURIComponent(email)}`,
        data,
      );

      // Send notification to employee about profile update
      try {
        const currentUser = getUser();
        const adminName = currentUser?.name || "HR Admin";

        await notificationService.sendNotification({
          title: "Profile Updated",
          message: `Your employee profile has been updated by ${adminName}. Please review your information to ensure accuracy.`,
          email: email,
          type: "info",
        });
      } catch (notifError) {
        console.error(
          "Failed to send profile update notification:",
          notifError,
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to update employee:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update employee",
      );
    }
  }

  async verifyEmployee(email: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.put(
        `/employees/verify/?email=${encodeURIComponent(email)}`,
      );

      // Send notification to employee
      try {
        const currentUser = getUser();
        const adminName = currentUser?.name || "HR Admin";

        await notificationService.sendNotification({
          title: "Employee Verification Approved",
          message: `Congratulations! Your employee verification has been approved by ${adminName}. You now have full access to the system.`,
          email: email,
          type: "success",
        });
      } catch (notifError) {
        console.error(
          "Failed to send verification approval notification:",
          notifError,
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to verify employee:", error);
      throw new Error(
        error.response?.data?.message || "Failed to verify employee",
      );
    }
  }

  async declineEmployee(email: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.put(
        `/employees/decline/?email=${encodeURIComponent(email)}`,
      );

      // Send notification to employee
      try {
        const currentUser = getUser();
        const adminName = currentUser?.name || "HR Admin";

        await notificationService.sendNotification({
          title: "Employee Verification Declined",
          message: `Your employee verification has been declined by ${adminName}. Please contact HR for more information or to resubmit your documents.`,
          email: email,
          type: "warning",
        });
      } catch (notifError) {
        console.error(
          "Failed to send verification decline notification:",
          notifError,
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to decline employee:", error);
      throw new Error(
        error.response?.data?.message || "Failed to decline employee",
      );
    }
  }
}

export default new EmployeeService();
