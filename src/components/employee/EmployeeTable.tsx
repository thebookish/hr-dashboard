"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Search,
  UserCheck,
  UserX,
  Edit,
  Eye,
  User,
  Download,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import employeeService, {
  Employee,
  EmployeeModelNew,
  ChildInfo,
} from "@/services/employeeService";
import verificationService from "@/services/verificationService";

interface EmployeeTableProps {
  employees?: Employee[];
  onEmployeeSelect?: (employee: Employee) => void;
  onEmployeeUpdate?: (employee: Employee) => void;
}

const EmployeeTable = ({
  employees: propEmployees,
  onEmployeeSelect,
  onEmployeeUpdate,
}: EmployeeTableProps) => {
  const [employees, setEmployees] = useState<Employee[]>(propEmployees || []);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(!propEmployees);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propEmployees) {
      fetchEmployees();
    } else {
      setFilteredEmployees(propEmployees);
    }
  }, [propEmployees]);

  useEffect(() => {
    filterEmployees();
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
      setFilteredEmployees(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch employees:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredEmployees(filtered);
  };

  const handleVerifyEmployee = async (employee: Employee) => {
    try {
      await employeeService.verifyEmployee(employee.email);

      toast({
        title: "Success",
        description: `Employee ${employee.name} has been approved successfully`,
        variant: "default",
      });
    } catch (err: any) {
      console.error("Failed to verify employee:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to approve employee",
        variant: "destructive",
      });
    }
  };

  const handleDeclineEmployee = async (employee: Employee) => {
    try {
      await employeeService.declineEmployee(employee.email);

      toast({
        title: "Success",
        description: `Employee ${employee.name} has been declined`,
        variant: "default",
      });
    } catch (err: any) {
      console.error("Failed to decline employee:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to decline employee",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      inactive: "secondary",
      pending: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-background">
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-background">
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Failed to load employees: {error}
            </p>
            <Button onClick={fetchEmployees}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <CardTitle className="flex items-center justify-between text-gray-800 dark:text-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
              <Search className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>
            Employee Management
          </div>
          <Badge
            variant="secondary"
            className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500"
          >
            {filteredEmployees.length} employees
          </Badge>
        </CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search employees by name, email, department, or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 gap-4"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {employee.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {employee.email}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {employee.position} • {employee.department}
                      </span>
                      {getStatusBadge(employee.status)}
                      {!employee.verified && (
                        <Badge variant="destructive">Unverified</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mx-4">
                      <DialogHeader>
                        <DialogTitle>
                          Edit Employee: {employee.name}
                        </DialogTitle>
                      </DialogHeader>
                      <EmployeeEditForm
                        employee={employee}
                        onUpdate={onEmployeeUpdate}
                      />
                    </DialogContent>
                  </Dialog>
                  {!employee.verified && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleVerifyEmployee(employee)}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeclineEmployee(employee)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No employees found matching your search."
                  : "No employees found."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Employee Edit Form Component
function EmployeeEditForm({
  employee,
  onUpdate,
}: {
  employee: Employee;
  onUpdate?: (employee: Employee) => void;
}) {
  const [formData, setFormData] = useState<EmployeeModelNew>({
    firstName: employee.name.split(" ")[0] || "",
    surname: employee.name.split(" ").slice(1).join(" ") || "",
    email: employee.email,
    mobile: employee.phone || "",
    position: employee.position || "",
    wing: employee.department || "",
    status: employee.status || "active",
    dob: "",
    gender: "",
    maritalStatus: "",
    presentAddress: "",
    permanentAddress: "",
    passportNo: "",
    emirateIdNo: "",
    eidIssue: "",
    eidExpiry: "",
    passportIssue: "",
    passportExpiry: "",
    visaNo: "",
    visaExpiry: "",
    visaType: "",
    sponsor: "",
    homeLocal: "",
    joinDate: employee.joinDate || "",
    retireDate: "",
    landPhone: "",
    altMobile: "",
    botim: "",
    whatsapp: "",
    emergency: "",
    bank: "",
    accountNo: "",
    accountName: "",
    iban: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    emergencyEmail: "",
    emergencyBotim: "",
    emergencyWhatsapp: "",
    spouseName: "",
    childDetails: [],
    sickLeave: employee.sickLeave || 0,
    casualLeave: employee.casualLeave || 0,
    paidLeave: employee.paidLeave || 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Load existing employee data on mount
  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        const employeeData = await employeeService.getEmployee(employee.email);
        setFormData(employeeData);
      } catch (error) {
        console.error("Failed to load employee data:", error);
      }
    };
    loadEmployeeData();
  }, [employee.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await employeeService.updateEmployee(employee.email, formData);

      const updatedEmployee = {
        ...employee,
        name: `${formData.firstName} ${formData.surname}`.trim(),
        phone: formData.mobile || "",
        department: formData.wing || "",
        position: formData.position || "",
        status: formData.status as "active" | "inactive" | "pending",
        joinDate: formData.joinDate || "",
        sickLeave: formData.sickLeave || 0,
        casualLeave: formData.casualLeave || 0,
        paidLeave: formData.paidLeave || 0,
      };

      if (onUpdate) {
        onUpdate(updatedEmployee);
      }

      toast({
        title: "Success",
        description: "Employee information updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to update employee:", error);
      toast({
        title: "Error",
        description: "Failed to update employee information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof EmployeeModelNew, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addChild = () => {
    const newChild = {
      name: "",
      gender: "",
      dob: "",
      schoolingYear: "",
      school: "",
    };
    setFormData((prev) => ({
      ...prev,
      childDetails: [...(prev.childDetails || []), newChild],
    }));
  };

  const removeChild = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      childDetails: prev.childDetails?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateChild = (
    index: number,
    field: keyof ChildInfo,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      childDetails:
        prev.childDetails?.map((child, i) =>
          i === index ? { ...child, [field]: value } : child,
        ) || [],
    }));
  };

  const getDocumentUrl = (filePath?: string): string | undefined => {
    if (!filePath) return undefined;
    const BASE_URL =
      "https://hrms-hgdtc3e2chcbb8h0.southeastasia-01.azurewebsites.net";
    // If the filePath already contains the full URL, return as is
    if (filePath.startsWith("http")) return filePath;
    // Otherwise, prepend the base URL
    return `${BASE_URL}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const handleViewDocument = async (documentUrl: string) => {
    try {
      // Open document in new tab
      window.open(documentUrl, "_blank");

      toast({
        title: "Document Opened",
        description: "Document opened in new tab",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to view document:", error);
      toast({
        title: "View Failed",
        description: "Failed to open the document",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocument = async (
    documentUrl: string,
    fileName: string,
  ) => {
    try {
      // Create download link
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
    } catch (error) {
      console.error("Failed to download document:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the document",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="job">Job Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName || ""}
                onChange={(e) => updateFormData("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                value={formData.surname || ""}
                onChange={(e) => updateFormData("surname", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob || ""}
                onChange={(e) => updateFormData("dob", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(value) => updateFormData("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select
                value={formData.maritalStatus || ""}
                onValueChange={(value) =>
                  updateFormData("maritalStatus", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sponsor">Sponsor</Label>
              <Input
                id="sponsor"
                value={formData.sponsor || ""}
                onChange={(e) => updateFormData("sponsor", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="presentAddress">Present Address</Label>
              <Textarea
                id="presentAddress"
                value={formData.presentAddress || ""}
                onChange={(e) =>
                  updateFormData("presentAddress", e.target.value)
                }
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="permanentAddress">Permanent Address</Label>
              <Textarea
                id="permanentAddress"
                value={formData.permanentAddress || ""}
                onChange={(e) =>
                  updateFormData("permanentAddress", e.target.value)
                }
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="job" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position || ""}
                onChange={(e) => updateFormData("position", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="wing">Department/Wing</Label>
              <Input
                id="wing"
                value={formData.wing || ""}
                onChange={(e) => updateFormData("wing", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="homeLocal">Home/Local</Label>
              <Input
                id="homeLocal"
                value={formData.homeLocal || ""}
                onChange={(e) => updateFormData("homeLocal", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate || ""}
                onChange={(e) => updateFormData("joinDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="retireDate">Retire Date</Label>
              <Input
                id="retireDate"
                type="date"
                value={formData.retireDate || ""}
                onChange={(e) => updateFormData("retireDate", e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => updateFormData("email", e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={formData.mobile || ""}
                onChange={(e) => updateFormData("mobile", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="landPhone">Land Phone</Label>
              <Input
                id="landPhone"
                value={formData.landPhone || ""}
                onChange={(e) => updateFormData("landPhone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="altMobile">Alternative Mobile</Label>
              <Input
                id="altMobile"
                value={formData.altMobile || ""}
                onChange={(e) => updateFormData("altMobile", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp || ""}
                onChange={(e) => updateFormData("whatsapp", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="botim">Botim</Label>
              <Input
                id="botim"
                value={formData.botim || ""}
                onChange={(e) => updateFormData("botim", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Emergency Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyName || ""}
                  onChange={(e) =>
                    updateFormData("emergencyName", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="emergencyRelation">Relationship</Label>
                <Input
                  id="emergencyRelation"
                  value={formData.emergencyRelation || ""}
                  onChange={(e) =>
                    updateFormData("emergencyRelation", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone || ""}
                  onChange={(e) =>
                    updateFormData("emergencyPhone", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="emergencyEmail">Emergency Email</Label>
                <Input
                  id="emergencyEmail"
                  type="email"
                  value={formData.emergencyEmail || ""}
                  onChange={(e) =>
                    updateFormData("emergencyEmail", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Banking Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank">Bank</Label>
                <Input
                  id="bank"
                  value={formData.bank || ""}
                  onChange={(e) => updateFormData("bank", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="accountNo">Account Number</Label>
                <Input
                  id="accountNo"
                  value={formData.accountNo || ""}
                  onChange={(e) => updateFormData("accountNo", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={formData.accountName || ""}
                  onChange={(e) =>
                    updateFormData("accountName", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban || ""}
                  onChange={(e) => updateFormData("iban", e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passportNo">Passport Number</Label>
              <Input
                id="passportNo"
                value={formData.passportNo || ""}
                onChange={(e) => updateFormData("passportNo", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="passportIssue">Passport Issue Date</Label>
              <Input
                id="passportIssue"
                type="date"
                value={formData.passportIssue || ""}
                onChange={(e) =>
                  updateFormData("passportIssue", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="passportExpiry">Passport Expiry Date</Label>
              <Input
                id="passportExpiry"
                type="date"
                value={formData.passportExpiry || ""}
                onChange={(e) =>
                  updateFormData("passportExpiry", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="emirateIdNo">Emirates ID Number</Label>
              <Input
                id="emirateIdNo"
                value={formData.emirateIdNo || ""}
                onChange={(e) => updateFormData("emirateIdNo", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="eidIssue">Emirates ID Issue Date</Label>
              <Input
                id="eidIssue"
                type="date"
                value={formData.eidIssue || ""}
                onChange={(e) => updateFormData("eidIssue", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="eidExpiry">Emirates ID Expiry Date</Label>
              <Input
                id="eidExpiry"
                type="date"
                value={formData.eidExpiry || ""}
                onChange={(e) => updateFormData("eidExpiry", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visaNo">Visa Number</Label>
              <Input
                id="visaNo"
                value={formData.visaNo || ""}
                onChange={(e) => updateFormData("visaNo", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visaType">Visa Type</Label>
              <Input
                id="visaType"
                value={formData.visaType || ""}
                onChange={(e) => updateFormData("visaType", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visaExpiry">Visa Expiry Date</Label>
              <Input
                id="visaExpiry"
                type="date"
                value={formData.visaExpiry || ""}
                onChange={(e) => updateFormData("visaExpiry", e.target.value)}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  key: "passport",
                  label: "Passport",
                  value: formData.passport
                    ? getDocumentUrl(formData.passport)
                    : undefined,
                },
                {
                  key: "eid",
                  label: "Emirates ID",
                  value: formData.eid
                    ? getDocumentUrl(formData.eid)
                    : undefined,
                },
                {
                  key: "visa",
                  label: "Visa",
                  value: formData.visa
                    ? getDocumentUrl(formData.visa)
                    : undefined,
                },
                {
                  key: "cv",
                  label: "CV/Resume",
                  value: formData.cv ? getDocumentUrl(formData.cv) : undefined,
                },
                {
                  key: "cert",
                  label: "Certificates",
                  value: formData.cert
                    ? getDocumentUrl(formData.cert)
                    : undefined,
                },
                {
                  key: "ref",
                  label: "References",
                  value: formData.ref
                    ? getDocumentUrl(formData.ref)
                    : undefined,
                },
                {
                  key: "photo",
                  label: "Photo",
                  value: formData.photo
                    ? getDocumentUrl(formData.photo)
                    : undefined,
                },
              ].map((doc) => (
                <div
                  key={doc.key}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-sm">{doc.label}</span>
                    </div>
                    {doc.value ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(doc.value!)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDownloadDocument(
                              doc.value!,
                              `${doc.label}_${employee.name}`,
                            )
                          }
                          className="text-green-600 hover:text-green-700"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Not uploaded
                      </span>
                    )}
                  </div>
                  {doc.value && (
                    <div className="mt-2">
                      <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                        Available
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="family" className="space-y-4">
          <div>
            <Label htmlFor="spouseName">Spouse Name</Label>
            <Input
              id="spouseName"
              value={formData.spouseName || ""}
              onChange={(e) => updateFormData("spouseName", e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">Children Details</h4>
              <Button type="button" onClick={addChild} variant="outline">
                Add Child
              </Button>
            </div>
            {formData.childDetails?.map((child, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 rounded-lg space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h5 className="font-medium">Child {index + 1}</h5>
                  <Button
                    type="button"
                    onClick={() => removeChild(index)}
                    variant="destructive"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={child.name}
                      onChange={(e) =>
                        updateChild(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select
                      value={child.gender}
                      onValueChange={(value) =>
                        updateChild(index, "gender", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={child.dob}
                      onChange={(e) =>
                        updateChild(index, "dob", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Schooling Year</Label>
                    <Input
                      value={child.schoolingYear}
                      onChange={(e) =>
                        updateChild(index, "schoolingYear", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>School</Label>
                    <Input
                      value={child.school}
                      onChange={(e) =>
                        updateChild(index, "school", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="casualLeave">Casual Leave</Label>
              <Input
                id="casualLeave"
                type="number"
                min="0"
                value={formData.casualLeave || 0}
                onChange={(e) =>
                  updateFormData("casualLeave", parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <Label htmlFor="paidLeave">Annual Leave</Label>
              <Input
                id="paidLeave"
                type="number"
                min="0"
                value={formData.paidLeave || 0}
                onChange={(e) =>
                  updateFormData("paidLeave", parseInt(e.target.value) || 0)
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Employee"}
        </Button>
      </div>
    </form>
  );
}

export default EmployeeTable;
