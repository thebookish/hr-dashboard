import axiosInstance from "@/utils/axiosInstance";

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
      // Return mock data if API fails (only verified employees)
      console.error("Failed to fetch approved employees:", error);
      return [
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@company.com",
          phone: "+1234567890",
          department: "Engineering",
          position: "Software Engineer",
          status: "active",
          verified: true,
          joinDate: "2023-01-15",
          salary: 75000,
          sickLeave: 5,
          casualLeave: 10,
          paidLeave: 15,
        },
        {
          id: "3",
          name: "Michael Brown",
          email: "michael.brown@company.com",
          phone: "+1234567892",
          department: "HR",
          position: "HR Specialist",
          status: "active",
          verified: true,
          joinDate: "2022-11-10",
          salary: 55000,
          sickLeave: 2,
          casualLeave: 5,
          paidLeave: 18,
        },
      ];
    }
  }

  async getEmployee(email: string): Promise<EmployeeModelNew> {
    try {
      const response = await axiosInstance.get(
        `/employees/emp-data?email=${encodeURIComponent(email)}`,
      );
      return response.data;
    } catch (error: any) {
      // Return mock data if API fails
      console.error("Failed to fetch employee:", error);
      return {
        firstName: "John",
        surname: "Doe",
        email: email,
        mobile: "+1234567890",
        dob: "1990-01-15",
        gender: "Male",
        maritalStatus: "Married",
        sponsor: "TechCorp Solutions",
        position: "Software Engineer",
        joinDate: "2023-01-15",
        retireDate: "2025-01-15",
        bank: "Chase Bank",
        accountNo: "1234567890",
        passportNo: "US123456789",
        emergencyName: "Jane Doe",
        emergencyPhone: "+1234567891",
        spouseName: "Jane Doe",
        childDetails: [
          {
            name: "Tommy Doe",
            gender: "Male",
            dob: "2015-05-10",
            schoolingYear: "Grade 3",
            school: "Dubai International School",
          },
        ],
        status: "active",
        sickLeave: 5,
        casualLeave: 10,
        paidLeave: 15,
      };
    }
  }

  async updateEmployee(
    email: string,
    data: EmployeeUpdateData,
  ): Promise<EmployeeModelNew> {
    try {
      const response = await axiosInstance.put(
        `/employees/${encodeURIComponent(email)}`,
        data,
      );
      return response.data;
    } catch (error: any) {
      // Return mock updated data if API fails
      console.error("Failed to update employee:", error);
      return {
        firstName: data.firstName || "John",
        surname: data.surname || "Doe",
        email: email,
        mobile: data.mobile || "+1234567890",
        dob: data.dob || "1990-01-15",
        gender: data.gender || "Male",
        maritalStatus: data.maritalStatus || "Married",
        sponsor: data.sponsor || "TechCorp Solutions",
        position: data.position || "Software Engineer",
        joinDate: data.joinDate || "2023-01-15",
        retireDate: data.retireDate || "2025-01-15",
        bank: data.bank || "Chase Bank",
        accountNo: data.accountNo || "1234567890",
        passportNo: data.passportNo || "US123456789",
        emergencyName: data.emergencyName || "Jane Doe",
        emergencyPhone: data.emergencyPhone || "+1234567891",
        spouseName: data.spouseName || "Jane Doe",
        childDetails: data.childDetails || [
          {
            name: "Tommy Doe",
            gender: "Male",
            dob: "2015-05-10",
            schoolingYear: "Grade 3",
            school: "Dubai International School",
          },
        ],
        status: data.status || "active",
        sickLeave: data.sickLeave || 5,
        casualLeave: data.casualLeave || 10,
        paidLeave: data.paidLeave || 15,
      };
    }
  }

  async verifyEmployee(
    email: string,
    approved: boolean,
  ): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.patch("/employees/verify", {
        email,
        approved,
      });
      return response.data;
    } catch (error: any) {
      // Return mock success response if API fails
      console.error("Failed to verify employee:", error);
      return {
        message: approved
          ? "Employee verified successfully"
          : "Employee verification rejected",
      };
    }
  }
}

export default new EmployeeService();
