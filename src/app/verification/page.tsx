"use client";

import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VerificationRequests from "@/components/verification/VerificationRequests";

export default function VerificationPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 bg-background">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Employee Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and approve employee verification requests with document
              validation.
            </p>
          </div>
        </div>
        <VerificationRequests />
      </div>
    </DashboardLayout>
  );
}
