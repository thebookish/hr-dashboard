import axiosInstance from "@/utils/axiosInstance";
import notificationService from "./notificationService";
import { getUser } from "@/utils/storage";

export interface SalaryModel {
  email: string;
  basic: number;
  hra: number;
  allowance: number;
  deduction: number;
  paymentHistory: Array<{
    month: string;
    amount: number;
    status: "Paid" | "Pending";
  }>;
  upcomingIncrements: Array<{
    effectiveDate: string;
    newSalary: number;
  }>;
}

export interface SalaryData {
  email: string;
  basic: number;
  hra?: number;
  allowance?: number;
  deduction?: number;
}

class SalaryService {
  async getSalaryInfo(email: string): Promise<SalaryModel> {
    try {
      const response = await axiosInstance.get(
        `/salary-info/get-salary?email=${encodeURIComponent(email)}`,
      );
      // Ensure the response matches the SalaryModel structure
      const salaryData = response.data;
      return {
        email: salaryData.email || email,
        basic: salaryData.basic || 0,
        hra: salaryData.hra || 0,
        allowance: salaryData.allowance || 0,
        deduction: salaryData.deduction || 0,
        paymentHistory: salaryData.paymentHistory || [],
        upcomingIncrements: salaryData.upcomingIncrements || [],
      };
    } catch (error: any) {
      console.error("Failed to fetch salary info:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch salary information",
      );
    }
  }

  async addSalaryInfo(data: SalaryData): Promise<SalaryModel> {
    try {
      const response = await axiosInstance.post(
        "/salary-info/add-salary",
        data,
      );
      // Ensure the response matches the SalaryModel structure
      const salaryData = response.data;
      const result = {
        email: salaryData.email || data.email,
        basic: salaryData.basic || data.basic,
        hra: salaryData.hra || data.hra || 0,
        allowance: salaryData.allowance || data.allowance || 0,
        deduction: salaryData.deduction || data.deduction || 0,
        paymentHistory: salaryData.paymentHistory || [],
        upcomingIncrements: salaryData.upcomingIncrements || [],
      };

      // Send notification to employee about salary info addition
      try {
        const currentUser = getUser();
        const adminName = currentUser?.name || "HR Admin";
        const totalSalary =
          result.basic + result.hra + result.allowance - result.deduction;

        await notificationService.sendNotification({
          title: "Salary Information Added",
          message: `Your salary information has been added to the system by ${adminName}. Total monthly salary: ${totalSalary.toLocaleString()}`,
          email: data.email,
          type: "success",
        });
      } catch (notifError) {
        console.error(
          "Failed to send salary addition notification:",
          notifError,
        );
      }

      return result;
    } catch (error: any) {
      console.error("Failed to add salary info:", error);
      throw new Error(
        error.response?.data?.message || "Failed to add salary information",
      );
    }
  }

  async updateSalaryInfo(
    email: string,
    data: Partial<SalaryData>,
  ): Promise<SalaryModel> {
    try {
      const response = await axiosInstance.put(
        `/salary-info/${encodeURIComponent(email)}`,
        data,
      );
      // Ensure the response matches the SalaryModel structure
      const salaryData = response.data;
      const result = {
        email: salaryData.email || email,
        basic: salaryData.basic || data.basic || 0,
        hra: salaryData.hra || data.hra || 0,
        allowance: salaryData.allowance || data.allowance || 0,
        deduction: salaryData.deduction || data.deduction || 0,
        paymentHistory: salaryData.paymentHistory || [],
        upcomingIncrements: salaryData.upcomingIncrements || [],
      };

      // Send notification to employee about salary info update
      try {
        const currentUser = getUser();
        const adminName = currentUser?.name || "HR Admin";
        const totalSalary =
          result.basic + result.hra + result.allowance - result.deduction;

        await notificationService.sendNotification({
          title: "Salary Information Updated",
          message: `Your salary information has been updated by ${adminName}. New total monthly salary: ${totalSalary.toLocaleString()}`,
          email: email,
          type: "info",
        });
      } catch (notifError) {
        console.error("Failed to send salary update notification:", notifError);
      }

      return result;
    } catch (error: any) {
      console.error("Failed to update salary info:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update salary information",
      );
    }
  }
}

export default new SalaryService();
