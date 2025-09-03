"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Eye,
  Download,
  FileText,
  User,
  Calendar,
  Phone,
  MapPin,
  Briefcase,
  Search,
} from "lucide-react";
import verificationService, {
  VerificationRequest,
  VerificationDecision,
} from "@/services/verificationService";
import employeeService from "@/services/employeeService";

interface VerificationRequestsProps {
  requests?: VerificationRequest[];
  onRequestUpdate?: (request: VerificationRequest) => void;
}

const VerificationRequests = ({
  requests: propRequests,
  onRequestUpdate,
}: VerificationRequestsProps) => {
  const [requests, setRequests] = useState<VerificationRequest[]>(
    propRequests || [],
  );
  const [filteredRequests, setFilteredRequests] = useState<
    VerificationRequest[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(!propRequests);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propRequests) {
      fetchVerificationRequests();
    } else {
      setFilteredRequests(propRequests);
    }
  }, [propRequests]);

  useEffect(() => {
    filterRequests();
  }, [searchQuery, requests]);

  const fetchVerificationRequests = async () => {
    try {
      setIsLoading(true);
      const data = await verificationService.getVerificationRequests();
      setRequests(data);
      setFilteredRequests(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch verification requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    if (!searchQuery.trim()) {
      setFilteredRequests(requests);
      return;
    }

    const filtered = requests.filter(
      (request) =>
        request.employeeName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        request.employeeEmail
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        request.personalInfo.position
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
    setFilteredRequests(filtered);
  };

  const handleApproveVerification = async (request: VerificationRequest) => {
    try {
      await employeeService.verifyEmployee(request.employeeEmail);

      const updatedRequests = requests.map((req) =>
        req.id === request.id
          ? {
              ...req,
              status: "approved" as const,
              reviewedDate: new Date().toISOString(),
            }
          : req,
      );
      setRequests(updatedRequests);

      if (onRequestUpdate) {
        onRequestUpdate({ ...request, status: "approved" });
      }
    } catch (err: any) {
      console.error("Failed to approve verification:", err);
    }
  };

  const handleRejectVerification = async (request: VerificationRequest) => {
    try {
      await employeeService.declineEmployee(request.employeeEmail);

      const updatedRequests = requests.map((req) =>
        req.id === request.id
          ? {
              ...req,
              status: "rejected" as const,
              reviewedDate: new Date().toISOString(),
            }
          : req,
      );
      setRequests(updatedRequests);

      if (onRequestUpdate) {
        onRequestUpdate({
          ...request,
          status: "rejected",
        });
      }
    } catch (err: any) {
      console.error("Failed to reject verification:", err);
    }
  };

  const handleViewDocument = (documentUrl: string) => {
    verificationService.viewDocument(documentUrl);
  };

  const handleDownloadDocument = (documentUrl: string, fileName: string) => {
    verificationService.downloadDocument(documentUrl, fileName);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-background">
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
          <CardTitle>Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Failed to load verification requests: {error}
            </p>
            <Button onClick={fetchVerificationRequests}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = filteredRequests.filter(
    (req) => req.status === "pending",
  );
  const processedRequests = filteredRequests.filter(
    (req) => req.status !== "pending",
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-200 flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Search className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>
            Verification Requests
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search by name, email, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Pending Requests */}
      <Card className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <CardTitle className="flex items-center justify-between text-gray-800 dark:text-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
              Pending Verification Requests
            </div>
            <Badge
              variant="secondary"
              className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500"
            >
              {pendingRequests.length} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 gap-4"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {request.employeeName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {request.employeeEmail}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Briefcase className="h-3 w-3" />
                          <span className="truncate">
                            {request.personalInfo.position}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span className="hidden sm:inline">
                            {formatDate(request.submittedDate)}
                          </span>
                          <span className="sm:hidden">
                            {new Date(
                              request.submittedDate,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex-1 sm:flex-none"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">
                              View Details
                            </span>
                            <span className="sm:hidden">View</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mx-4">
                          <DialogHeader>
                            <DialogTitle>
                              Verification Request: {request.employeeName}
                            </DialogTitle>
                          </DialogHeader>
                          <VerificationDetailsView
                            request={request}
                            onApprove={() => handleApproveVerification(request)}
                            onReject={() => handleRejectVerification(request)}
                            onViewDocument={handleViewDocument}
                            onDownloadDocument={handleDownloadDocument}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-700 border-green-200 hover:bg-green-50 flex-1 sm:flex-none"
                        onClick={() => handleApproveVerification(request)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-700 border-red-200 hover:bg-red-50 flex-1 sm:flex-none"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <DialogHeader>
                            <DialogTitle>
                              Reject Verification Request
                            </DialogTitle>
                          </DialogHeader>
                          <RejectVerificationForm
                            request={request}
                            onReject={() => handleRejectVerification(request)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No pending verification requests found matching your search."
                    : "No pending verification requests."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-200">
              Recent Verification Decisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {request.employeeName}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Briefcase className="h-3 w-3" />
                          {request.personalInfo.position}
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      {request.rejectionReason && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          Reason: {request.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {request.reviewedDate && formatDate(request.reviewedDate)}
                    </p>
                    {request.reviewedBy && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        by {request.reviewedBy}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Verification Details View Component
function VerificationDetailsView({
  request,
  onApprove,
  onReject,
  onViewDocument,
  onDownloadDocument,
}: {
  request: VerificationRequest;
  onApprove: () => void;
  onReject: () => void;
  onViewDocument: (url: string) => void;
  onDownloadDocument: (url: string, fileName: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("personal");

  const DocumentCard = ({
    title,
    url,
    fileName,
  }: {
    title: string;
    url?: string;
    fileName: string;
  }) => {
    if (!url) return null;

    return (
      <div className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {title}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDocument(url)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadDocument(url, fileName)}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  First Name
                </Label>
                <p className="font-medium">
                  {request.personalInfo.firstName || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Surname
                </Label>
                <p className="font-medium">
                  {request.personalInfo.surname || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Date of Birth
                </Label>
                <p className="font-medium">
                  {request.personalInfo.dob || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Gender
                </Label>
                <p className="font-medium">
                  {request.personalInfo.gender || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Nationality
                </Label>
                <p className="font-medium">
                  {request.personalInfo.nationality || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Marital Status
                </Label>
                <p className="font-medium">
                  {request.personalInfo.maritalStatus || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Address Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Present Address
                </Label>
                <p className="font-medium">
                  {request.personalInfo.presentAddress || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Permanent Address
                </Label>
                <p className="font-medium">
                  {request.personalInfo.permanentAddress || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Job Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Position
                </Label>
                <p className="font-medium">
                  {request.personalInfo.position || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Wing/Department
                </Label>
                <p className="font-medium">
                  {request.personalInfo.wing || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Join Date
                </Label>
                <p className="font-medium">
                  {request.personalInfo.joinDate || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Retire Date
                </Label>
                <p className="font-medium">
                  {request.personalInfo.retireDate || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Home/Local
                </Label>
                <p className="font-medium">
                  {request.personalInfo.homeLocal || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Sponsor
                </Label>
                <p className="font-medium">
                  {request.personalInfo.sponsor || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Email
                </Label>
                <p className="font-medium">
                  {request.personalInfo.email || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Mobile
                </Label>
                <p className="font-medium">
                  {request.personalInfo.mobile || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Land Phone
                </Label>
                <p className="font-medium">
                  {request.personalInfo.landPhone || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Alternative Mobile
                </Label>
                <p className="font-medium">
                  {request.personalInfo.altMobile || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  WhatsApp
                </Label>
                <p className="font-medium">
                  {request.personalInfo.whatsapp || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Botim
                </Label>
                <p className="font-medium">
                  {request.personalInfo.botim || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Document Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Passport Number
                </Label>
                <p className="font-medium">
                  {request.personalInfo.passportNo || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Passport Issue Date
                </Label>
                <p className="font-medium">
                  {request.personalInfo.passportIssue || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Passport Expiry Date
                </Label>
                <p className="font-medium">
                  {request.personalInfo.passportExpiry || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Emirates ID Number
                </Label>
                <p className="font-medium">
                  {request.personalInfo.emirateIdNo || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Emirates ID Issue Date
                </Label>
                <p className="font-medium">
                  {request.personalInfo.eidIssue || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Emirates ID Expiry Date
                </Label>
                <p className="font-medium">
                  {request.personalInfo.eidExpiry || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Visa Number
                </Label>
                <p className="font-medium">
                  {request.personalInfo.visaNo || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Visa Type
                </Label>
                <p className="font-medium">
                  {request.personalInfo.visaType || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Visa Expiry Date
                </Label>
                <p className="font-medium">
                  {request.personalInfo.visaExpiry || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Banking Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Banking Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Bank
                </Label>
                <p className="font-medium">
                  {request.personalInfo.bank || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Account Number
                </Label>
                <p className="font-medium">
                  {request.personalInfo.accountNo || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Account Name
                </Label>
                <p className="font-medium">
                  {request.personalInfo.accountName || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  IBAN
                </Label>
                <p className="font-medium">
                  {request.personalInfo.iban || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Emergency Contact Name
                </Label>
                <p className="font-medium">
                  {request.personalInfo.emergencyName || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Relationship
                </Label>
                <p className="font-medium">
                  {request.personalInfo.emergencyRelation || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Emergency Phone
                </Label>
                <p className="font-medium">
                  {request.personalInfo.emergencyPhone || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Emergency Email
                </Label>
                <p className="font-medium">
                  {request.personalInfo.emergencyEmail || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Emergency WhatsApp
                </Label>
                <p className="font-medium">
                  {request.personalInfo.emergencyWhatsapp || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Emergency Botim
                </Label>
                <p className="font-medium">
                  {request.personalInfo.emergencyBotim || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Family Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Spouse Name
                </Label>
                <p className="font-medium">
                  {request.personalInfo.spouseName || "N/A"}
                </p>
              </div>
              {request.personalInfo.childDetails &&
                request.personalInfo.childDetails.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Children Details
                    </Label>
                    <div className="space-y-3">
                      {request.personalInfo.childDetails.map((child, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700"
                        >
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <strong>Name:</strong> {child.name || "N/A"}
                            </div>
                            <div>
                              <strong>Gender:</strong> {child.gender || "N/A"}
                            </div>
                            <div>
                              <strong>Date of Birth:</strong>{" "}
                              {child.dob || "N/A"}
                            </div>
                            <div>
                              <strong>Schooling Year:</strong>{" "}
                              {child.schoolingYear || "N/A"}
                            </div>
                            <div className="col-span-2">
                              <strong>School:</strong> {child.school || "N/A"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Leave Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Leave Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Sick Leave
                </Label>
                <p className="font-medium">
                  {request.personalInfo.sickLeave || 0} days
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Casual Leave
                </Label>
                <p className="font-medium">
                  {request.personalInfo.casualLeave || 0} days
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Paid Leave
                </Label>
                <p className="font-medium">
                  {request.personalInfo.paidLeave || 0} days
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4">
            <DocumentCard
              title="Passport"
              url={request.documents.passport}
              fileName={`passport-${request.employeeName.replace(/\s+/g, "-")}.pdf`}
            />
            <DocumentCard
              title="Emirates ID"
              url={request.documents.eid}
              fileName={`eid-${request.employeeName.replace(/\s+/g, "-")}.pdf`}
            />
            <DocumentCard
              title="Visa"
              url={request.documents.visa}
              fileName={`visa-${request.employeeName.replace(/\s+/g, "-")}.pdf`}
            />
            <DocumentCard
              title="CV/Resume"
              url={request.documents.cv}
              fileName={`cv-${request.employeeName.replace(/\s+/g, "-")}.pdf`}
            />
            <DocumentCard
              title="Certificates"
              url={request.documents.certificates}
              fileName={`certificates-${request.employeeName.replace(/\s+/g, "-")}.pdf`}
            />
            <DocumentCard
              title="References"
              url={request.documents.references}
              fileName={`references-${request.employeeName.replace(/\s+/g, "-")}.pdf`}
            />
            {request.documents.photo && (
              <div className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Photo
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDocument(request.documents.photo!)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onDownloadDocument(
                          request.documents.photo!,
                          `photo-${request.employeeName.replace(/\s+/g, "-")}.jpg`,
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <img
                  src={request.documents.photo}
                  alt={`${request.employeeName} photo`}
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                Approve Verification
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                This will approve the employee's verification request and grant
                them access to the system.
              </p>
              <Button
                onClick={onApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Employee
              </Button>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                Reject Verification
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                This will reject the employee's verification request. Please
                provide a reason for rejection.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Reject Verification Request</DialogTitle>
                  </DialogHeader>
                  <RejectVerificationForm
                    request={request}
                    onReject={onReject}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reject Verification Form Component
function RejectVerificationForm({
  request,
  onReject,
}: {
  request: VerificationRequest;
  onReject: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onReject();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          You are about to reject the verification request from{" "}
          <strong>{request.employeeName}</strong> for the position of{" "}
          <strong>{request.personalInfo.position}</strong>.
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" variant="destructive" disabled={isLoading}>
          {isLoading ? "Rejecting..." : "Reject Verification"}
        </Button>
      </div>
    </form>
  );
}

export default VerificationRequests;
