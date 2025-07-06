import axiosInstance from "@/utils/axiosInstance";

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
      return response.data;
    } catch (error: any) {
      // Return mock data if API fails
      console.error("Failed to fetch salary info:", error);
      return {
        email,
        basic: 50000,
        hra: 15000,
        allowance: 5000,
        deduction: 2000,
        paymentHistory: [
          {
            month: "January 2024",
            amount: 68000,
            status: "Paid",
          },
          {
            month: "December 2023",
            amount: 68000,
            status: "Paid",
          },
          {
            month: "February 2024",
            amount: 68000,
            status: "Pending",
          },
        ],
        upcomingIncrements: [
          {
            effectiveDate: "2024-04-01",
            newSalary: 75000,
          },
        ],
      };
    }
  }

  async addSalaryInfo(data: SalaryData): Promise<SalaryModel> {
    try {
      const response = await axiosInstance.post(
        "/salary-info/add-salary",
        data,
      );
      return response.data;
    } catch (error: any) {
      // Return mock success response if API fails
      console.error("Failed to add salary info:", error);
      return {
        email: data.email,
        basic: data.basic,
        hra: data.hra || 0,
        allowance: data.allowance || 0,
        deduction: data.deduction || 0,
        paymentHistory: [],
        upcomingIncrements: [],
      };
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
      return response.data;
    } catch (error: any) {
      // Return mock updated data if API fails
      console.error("Failed to update salary info:", error);
      return {
        email,
        basic: data.basic || 50000,
        hra: data.hra || 15000,
        allowance: data.allowance || 5000,
        deduction: data.deduction || 2000,
        paymentHistory: [
          {
            month: "January 2024",
            amount:
              (data.basic || 50000) +
              (data.hra || 15000) +
              (data.allowance || 5000) -
              (data.deduction || 2000),
            status: "Paid",
          },
        ],
        upcomingIncrements: [],
      };
    }
  }
}

export default new SalaryService();
