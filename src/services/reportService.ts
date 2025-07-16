import jsPDF from "jspdf";
import employeeService, { EmployeeModelNew } from "./employeeService";
import leaveService, { LeaveModel } from "./leaveService";
import salaryService, { SalaryModel } from "./salaryService";
import taskService, { TaskModel } from "./taskService";
import familyService from "./familyService";
import sponsorService from "./sponsorService";

export interface SponsorModel {
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  contact: string;
  employeeEmail: string;
}

export interface ReportData {
  employees: EmployeeModelNew[];
  leaves: LeaveModel[];
  salaries: SalaryModel[];
  tasks: TaskModel[];
  sponsors: SponsorModel[];
  familyMembers: FamilyMember[];
  generatedDate: string;
  totalActiveEmployees: number;
  totalPendingLeaves: number;
  totalApprovedLeaves: number;
  totalRejectedLeaves: number;
  totalPendingVerifications: number;
}

class ReportService {
  async generateEmployeeReport(): Promise<ReportData> {
    try {
      // Fetch core data
      const [employees, leaves] = await Promise.all([
        employeeService.getAllEmployees(),
        leaveService.getLeaveRequests(),
      ]);

      // Fetch detailed employee data using the correct endpoint
      const detailedEmployees: EmployeeModelNew[] = [];
      const salaries: SalaryModel[] = [];
      const tasks: TaskModel[] = [];
      const familyMembers: FamilyMember[] = [];
      const sponsors: SponsorModel[] = [];

      // Fetch detailed data for each employee
      for (const employee of employees) {
        try {
          // Get detailed employee data from the correct endpoint
          const detailedEmployee = await employeeService.getEmployee(
            employee.email,
          );
          detailedEmployees.push(detailedEmployee);

          // Fetch additional data with error handling
          try {
            const salary = await salaryService.getSalaryInfo(employee.email);
            if (salary) salaries.push(salary);
          } catch (error) {
            console.warn(
              `Failed to fetch salary for ${employee.email}:`,
              error,
            );
          }

          try {
            const employeeTasks = await taskService.getUserTasks(
              employee.email,
            );
            if (employeeTasks.length > 0) tasks.push(...employeeTasks);
          } catch (error) {
            console.warn(`Failed to fetch tasks for ${employee.email}:`, error);
          }

          try {
            const family = await familyService.getFamilyMembers(employee.email);
            if (family.length > 0) familyMembers.push(...family);
          } catch (error) {
            console.warn(
              `Failed to fetch family for ${employee.email}:`,
              error,
            );
          }

          try {
            const sponsor = await sponsorService.getSponsor(employee.email);
            if (sponsor) sponsors.push(sponsor);
          } catch (error) {
            console.warn(
              `Failed to fetch sponsor for ${employee.email}:`,
              error,
            );
          }
        } catch (error) {
          console.warn(
            `Failed to fetch detailed data for ${employee.email}:`,
            error,
          );
          // Fallback to basic employee data
          detailedEmployees.push({
            firstName: employee.name.split(" ")[0],
            surname: employee.name.split(" ").slice(1).join(" "),
            email: employee.email,
            mobile: employee.phone,
            position: employee.position,
            wing: employee.department,
            joinDate: employee.joinDate,
            status: employee.status,
            sickLeave: employee.sickLeave,
            casualLeave: employee.casualLeave,
            paidLeave: employee.paidLeave,
          });
        }
      }

      // Transform LeaveRequest[] to LeaveModel[] to match interface
      const transformedLeaves: LeaveModel[] = leaves.map((leave) => ({
        id: leave.id,
        name: leave.employeeName,
        email: leave.employeeEmail,
        type: leave.leaveType,
        reason: leave.reason,
        fromDate: leave.startDate,
        toDate: leave.endDate,
        status:
          leave.status === "pending"
            ? "Pending"
            : leave.status === "approved"
              ? "Approved"
              : "Rejected",
        noOfDays: leave.noOfDays,
        whatsapp: leave.whatsapp,
        emergencyContact: leave.emergencyContact,
        substituteName: leave.substituteName,
        substituteContact: leave.substituteContact,
        signature: leave.signature,
        designation: leave.designation,
        wing: leave.wing,
      }));

      return {
        employees: detailedEmployees,
        leaves: transformedLeaves,
        salaries,
        tasks,
        sponsors,
        familyMembers,
        generatedDate: new Date().toISOString(),
        totalActiveEmployees: detailedEmployees.filter(
          (e) => e.status === "active",
        ).length,
        totalPendingLeaves: transformedLeaves.filter(
          (l) => l.status === "Pending",
        ).length,
        totalApprovedLeaves: transformedLeaves.filter(
          (l) => l.status === "Approved",
        ).length,
        totalRejectedLeaves: transformedLeaves.filter(
          (l) => l.status === "Rejected",
        ).length,
        totalPendingVerifications: detailedEmployees.filter(
          (e) => e.status === "pending",
        ).length,
      };
    } catch (error: any) {
      console.error("Report generation failed:", error);
      throw new Error(
        "Failed to generate comprehensive report: " + error.message,
      );
    }
  }

