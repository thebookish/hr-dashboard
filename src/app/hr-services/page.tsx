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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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

export default function HRServicesPage() {
  const { user } = useAuth();
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

  const handleSalaryUpdate = async (data: SalaryData) => {
    if (!selectedEmployee) return;
    setIsLoading(true);
    try {
      const updated = await salaryService.updateSalaryInfo(
        selectedEmployee,
        data,
      );
      setSalaryData(updated);
    } catch (error) {
      console.error("Failed to update salary:", error);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFamilyMember = async (data: FamilyMemberData) => {
    setIsLoading(true);
    try {
      const newMember = await familyService.addFamilyMember(data);
      setFamilyMembers((prev) => [...prev, newMember]);
    } catch (error) {
      console.error("Failed to add family member:", error);
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
    } catch (error) {
      console.error("Failed to update sponsor:", error);
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
    } catch (error) {
      console.error("Failed to create task:", error);
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

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Dubai Embassy HR Services
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
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
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
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
                  className="bg-white/90 border-white/30 text-gray-900 placeholder:text-gray-500 mt-2"
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
                className="bg-white text-blue-700 hover:bg-gray-100 font-semibold"
              >
                {isLoading ? "Loading..." : "Load Employee Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Summary */}
        {reportData && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white/20 rounded-lg">
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
                  <div className="text-sm text-muted-foreground">
                    Total Employees
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      reportData.leaves.filter((l) => l.status === "Approved")
                        .length
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Approved Leaves
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {reportData.sponsors.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Sponsors
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {reportData.tasks.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Tasks
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Generated on:{" "}
                {new Date(reportData.generatedDate).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services Tabs */}
        <Card className="bg-white shadow-lg border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-2 rounded-xl">
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
  onUpdate: (data: SalaryData) => void;
  isLoading: boolean;
  selectedEmployee: string;
}) {
  const [formData, setFormData] = useState({
    basic: salaryData?.basic || 0,
    hra: salaryData?.hra || 0,
    allowance: salaryData?.allowance || 0,
    deduction: salaryData?.deduction || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      email: selectedEmployee,
      ...formData,
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Salary Information</CardTitle>
        </CardHeader>
        <CardContent>
          {salaryData ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="basic">Basic Salary</Label>
                  <Input
                    id="basic"
                    type="number"
                    value={formData.basic}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        basic: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="hra">HRA</Label>
                  <Input
                    id="hra"
                    type="number"
                    value={formData.hra}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hra: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="allowance">Allowance</Label>
                  <Input
                    id="allowance"
                    type="number"
                    value={formData.allowance}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        allowance: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="deduction">Deduction</Label>
                  <Input
                    id="deduction"
                    type="number"
                    value={formData.deduction}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deduction: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">Total Salary:</span>
                <span className="text-2xl font-bold">
                  $
                  {(
                    formData.basic +
                    formData.hra +
                    formData.allowance -
                    formData.deduction
                  ).toLocaleString()}
                </span>
              </div>
              <Button type="submit" disabled={isLoading}>
                Update Salary
              </Button>
            </form>
          ) : (
            <p className="text-muted-foreground">
              Select an employee to view salary information.
            </p>
          )}
        </CardContent>
      </Card>

      {salaryData?.paymentHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {salaryData.paymentHistory.map((payment, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded"
                >
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
                  </div>
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    age: 0,
    contact: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMember({
      ...formData,
      employeeEmail: selectedEmployee,
    });
    setFormData({ name: "", relation: "", age: 0, contact: "" });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Family Members</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedEmployee}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="relation">Relation</Label>
                  <Select
                    value={formData.relation}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, relation: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        age: parseInt(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  Add Member
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
            <p className="text-muted-foreground">No family members found.</p>
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
    name: sponsorData?.name || "",
    industry: sponsorData?.industry || "",
    contactPerson: sponsorData?.contactPerson || "",
    phone: sponsorData?.phone || "",
    address: sponsorData?.address || "",
  });

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
        {sponsorData ? (
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
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              Update Sponsor
            </Button>
          </form>
        ) : (
          <p className="text-muted-foreground">
            Select an employee to view sponsor information.
          </p>
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
    title: "",
    deadline: "",
    priority: "Medium" as "High" | "Medium" | "Low",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      email: selectedEmployee,
    });
    setFormData({ title: "", deadline: "", priority: "Medium" });
    setIsDialogOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
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
            <p className="text-muted-foreground">No tasks found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
