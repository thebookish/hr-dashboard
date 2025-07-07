"use client";

import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EmployeeTable from "@/components/employee/EmployeeTable";

export default function EmployeesPage() {
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
