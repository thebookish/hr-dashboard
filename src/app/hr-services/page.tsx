"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DollarSign,
  Users,
  Building,
  CheckSquare,
  Plus,
  Edit,
  Trash2,
  FileText,
  Download,
  Printer,
  ShieldX,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import notificationService from "@/services/notificationService";
import salaryService, {
  SalaryModel,
  SalaryData,
} from "@/services/salaryService";
import familyService, {
  FamilyMember,
  FamilyMemberData,
} from "@/services/familyService";
import sponsorService, {
  SponsorModel,
  SponsorData,
} from "@/services/sponsorService";
import taskService, { TaskModel, TaskData } from "@/services/taskService";
import reportService, { ReportData } from "@/services/reportService";

// Payment History Component
function PaymentHistoryCard({
  paymentHistory,
  onUpdate,
}: {
  paymentHistory: Array<{
    month: string;
    amount: number;
    status: "Paid" | "Pending";
  }>;
  onUpdate: (
    updatedHistory: Array<{
      month: string;
      amount: number;
      status: "Paid" | "Pending";
    }>,
  ) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableHistory, setEditableHistory] = useState(paymentHistory);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    month: "",
    amount: 0,
    status: "Pending" as "Paid" | "Pending",
  });

  const handleSave = () => {
    onUpdate(editableHistory);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableHistory(paymentHistory);
    setIsEditing(false);
  };

  const handleAddPayment = () => {
    if (newPayment.month && newPayment.amount > 0) {
      const updatedHistory = [...editableHistory, newPayment];
      setEditableHistory(updatedHistory);
      onUpdate(updatedHistory);
      setNewPayment({ month: "", amount: 0, status: "Pending" });
      setIsDialogOpen(false);
    }
  };

  const handleDeletePayment = (index: number) => {
    const updatedHistory = editableHistory.filter((_, i) => i !== index);
    setEditableHistory(updatedHistory);
    if (!isEditing) {
      onUpdate(updatedHistory);
    }
  };

  const updatePayment = (index: number, field: string, value: any) => {
    const updated = editableHistory.map((payment, i) =>
      i === index ? { ...payment, [field]: value } : payment,
    );
    setEditableHistory(updated);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment History</CardTitle>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment-month">Month</Label>
                  <Input
                    id="payment-month"
                    type="month"
                    value={newPayment.month}
                    onChange={(e) =>
                      setNewPayment((prev) => ({
                        ...prev,
                        month: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="payment-amount">Amount</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    min="0"
                    value={newPayment.amount}
                    onChange={(e) =>
                      setNewPayment((prev) => ({
                        ...prev,
                        amount: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="payment-status">Status</Label>
                  <Select
                    value={newPayment.status}
                    onValueChange={(value: "Paid" | "Pending") =>
                      setNewPayment((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddPayment} className="flex-1">
                    Add Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {editableHistory.map((payment, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded"
            >
              {isEditing ? (
                <>
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="month"
                      value={payment.month}
                      onChange={(e) =>
                        updatePayment(index, "month", e.target.value)
                      }
                      className="w-40"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={payment.amount}
                      onChange={(e) =>
                        updatePayment(
                          index,
                          "amount",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-32"
                    />
                    <Select
                      value={payment.status}
                      onValueChange={(value: "Paid" | "Pending") =>
                        updatePayment(index, "status", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePayment(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span>{payment.month}</span>
                  <div className="flex items-center gap-2">
                    <span>${payment.amount.toLocaleString()}</span>
                    <Badge
                      variant={
                        payment.status === "Paid" ? "default" : "secondary"
                      }
                    >
                      {payment.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePayment(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          {editableHistory.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              No payment history found. Click "Add Payment" to add records.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HRServicesPage() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState("salary");
  const [isLoading, setIsLoading] = useState(false);
  const [salaryData, setSalaryData] = useState<SalaryModel | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [sponsorData, setSponsorData] = useState<SponsorModel | null>(null);
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Salary Management Functions
  const handleSalarySearch = async () => {
    if (!selectedEmployee) return;
    setIsLoading(true);
    try {
      const data = await salaryService.getSalaryInfo(selectedEmployee);
      setSalaryData(data);
    } catch (error) {
      console.error("Failed to fetch salary data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalaryUpdate = async (data: any) => {
    if (!selectedEmployee) return;
    setIsLoading(true);
    try {
      const updated = await salaryService.addSalaryInfo(data);
      setSalaryData(updated);

      // Send notification like in Flutter code
      try {
        await notificationService.sendNotification({
          title: "New Salary Info Added",
          message: "Your salary details have been updated. Check now.",
          email: selectedEmployee,
          type: "info",
        });
      } catch (notifError) {
        console.warn("Failed to send notification:", notifError);
      }

      toast({
        title: "Success",
        description: "Salary information saved successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to save salary:", error);
      toast({
        title: "Error",
        description: "Failed to save salary information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Family Management Functions
  const handleFamilySearch = async () => {
    if (!selectedEmployee) return;
    setIsLoading(true);
    try {
      const data = await familyService.getFamilyMembers(selectedEmployee);
      setFamilyMembers(data);
    } catch (error) {
      console.error("Failed to fetch family data:", error);
      setFamilyMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFamilyMember = async (data: FamilyMemberData) => {
    setIsLoading(true);
    try {
      const newMember = await familyService.addFamilyMember(data);
      setFamilyMembers((prev) => [...prev, newMember]);
      toast({
        title: "Success",
        description: "Family member added successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to add family member:", error);
      toast({
        title: "Error",
        description: "Failed to add family member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sponsor Management Functions
  const handleSponsorSearch = async () => {
    if (!selectedEmployee) return;
    setIsLoading(true);
    try {
      const data = await sponsorService.getSponsor(selectedEmployee);
      setSponsorData(data);
    } catch (error) {
      console.error("Failed to fetch sponsor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSponsorUpdate = async (data: Partial<SponsorData>) => {
    if (!selectedEmployee) return;
    setIsLoading(true);
    try {
      const updated = await sponsorService.updateSponsor(
        selectedEmployee,
        data,
      );
      setSponsorData(updated);
      toast({
        title: "Success",
        description: "Sponsor information updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to update sponsor:", error);
      toast({
        title: "Error",
        description: "Failed to update sponsor information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Task Management Functions
  const handleTaskSearch = async () => {
    if (!selectedEmployee) return;
    setIsLoading(true);
    try {
      const data = await taskService.getUserTasks(selectedEmployee);
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (data: TaskData) => {
    setIsLoading(true);
    try {
      const newTask = await taskService.createTask(data);
      setTasks((prev) => [...prev, newTask]);
      toast({
        title: "Success",
        description: "Task created successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to create task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Report Management Functions
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const data = await reportService.generateEmployeeReport();
      setReportData(data);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData) return;
    try {
      await reportService.exportToPDF(reportData);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
  };

  const handlePrintReport = async () => {
    if (!reportData) return;
    try {
      await reportService.printReport(reportData);
    } catch (error) {
      console.error("Failed to print report:", error);
    }
  };

  if (!hasPermission("hrServices")) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center text-center p-8">
              <ShieldX className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have permission to access HR Services. Please contact
                your administrator for access.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 min-h-screen">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              Dubai Embassy HR Services
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
              Comprehensive management of salaries, family information,
              sponsors, and tasks.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isGeneratingReport ? "Generating..." : "Generate Report"}
            </Button>
            {reportData && (
              <>
                <Button onClick={handleExportPDF} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={handlePrintReport} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Employee Selection */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white border-blue-300 dark:border-blue-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-2 bg-white/20 dark:bg-white/30 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              Select Employee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label
                  htmlFor="employee-email"
                  className="text-white font-semibold"
                >
                  Employee Email
                </Label>
                <Input
                  id="employee-email"
                  placeholder="Enter employee email..."
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="bg-white/90 dark:bg-white/95 border-white/30 dark:border-white/40 text-gray-900 placeholder:text-gray-500 mt-2"
                />
              </div>
              <Button
                onClick={() => {
                  handleSalarySearch();
                  handleFamilySearch();
                  handleSponsorSearch();
                  handleTaskSearch();
                }}
                disabled={!selectedEmployee || isLoading}
                variant="secondary"
                className="bg-white dark:bg-gray-100 text-blue-700 hover:bg-gray-100 dark:hover:bg-gray-200 font-semibold"
              >
                {isLoading ? "Loading..." : "Load Employee Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Summary */}
        {reportData && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white/20 dark:bg-white/30 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                Dubai Embassy Report Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {reportData.employees.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Employees
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {
                      reportData.leaves.filter((l) => l.status === "Approved")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Approved Leaves
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {reportData.sponsors.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Active Sponsors
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {reportData.tasks.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Tasks
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Generated on:{" "}
                {new Date(reportData.generatedDate).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services Tabs */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-700">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-50 dark:bg-gray-700 p-2 rounded-xl">
              <TabsTrigger
                value="salary"
                className="flex items-center gap-2 font-semibold"
              >
                <DollarSign className="h-4 w-4" />
                Salary Management
              </TabsTrigger>
              <TabsTrigger
                value="family"
                className="flex items-center gap-2 font-semibold"
              >
                <Users className="h-4 w-4" />
                Family Records
              </TabsTrigger>
              <TabsTrigger
                value="sponsor"
                className="flex items-center gap-2 font-semibold"
              >
                <Building className="h-4 w-4" />
                Sponsor Details
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="flex items-center gap-2 font-semibold"
              >
                <CheckSquare className="h-4 w-4" />
                Task Management
              </TabsTrigger>
            </TabsList>

            {/* Salary Management */}
            <TabsContent value="salary" className="space-y-4">
              <SalaryManagement
                salaryData={salaryData}
                onUpdate={handleSalaryUpdate}
                isLoading={isLoading}
                selectedEmployee={selectedEmployee}
              />
            </TabsContent>

            {/* Family Management */}
            <TabsContent value="family" className="space-y-4">
              <FamilyManagement
                familyMembers={familyMembers}
                onAddMember={handleAddFamilyMember}
                isLoading={isLoading}
                selectedEmployee={selectedEmployee}
              />
            </TabsContent>

            {/* Sponsor Management */}
            <TabsContent value="sponsor" className="space-y-4">
              <SponsorManagement
                sponsorData={sponsorData}
                onUpdate={handleSponsorUpdate}
                isLoading={isLoading}
                selectedEmployee={selectedEmployee}
              />
            </TabsContent>

            {/* Task Management */}
            <TabsContent value="tasks" className="space-y-4">
              <TaskManagement
                tasks={tasks}
                onCreate={handleCreateTask}
                isLoading={isLoading}
                selectedEmployee={selectedEmployee}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Salary Management Component
function SalaryManagement({
  salaryData,
  onUpdate,
  isLoading,
  selectedEmployee,
}: {
  salaryData: SalaryModel | null;
  onUpdate: (data: any) => void;
  isLoading: boolean;
  selectedEmployee: string;
}) {
  const [formData, setFormData] = useState({
    email: selectedEmployee,
    basic: 0,
    hra: 0,
    allowance: 0,
    deduction: 0,
    // Payment History fields
    month: "",
    amount: 0,
    paymentStatus: "Paid" as "Paid" | "Pending",
    // Upcoming Increment fields
    incrementDate: "",
    newSalary: 0,
  });

  // Update form data when salary data changes
  React.useEffect(() => {
    if (salaryData) {
      setFormData({
        email: salaryData.email || selectedEmployee,
        basic: salaryData.basic || 0,
        hra: salaryData.hra || 0,
        allowance: salaryData.allowance || 0,
        deduction: salaryData.deduction || 0,
        // Load first payment history if exists
        month: salaryData.paymentHistory?.[0]?.month || "",
        amount: salaryData.paymentHistory?.[0]?.amount || 0,
        paymentStatus: salaryData.paymentHistory?.[0]?.status || "Paid",
        // Load first upcoming increment if exists
        incrementDate: salaryData.upcomingIncrements?.[0]?.effectiveDate || "",
        newSalary: salaryData.upcomingIncrements?.[0]?.newSalary || 0,
      });
    } else {
      setFormData({
        email: selectedEmployee,
        basic: 0,
        hra: 0,
        allowance: 0,
        deduction: 0,
        month: "",
        amount: 0,
        paymentStatus: "Paid",
        incrementDate: "",
        newSalary: 0,
      });
    }
  }, [salaryData, selectedEmployee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create salary data structure matching Flutter code
    const salaryData = {
      email: formData.email,
      basic: formData.basic,
      hra: formData.hra,
      allowance: formData.allowance,
      deduction: formData.deduction,
      paymentHistory:
        formData.month && formData.amount > 0
          ? [
              {
                month: formData.month,
                amount: formData.amount,
                status: formData.paymentStatus,
              },
            ]
          : [],
      upcomingIncrements:
        formData.incrementDate && formData.newSalary > 0
          ? [
              {
                effectiveDate: formData.incrementDate,
                newSalary: formData.newSalary,
              },
            ]
          : [],
    };

    onUpdate(salaryData);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Salary Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Salary Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Basic Salary Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Employee Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    placeholder="Employee email (read-only)"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="basic">Basic Salary</Label>
                  <Input
                    id="basic"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basic}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        basic: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter basic salary"
                  />
                </div>
                <div>
                  <Label htmlFor="hra">HRA (House Rent Allowance)</Label>
                  <Input
                    id="hra"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hra}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hra: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter HRA amount"
                  />
                </div>
                <div>
                  <Label htmlFor="allowance">Other Allowances</Label>
                  <Input
                    id="allowance"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.allowance}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        allowance: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter other allowances"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="deduction">Total Deductions</Label>
                  <Input
                    id="deduction"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.deduction}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deduction: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter total deductions"
                  />
                </div>
              </div>
            </div>

            {/* Payment History Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Payment History
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="month">Month (e.g. May 2025)</Label>
                  <Input
                    id="month"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        month: e.target.value,
                      }))
                    }
                    placeholder="Enter month"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentStatus">Status</Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value: "Paid" | "Pending") =>
                      setFormData((prev) => ({ ...prev, paymentStatus: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Upcoming Increment Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Upcoming Increment
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incrementDate">
                    Effective Date (e.g. 2025-08-01)
                  </Label>
                  <Input
                    id="incrementDate"
                    type="date"
                    value={formData.incrementDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        incrementDate: e.target.value,
                      }))
                    }
                    placeholder="Select effective date"
                  />
                </div>
                <div>
                  <Label htmlFor="newSalary">New Salary</Label>
                  <Input
                    id="newSalary"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.newSalary}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newSalary: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter new salary"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <span className="font-semibold text-blue-800 dark:text-blue-300">
                Net Salary:
              </span>
              <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                $
                {(
                  formData.basic +
                  formData.hra +
                  formData.allowance -
                  formData.deduction
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading || !formData.email.trim()}
                className="flex-1"
              >
                {isLoading ? "Saving..." : "Save Salary"}
              </Button>
              {salaryData && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      email: selectedEmployee,
                      basic: 0,
                      hra: 0,
                      allowance: 0,
                      deduction: 0,
                      month: "",
                      amount: 0,
                      paymentStatus: "Paid",
                      incrementDate: "",
                      newSalary: 0,
                    });
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {salaryData?.paymentHistory && salaryData.paymentHistory.length > 0 && (
        <PaymentHistoryCard
          paymentHistory={salaryData.paymentHistory}
          onUpdate={(updatedHistory) => {
            // Update the salary data with new payment history
            const updatedSalaryData = salaryData
              ? { ...salaryData, paymentHistory: updatedHistory }
              : null;
            if (updatedSalaryData) {
              onUpdate(updatedSalaryData);
            }
          }}
        />
      )}

      {salaryData?.upcomingIncrements &&
        salaryData.upcomingIncrements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Salary Increments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {salaryData.upcomingIncrements.map((increment, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Effective Date:{" "}
                      {new Date(increment.effectiveDate).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      New Salary: ${increment.newSalary.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

// Family Management Component
function FamilyManagement({
  familyMembers,
  onAddMember,
  isLoading,
  selectedEmployee,
}: {
  familyMembers: FamilyMember[];
  onAddMember: (data: FamilyMemberData) => void;
  isLoading: boolean;
  selectedEmployee: string;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Family Members</CardTitle>
        </CardHeader>
        <CardContent>
          {familyMembers.length > 0 ? (
            <div className="space-y-3">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.relation} • Age {member.age}
                      </p>
                      {member.contact && (
                        <p className="text-sm text-muted-foreground">
                          {member.contact}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No family members found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Sponsor Management Component
function SponsorManagement({
  sponsorData,
  onUpdate,
  isLoading,
  selectedEmployee,
}: {
  sponsorData: SponsorModel | null;
  onUpdate: (data: Partial<SponsorData>) => void;
  isLoading: boolean;
  selectedEmployee: string;
}) {
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    contactPerson: "",
    phone: "",
    address: "",
  });

  // Update form data when sponsor data changes
  React.useEffect(() => {
    if (sponsorData) {
      setFormData({
        name: sponsorData.name || "",
        industry: sponsorData.industry || "",
        contactPerson: sponsorData.contactPerson || "",
        phone: sponsorData.phone || "",
        address: sponsorData.address || "",
      });
    } else {
      setFormData({
        name: "",
        industry: "",
        contactPerson: "",
        phone: "",
        address: "",
      });
    }
  }, [sponsorData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sponsor Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sponsor-name">Company Name</Label>
              <Input
                id="sponsor-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    industry: e.target.value,
                  }))
                }
                placeholder="Enter industry"
              />
            </div>
            <div>
              <Label htmlFor="contact-person">Contact Person</Label>
              <Input
                id="contact-person"
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactPerson: e.target.value,
                  }))
                }
                placeholder="Enter contact person name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Enter company address"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading || !selectedEmployee}>
              {isLoading
                ? "Updating..."
                : sponsorData
                  ? "Update Sponsor"
                  : "Add Sponsor"}
            </Button>
            {sponsorData && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: "",
                    industry: "",
                    contactPerson: "",
                    phone: "",
                    address: "",
                  });
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
        {!selectedEmployee && (
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Select an employee to view or manage sponsor information.
          </p>
        )}
        {sponsorData && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              Current Sponsor Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <strong>Company:</strong> {sponsorData.name}
              </div>
              <div>
                <strong>Industry:</strong> {sponsorData.industry}
              </div>
              <div>
                <strong>Contact:</strong> {sponsorData.contactPerson}
              </div>
              <div>
                <strong>Phone:</strong> {sponsorData.phone}
              </div>
              <div className="col-span-2">
                <strong>Address:</strong> {sponsorData.address}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Task Management Component
function TaskManagement({
  tasks,
  onCreate,
  isLoading,
  selectedEmployee,
}: {
  tasks: TaskModel[];
  onCreate: (data: TaskData) => void;
  isLoading: boolean;
  selectedEmployee: string;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    deadline: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    status: "Pending" as "Pending" | "In Progress" | "Completed",
    isCompleted: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    onCreate({
      id: taskId,
      title: formData.title,
      deadline: formData.deadline,
      priority: formData.priority,
      status: formData.status,
      isCompleted: formData.isCompleted,
      email: selectedEmployee,
    });
    setFormData({
      id: "",
      title: "",
      deadline: "",
      priority: "Medium",
      status: "Pending",
      isCompleted: false,
    });
    setIsDialogOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "Medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "Low":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "In Progress":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "Pending":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tasks</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedEmployee}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deadline: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "High" | "Medium" | "Low") =>
                      setFormData((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(
                      value: "Pending" | "In Progress" | "Completed",
                    ) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: value,
                        isCompleted: value === "Completed",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isLoading}>
                  Create Task
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Deadline: {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No tasks found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
