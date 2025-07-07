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
}

class ReportService {
  async generateEmployeeReport(): Promise<ReportData> {
    try {
      // Fetch core data
      const [employees, leaves] = await Promise.all([
        employeeService.getAllEmployees(),
        leaveService.getLeaveRequests(),
      ]);

      // Initialize arrays for additional data
      const salaries: SalaryModel[] = [];
      const tasks: TaskModel[] = [];
      const familyMembers: FamilyMember[] = [];
      const sponsors: SponsorModel[] = [];

      // Fetch additional data for each employee with proper error handling
      const employeePromises = employees.map(async (employee) => {
        const employeeData = {
          salary: null as SalaryModel | null,
          tasks: [] as TaskModel[],
          family: [] as FamilyMember[],
          sponsor: null as SponsorModel | null,
        };

        try {
          employeeData.salary = await salaryService.getSalaryInfo(
            employee.email,
          );
        } catch (error) {
          console.warn(`Failed to fetch salary for ${employee.email}:`, error);
        }

        try {
          employeeData.tasks = await taskService.getUserTasks(employee.email);
        } catch (error) {
          console.warn(`Failed to fetch tasks for ${employee.email}:`, error);
        }

        try {
          employeeData.family = await familyService.getFamilyMembers(
            employee.email,
          );
        } catch (error) {
          console.warn(`Failed to fetch family for ${employee.email}:`, error);
        }

        try {
          employeeData.sponsor = await sponsorService.getSponsor(
            employee.email,
          );
        } catch (error) {
          console.warn(`Failed to fetch sponsor for ${employee.email}:`, error);
        }

        return employeeData;
      });

      // Wait for all employee data to be fetched
      const employeeDataResults = await Promise.allSettled(employeePromises);

      // Process results and aggregate data
      employeeDataResults.forEach((result) => {
        if (result.status === "fulfilled") {
          const data = result.value;
          if (data.salary) salaries.push(data.salary);
          if (data.tasks.length > 0) tasks.push(...data.tasks);
          if (data.family.length > 0) familyMembers.push(...data.family);
          if (data.sponsor) sponsors.push(data.sponsor);
        }
      });

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
        employees,
        leaves: transformedLeaves,
        salaries,
        tasks,
        sponsors,
        familyMembers,
        generatedDate: new Date().toISOString(),
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
      const margin = 20;

      // Header with Dubai Embassy branding
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Dubai Embassy HR Report", margin, 25);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on: ${new Date(reportData.generatedDate).toLocaleString(
          "en-AE",
          {
            timeZone: "Asia/Dubai",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          },
        )} (Dubai Time)`,
        margin,
        40,
      );

      // Executive Summary
      let yPos = 60;
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Summary", margin, yPos);
      yPos += 15;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const summaryData = [
        `Total Employees: ${reportData.employees.length}`,
        `Active Employees: ${reportData.employees.filter((e) => e.status === "active").length}`,
        `Pending Verifications: ${reportData.employees.filter((e) => e.status === "pending").length}`,
        `Total Leave Requests: ${reportData.leaves.length}`,
        `Pending Leave Requests: ${reportData.leaves.filter((l) => l.status === "Pending").length}`,
        `Approved Leave Requests: ${reportData.leaves.filter((l) => l.status === "Approved").length}`,
        `Active Sponsors: ${reportData.sponsors.length}`,
        `Total Tasks: ${reportData.tasks.length}`,
        `Family Members Registered: ${reportData.familyMembers.length}`,
      ];

      summaryData.forEach((item) => {
        doc.text(`• ${item}`, margin + 5, yPos);
        yPos += 8;
      });

      // Employee Details Section
      yPos += 15;
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Employee Details", margin, yPos);
      yPos += 15;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      reportData.employees.forEach((employee, index) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 30;
        }

        doc.setFont("helvetica", "bold");
        const fullName =
          `${employee.firstName || ""} ${employee.surname || ""}`.trim() ||
          "Unknown";
        doc.text(`${index + 1}. ${fullName}`, margin, yPos);
        yPos += 6;

        doc.setFont("helvetica", "normal");
        doc.text(`Email: ${employee.email}`, margin + 10, yPos);
        yPos += 5;
        doc.text(
          `Position: ${employee.position} | Status: ${employee.status}`,
          margin + 10,
          yPos,
        );
        yPos += 5;
        doc.text(
          `Join Date: ${employee.joinDate} | Wing: ${employee.wing}`,
          margin + 10,
          yPos,
        );
        yPos += 5;
        doc.text(
          `Phone: ${employee.mobile} | Sponsor: ${employee.sponsor}`,
          margin + 10,
          yPos,
        );
        yPos += 10;
      });

      // Footer
      const pageCount = (doc as any).internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Dubai Embassy HR Management System - Page ${i} of ${pageCount}`,
          margin,
          doc.internal.pageSize.height - 10,
        );
      }

      // Save with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      doc.save(`dubai-embassy-hr-report-${timestamp}.pdf`);
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
