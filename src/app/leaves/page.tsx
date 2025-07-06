"use client";

import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LeaveRequests from "@/components/leave/LeaveRequests";

export default function LeavesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 bg-background">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Leave Management</h1>
            <p className="text-muted-foreground mt-1">
              Review and manage employee leave requests.
            </p>
          </div>
        </div>
        <LeaveRequests />
      </div>
    </DashboardLayout>
  );
}
