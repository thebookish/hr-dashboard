"use client";

import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EmployeeTable from "@/components/employee/EmployeeTable";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

export default function EmployeesPage() {
  const { hasPermission } = useAuth();

  if (!hasPermission("employees")) {
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
                You don't have permission to access Employee Management. Please
                contact your administrator for access.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 bg-background">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Employee Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage employee profiles, verification, and details.
            </p>
          </div>
        </div>
        <EmployeeTable />
      </div>
    </DashboardLayout>
  );
}
