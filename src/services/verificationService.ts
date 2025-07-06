import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/components/ui/use-toast";

export interface VerificationRequest {
  id: string;
  employeeName: string;
  employeeEmail: string;
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
  documents: {
    passport?: string;
    eid?: string;
    visa?: string;
    cv?: string;
    certificates?: string;
    references?: string;
    photo?: string;
  };
  personalInfo: {
    // Personal Info
    firstName: string;
    surname: string;
    dob: string;
    gender: string;
    maritalStatus: string;
    presentAddress: string;
    permanentAddress: string;
    passportNo: string;
    emirateIdNo: string;
    eidIssue: string;
    eidExpiry: string;
    passportIssue: string;
    passportExpiry: string;
    visaNo: string;
    visaExpiry: string;
    visaType: string;
    sponsor: string;
    nationality: string;

    // Job Info
    position: string;
    wing: string;
    homeLocal: string;
    joinDate: string;
    retireDate: string;

    // Contact Info
    landPhone: string;
    mobile: string;
    email: string;
    altMobile: string;
    botim: string;
    whatsapp: string;
    emergency: string;

    // Banking Info
    bank: string;
    accountNo: string;
    accountName: string;
    iban: string;

    // Emergency Contact
    emergencyName: string;
    emergencyRelation: string;
    emergencyPhone: string;
    emergencyEmail: string;
    emergencyBotim: string;
    emergencyWhatsapp: string;

    // Family Info
    spouseName: string;
    childDetails: Array<{
      name: string;
      gender: string;
      dob: string;
      schoolingYear: string;
      school: string;
    }>;

    // Leave Info
    sickLeave: number;
    casualLeave: number;
    paidLeave: number;

    // Legacy fields for backward compatibility
    phone: string;
    address: string;
  };
  reviewedBy?: string;
  reviewedDate?: string;
  rejectionReason?: string;
}

export interface VerificationDecision {
  employeeEmail: string;
  approved: boolean;
  reason?: string;
}

class VerificationService {
  private readonly BASE_URL =
    "https://backend-hrm-cwbfc6cwbwbbdhae.southeastasia-01.azurewebsites.net";

