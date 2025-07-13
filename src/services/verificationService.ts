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
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch verification requests",
      );
    }
  }

  async approveVerification(
    decision: VerificationDecision,
  ): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.put("/employees/verify", {
        email: decision.employeeEmail,
      });

      toast({
        title: "Verification Updated",
        description: "Employee verification approved successfully",

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

      throw error;
    }
  }
  async rejectVerification(
    decision: VerificationDecision,
  ): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.put("/employees/decline", {
        email: decision.employeeEmail,
      });

      toast({
        title: "Verification Rejected",
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

      throw error;
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
