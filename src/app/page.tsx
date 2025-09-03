"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Send,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatisticsCards from "@/components/dashboard/StatisticsCards";
import NotificationsFeed from "@/components/dashboard/NotificationsFeed";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SendNotificationDialog from "@/components/dashboard/SendNotificationDialog";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();

  if (!hasPermission("dashboard")) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center text-center p-8">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have permission to access the Dashboard. Please
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
      <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 bg-background">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 md:p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 break-words">
              Welcome back
              {user?.name ? `, ${user.name}` : ""}!
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1 break-words">
              Here's what's happening in your HR dashboard today.
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex gap-2 w-full sm:w-auto">
            <SendNotificationDialog>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <Send className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Send Notification</span>
                <span className="sm:hidden">Send</span>
              </Button>
            </SendNotificationDialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-6">
          {/* Recent Activity */}
          <RecentActivity />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <QuickLinkCard
            icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
            title="Employee Management"
            description="View and manage employee profiles"
            href="/employees"
          />
          <QuickLinkCard
            icon={<Calendar className="h-5 w-5 sm:h-6 sm:w-6" />}
            title="Leave Management"
            description="Review and approve leave requests"
            href="/leaves"
          />
          <QuickLinkCard
            icon={<CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
            title="HR Services"
            description="Manage salaries, tasks, and sponsors"
            href="/hr-services"
          />
          <QuickLinkCard
            icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
            title="Verification"
            description="Review and approve employee verification requests"
            href="/verification"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

interface QuickLinkCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

function QuickLinkCard({ icon, title, description, href }: QuickLinkCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="h-full hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
        <CardContent className="flex flex-col items-center text-center p-3 sm:p-4 md:p-6">
          <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mb-2 sm:mb-3 md:mb-4">
            {icon}
          </div>
          <h3 className="font-medium mb-1 text-xs sm:text-sm md:text-base text-gray-900 dark:text-gray-100 break-words text-center">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words text-center">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