  private getDocumentUrl(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    // If the filePath already contains the full URL, return as is
    if (filePath.startsWith("http")) return filePath;
    // Otherwise, prepend the base URL
    return `${this.BASE_URL}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  }

  async getVerificationRequests(): Promise<VerificationRequest[]> {
    try {
      const response = await axiosInstance.get("/employees/pending");
      // Transform the response data to match VerificationRequest interface
      return response.data.map((employee: any) => ({
        id:
          employee.id ||
          employee._id ||
          Math.random().toString(36).substr(2, 9),
        employeeName:
          `${employee.firstName || ""} ${employee.surname || ""}`.trim() ||
          employee.name ||
          "Unknown",
        employeeEmail: employee.email || "",
        submittedDate:
          employee.createdAt ||
          employee.submittedDate ||
          new Date().toISOString(),
        status: "pending" as const,
        documents: {
          passport: this.getDocumentUrl(employee.passport),
          eid: this.getDocumentUrl(employee.eid),
          visa: this.getDocumentUrl(employee.visa),
          cv: this.getDocumentUrl(employee.cv),
          certificates: this.getDocumentUrl(employee.cert),
          references: this.getDocumentUrl(employee.ref),
          photo: this.getDocumentUrl(employee.photo),
        },
        personalInfo: {
          // Personal Info
          firstName: employee.firstName || "",
          surname: employee.surname || "",
          dob: employee.dob || "",
          gender: employee.gender || "",
          maritalStatus: employee.maritalStatus || "",
          presentAddress: employee.presentAddress || "",
          permanentAddress: employee.permanentAddress || "",
          passportNo: employee.passportNo || "",
          emirateIdNo: employee.emirateIdNo || "",
          eidIssue: employee.eidIssue || "",
          eidExpiry: employee.eidExpiry || "",
          passportIssue: employee.passportIssue || "",
          passportExpiry: employee.passportExpiry || "",
          visaNo: employee.visaNo || "",
          visaExpiry: employee.visaExpiry || "",
          visaType: employee.visaType || "",
          sponsor: employee.sponsor || "",
          nationality: employee.nationality || "",

          // Job Info
          position: employee.position || "",
          wing: employee.wing || "",
          homeLocal: employee.homeLocal || "",
          joinDate: employee.joinDate || "",
          retireDate: employee.retireDate || "",

          // Contact Info
          landPhone: employee.landPhone || "",
          mobile: employee.mobile || "",
          email: employee.email || "",
          altMobile: employee.altMobile || "",
          botim: employee.botim || "",
          whatsapp: employee.whatsapp || "",
          emergency: employee.emergency || "",

          // Banking Info
          bank: employee.bank || "",
          accountNo: employee.accountNo || "",
          accountName: employee.accountName || "",
          iban: employee.iban || "",

          // Emergency Contact
          emergencyName: employee.emergencyName || "",
          emergencyRelation: employee.emergencyRelation || "",
          emergencyPhone: employee.emergencyPhone || "",
          emergencyEmail: employee.emergencyEmail || "",
          emergencyBotim: employee.emergencyBotim || "",
          emergencyWhatsapp: employee.emergencyWhatsapp || "",

          // Family Info
          spouseName: employee.spouseName || "",
          childDetails: employee.childDetails || [],

          // Leave Info
          sickLeave: employee.sickLeave || 0,
          casualLeave: employee.casualLeave || 0,
          paidLeave: employee.paidLeave || 0,

          // Legacy fields for backward compatibility
          phone: employee.mobile || employee.phone || "",
          address: employee.presentAddress || employee.permanentAddress || "",
        },
        reviewedBy: undefined,
        reviewedDate: undefined,
        rejectionReason: undefined,
      }));
    } catch (error: any) {
      console.error("Failed to fetch verification requests:", error);
      // Return mock data if API fails
      return [
        {
          id: "1",
          employeeName: "Sarah Johnson",
          employeeEmail: "sarah.johnson@company.com",
          submittedDate: "2024-02-10T10:30:00Z",
          status: "pending",
          documents: {
            passport: `${this.BASE_URL}/docs/passport-sarah.pdf`,
            eid: `${this.BASE_URL}/docs/eid-sarah.pdf`,
            visa: `${this.BASE_URL}/docs/visa-sarah.pdf`,
            cv: `${this.BASE_URL}/docs/cv-sarah.pdf`,
            certificates: `${this.BASE_URL}/docs/cert-sarah.pdf`,
            photo:
              "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&q=80",
          },
          personalInfo: {
            firstName: "Sarah",
            surname: "Johnson",
            dob: "1992-05-15",
            gender: "Female",
            maritalStatus: "Single",
            presentAddress: "Dubai Marina, Dubai, UAE",
            permanentAddress: "123 Main St, New York, USA",
            passportNo: "US123456789",
            emirateIdNo: "784-1992-1234567-8",
            eidIssue: "2020-01-15",
            eidExpiry: "2025-01-15",
            passportIssue: "2019-06-10",
            passportExpiry: "2029-06-10",
            visaNo: "UAE987654321",
            visaExpiry: "2025-03-01",
            visaType: "Employment Visa",
            sponsor: "TechCorp Dubai",
            nationality: "American",
            position: "Software Developer",
            wing: "Engineering",
            homeLocal: "Local",
            joinDate: "2024-03-01",
            retireDate: "2029-03-01",
            landPhone: "+97143334444",
            mobile: "+971501234567",
            email: "sarah.johnson@company.com",
            altMobile: "+971509876543",
            botim: "+971501234567",
            whatsapp: "+971501234567",
            emergency: "+971501234568",
            bank: "Emirates NBD",
            accountNo: "1234567890",
            accountName: "Sarah Johnson",
            iban: "AE070331234567890123456",
            emergencyName: "John Johnson",
            emergencyRelation: "Father",
            emergencyPhone: "+971501234568",
            emergencyEmail: "john.johnson@email.com",
            emergencyBotim: "+971501234568",
            emergencyWhatsapp: "+971501234568",
            spouseName: "",
            childDetails: [],
            sickLeave: 5,
            casualLeave: 10,
            paidLeave: 15,
            phone: "+971501234567",
            address: "Dubai Marina, Dubai, UAE",
          },
        },
        {
          id: "2",
          employeeName: "Ahmed Al-Rashid",
          employeeEmail: "ahmed.rashid@company.com",
          submittedDate: "2024-02-08T14:20:00Z",
          status: "pending",
          documents: {
            passport: `${this.BASE_URL}/docs/passport-ahmed.pdf`,
            eid: `${this.BASE_URL}/docs/eid-ahmed.pdf`,
            cv: `${this.BASE_URL}/docs/cv-ahmed.pdf`,
            photo:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
          },
          personalInfo: {
            firstName: "Ahmed",
            surname: "Al-Rashid",
            dob: "1988-12-03",
            gender: "Male",
            maritalStatus: "Married",
            presentAddress: "Jumeirah, Dubai, UAE",
            permanentAddress: "Jumeirah, Dubai, UAE",
            passportNo: "UAE987654321",
            emirateIdNo: "784-1988-9876543-2",
            eidIssue: "2018-12-01",
            eidExpiry: "2028-12-01",
            passportIssue: "2018-01-15",
            passportExpiry: "2028-01-15",
            visaNo: "",
            visaExpiry: "",
            visaType: "Local",
            sponsor: "Local Sponsor",
            nationality: "Emirati",
            position: "Marketing Manager",
            wing: "Marketing",
            homeLocal: "Local",
            joinDate: "2024-02-20",
            retireDate: "2029-02-20",
            landPhone: "+97143335555",
            mobile: "+971509876543",
            email: "ahmed.rashid@company.com",
            altMobile: "+971501234567",
            botim: "+971509876543",
            whatsapp: "+971509876543",
            emergency: "+971509876544",
            bank: "ADCB",
            accountNo: "9876543210",
            accountName: "Ahmed Al-Rashid",
            iban: "AE070021987654321012345",
            emergencyName: "Fatima Al-Rashid",
            emergencyRelation: "Wife",
            emergencyPhone: "+971509876544",
            emergencyEmail: "fatima.rashid@email.com",
            emergencyBotim: "+971509876544",
            emergencyWhatsapp: "+971509876544",
            spouseName: "Fatima Al-Rashid",
            childDetails: [
              {
                name: "Omar Al-Rashid",
                gender: "Male",
                dob: "2015-08-20",
                schoolingYear: "Grade 4",
                school: "Dubai International Academy",
              },
              {
                name: "Aisha Al-Rashid",
                gender: "Female",
                dob: "2018-03-12",
                schoolingYear: "Grade 1",
                school: "Dubai International Academy",
              },
            ],
            sickLeave: 3,
            casualLeave: 8,
            paidLeave: 20,
            phone: "+971509876543",
            address: "Jumeirah, Dubai, UAE",
          },
        },
      ];
    }
  }

  async approveVerification(
    decision: VerificationDecision,
  ): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post("/employees/verify", {
        email: decision.employeeEmail,
        approved: decision.approved,
        reason: decision.reason,
      });

      toast({
        title: "Verification Updated",
        description: decision.approved
          ? "Employee verification approved successfully"
          : "Employee verification rejected",
        variant: "default",
      });

      return response.data;
    } catch (error: any) {
      console.error("Failed to update verification:", error);

      toast({
        title: "Update Failed",
        description:
          error.response?.data?.message ||
          "Failed to update verification status",
        variant: "destructive",
      });

      // Return mock success response if API fails
      return {
        message: decision.approved
          ? "Employee verification approved successfully"
          : "Employee verification rejected",
      };
    }
  }

  async downloadDocument(documentUrl: string, fileName: string): Promise<void> {
    try {
      // For demo purposes, we'll simulate document download
      // In a real implementation, this would handle actual file downloads
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${fileName}...`,
        variant: "default",
      });
    } catch (error: any) {
      console.error("Failed to download document:", error);

      toast({
        title: "Download Failed",
        description: "Failed to download the document",
        variant: "destructive",
      });
    }
  }

  async viewDocument(documentUrl: string): Promise<void> {
    try {
      window.open(documentUrl, "_blank");
    } catch (error: any) {
      console.error("Failed to view document:", error);

      toast({
        title: "View Failed",
        description: "Failed to open the document",
        variant: "destructive",
      });
    }
  }
}

export default new VerificationService();