  async exportToPDF(reportData: ReportData): Promise<void> {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      // Helper function to safely get value or return empty string
      const getValue = (value: any): string => {
        if (value === null || value === undefined || value === "") {
          return "";
        }
        return String(value);
      };

      // Add simple header function
      const addHeader = (pageNum: number, totalPages: number) => {
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, pageWidth, 30, "F");

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("HR Report", margin, 20);

        doc.setFontSize(9);
        doc.text(
          `Generated: ${new Date(reportData.generatedDate).toLocaleDateString()}`,
          pageWidth - 80,
          15,
        );
        doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 50, 25);

        doc.setTextColor(0, 0, 0);
      };

      let yPos = 45;

      // Simple Summary
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", margin, yPos);
      yPos += 15;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const summaryText = [
        `Total Employees: ${reportData.employees.length}`,

        `Total Leave Requests: ${reportData.leaves.length}`,
        `Pending Leaves: ${reportData.totalPendingLeaves}`,
      ];

      summaryText.forEach((text) => {
        doc.text(text, margin, yPos);
        yPos += 8;
      });
      yPos += 10;

      // Employee Details
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Employee Details", margin, yPos);
      yPos += 15;

      reportData.employees.forEach((employee, index) => {
        // Check if we need a new page
        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 45;
        }

        // Employee name header
        const fullName =
          getValue(
            `${employee.firstName || ""} ${employee.surname || ""}`,
          ).trim() || "Unknown Employee";
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${fullName}`, margin, yPos);
        yPos += 10;

        // Basic information in simple format
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        const basicInfo = [
          `Email: ${getValue(employee.email)}`,
          `Position: ${getValue(employee.position)}`,
          `Department: ${getValue(employee.wing)}`,
          `Join Date: ${getValue(employee.joinDate)}`,
          `Status: ${getValue(employee.status)}`,
        ].filter((info) => !info.endsWith(": "));

        basicInfo.forEach((info) => {
          doc.text(info, margin + 5, yPos);
          yPos += 6;
        });

        // Contact information (only if available)
        const contactInfo = [
          getValue(employee.mobile) && `Mobile: ${employee.mobile}`,
          getValue(employee.whatsapp) && `WhatsApp: ${employee.whatsapp}`,
          getValue(employee.presentAddress) &&
            `Address: ${employee.presentAddress}`,
        ].filter(Boolean);

        if (contactInfo.length > 0) {
          contactInfo.forEach((info) => {
            doc.text(info, margin + 5, yPos);
            yPos += 6;
          });
        }

        // Document information (only if available)
        const docInfo = [
          getValue(employee.passportNo) && `Passport: ${employee.passportNo}`,
          getValue(employee.emirateIdNo) &&
            `Emirates ID: ${employee.emirateIdNo}`,
          getValue(employee.visaNo) && `Visa: ${employee.visaNo}`,
        ].filter(Boolean);

        if (docInfo.length > 0) {
          docInfo.forEach((info) => {
            doc.text(info, margin + 5, yPos);
            yPos += 6;
          });
        }

        // Leave balance
        const leaveInfo = [
          `Casual Leave: ${employee.casualLeave || 0} days`,
          `Annual Leave: ${employee.paidLeave || 0} days`,
        ];

        leaveInfo.forEach((info) => {
          doc.text(info, margin + 5, yPos);
          yPos += 6;
        });

        // Emergency contact (only if available)
        if (
          getValue(employee.emergencyName) ||
          getValue(employee.emergencyPhone)
        ) {
          yPos += 3;
          doc.setFont("helvetica", "bold");
          doc.text("Emergency Contact:", margin + 5, yPos);
          yPos += 6;
          doc.setFont("helvetica", "normal");

          const emergencyInfo = [
            getValue(employee.emergencyName) &&
              `Name: ${employee.emergencyName}`,
            getValue(employee.emergencyPhone) &&
              `Phone: ${employee.emergencyPhone}`,
            getValue(employee.emergencyRelation) &&
              `Relation: ${employee.emergencyRelation}`,
          ].filter(Boolean);

          emergencyInfo.forEach((info) => {
            doc.text(info, margin + 10, yPos);
            yPos += 6;
          });
        }

        // Family information (only if available)
        if (
          getValue(employee.spouseName) ||
          (employee.childDetails && employee.childDetails.length > 0)
        ) {
          yPos += 3;
          doc.setFont("helvetica", "bold");
          doc.text("Family:", margin + 5, yPos);
          yPos += 6;
          doc.setFont("helvetica", "normal");

          if (getValue(employee.spouseName)) {
            doc.text(`Spouse: ${employee.spouseName}`, margin + 10, yPos);
            yPos += 6;
          }

          if (employee.childDetails && employee.childDetails.length > 0) {
            doc.text(
              `Children: ${employee.childDetails.length}`,
              margin + 10,
              yPos,
            );
            yPos += 6;
            employee.childDetails.forEach((child, childIndex) => {
              if (getValue(child.name)) {
                doc.text(
                  `${childIndex + 1}. ${child.name} (${getValue(child.gender)}, ${getValue(child.dob)})`,
                  margin + 15,
                  yPos,
                );
                yPos += 5;
              }
            });
          }
        }

        // Add separator
        yPos += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
      });

      // Add headers to all pages
      const totalPages = (doc as any).internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addHeader(i, totalPages);
      }

      // Save with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      doc.save(`embassy-hr-report-${timestamp}.pdf`);
    } catch (error: any) {
      console.error("PDF export failed:", error);
      throw new Error("Failed to export PDF: " + error.message);
    }
  }

  async printReport(reportData: ReportData): Promise<void> {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) throw new Error("Failed to open print window");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>HR Management Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            h2 { color: #666; margin-top: 30px; }
            .summary { background: #f5f5f5; padding: 15px; margin: 10px 0; }
            .employee { border-bottom: 1px solid #eee; padding: 10px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>HR Management Report</h1>
          <p><strong>Generated on:</strong> ${new Date(reportData.generatedDate).toLocaleDateString()}</p>
          
          <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Employees:</strong> ${reportData.employees.length}</p>
            <p><strong>Active Employees:</strong> ${reportData.employees.filter((e) => e.status === "active").length}</p>
            <p><strong>Total Sponsors:</strong> ${reportData.sponsors.length}</p>
            <p><strong>Total Leave Requests:</strong> ${reportData.leaves.length}</p>
            <p><strong>Pending Leave Requests:</strong> ${reportData.leaves.filter((l) => l.status === "Pending").length}</p>
          </div>
          
          <h2>Employee Details</h2>
          ${reportData.employees
            .map(
              (employee) => `
            <div class="employee">
              <h3>${`${employee.firstName || ""} ${employee.surname || ""}`.trim() || "Unknown"} (${employee.email})</h3>
              <p><strong>Position:</strong> ${employee.position}</p>
              <p><strong>Sponsor:</strong> ${employee.sponsor}</p>
              <p><strong>Status:</strong> ${employee.status}</p>
              <p><strong>Join Date:</strong> ${employee.joinDate}</p>
            </div>
          `,
            )
            .join("")}
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error: any) {
      throw new Error("Failed to print report");
    }
  }
}

export default new ReportService();
