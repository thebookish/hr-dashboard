"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import {
  Check,
  X,
  Calendar,
  Clock,
  MessageSquare,
  Phone,
  Users,
  FileSignature,
  Building,
} from "lucide-react";

import leaveService, { LeaveRequest } from "@/services/leaveService";

interface LeaveRequestsProps {
  requests?: LeaveRequest[];
  onRequestUpdate?: (request: LeaveRequest) => void;
}

const LeaveRequests = ({
  requests: propRequests,
  onRequestUpdate,
}: LeaveRequestsProps) => {
  const [requests, setRequests] = useState<LeaveRequest[]>(propRequests || []);
  const [isLoading, setIsLoading] = useState(!propRequests);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propRequests) {
      fetchLeaveRequests();
    }
  }, [propRequests]);

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const data = await leaveService.getLeaveRequests();
      setRequests(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch leave requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveLeave = async (request: LeaveRequest) => {
    try {
      await leaveService.approveLeave(request.employeeEmail);
      const updatedRequests = requests.map((req) =>
        req.id === request.id ? { ...req, status: "approved" as const } : req,
      );
      setRequests(updatedRequests);
      if (onRequestUpdate) {
        onRequestUpdate({ ...request, status: "approved" });
      }
    } catch (err: any) {
      console.error("Failed to approve leave:", err);
    }
  };

  const handleRejectLeave = async (request: LeaveRequest) => {
    try {
      await leaveService.rejectLeave(request.employeeEmail);
      const updatedRequests = requests.map((req) =>
        req.id === request.id ? { ...req, status: "rejected" as const } : req,
      );
      setRequests(updatedRequests);

      if (onRequestUpdate) {
        onRequestUpdate({ ...request, status: "rejected" });
      }
    } catch (err: any) {
      console.error("Failed to reject leave:", err);
      // Show error message to user but don't update UI on failure
    }
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
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-background">
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
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
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Failed to load leave requests: {error}
            </p>
            <Button onClick={fetchLeaveRequests}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter((req) => req.status === "pending");
  const processedRequests = requests.filter((req) => req.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <CardTitle className="flex items-center justify-between text-gray-800 dark:text-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
              Pending Leave Requests
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
                  className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {request.employeeName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.employeeEmail}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {formatDate(request.startDate)} -{" "}
                          {formatDate(request.endDate)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          {request.noOfDays ||
                            calculateDays(
                              request.startDate,
                              request.endDate,
                            )}{" "}
                          days
                        </div>
                        <Badge
                          variant="outline"
                          className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        >
                          {request.leaveType}
                        </Badge>
                      </div>

                      {/* Employee Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-gray-600 dark:text-gray-400">
                        {request.designation && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            <span>{request.designation}</span>
                          </div>
                        )}
                        {request.wing && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{request.wing}</span>
                          </div>
                        )}
                        {request.whatsapp && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>WhatsApp: {request.whatsapp}</span>
                          </div>
                        )}
                        {request.emergencyContact && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>Emergency: {request.emergencyContact}</span>
                          </div>
                        )}
                      </div>

                      {/* Substitute Information */}
                      {(request.substituteName ||
                        request.substituteContact) && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                          <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300 font-medium mb-1">
                            <Users className="h-3 w-3" />
                            <span>Substitute Details:</span>
                          </div>
                          {request.substituteName && (
                            <div>Name: {request.substituteName}</div>
                          )}
                          {request.substituteContact && (
                            <div>Contact: {request.substituteContact}</div>
                          )}
                        </div>
                      )}

                      {request.reason && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                      )}

                      {request.signature && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <FileSignature className="h-3 w-3" />
                          <span>Signed by: {request.signature}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-700 border-green-200 hover:bg-green-50 flex-1 sm:flex-none"
                      onClick={() => handleApproveLeave(request)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-700 border-red-200 hover:bg-red-50 flex-1 sm:flex-none"
                      onClick={() => handleRejectLeave(request)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No pending leave requests.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card className="w-full bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800">
              Recent Leave Decisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.employeeName}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {formatDate(request.startDate)} -{" "}
                          {formatDate(request.endDate)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          {request.noOfDays ||
                            calculateDays(
                              request.startDate,
                              request.endDate,
                            )}{" "}
                          days
                        </div>
                        <Badge
                          variant="outline"
                          className="border-gray-200 text-gray-700"
                        >
                          {request.leaveType}
                        </Badge>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {request.approvedDate && formatDate(request.approvedDate)}
                    </p>
                    {request.approvedBy && (
                      <p className="text-xs text-gray-500">
                        by {request.approvedBy}
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

export default LeaveRequests;
