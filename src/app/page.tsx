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

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 bg-background">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening in your HR dashboard today.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <SendNotificationDialog>
              <Button variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Send Notification
              </Button>
            </SendNotificationDialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Recent Activity */}
          <RecentActivity />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLinkCard
            icon={<Users className="h-6 w-6" />}
            title="Employee Management"
            description="View and manage employee profiles"
            href="/employees"
          />
          <QuickLinkCard
            icon={<Calendar className="h-6 w-6" />}
            title="Leave Management"
            description="Review and approve leave requests"
            href="/leaves"
          />
          <QuickLinkCard
            icon={<CheckCircle className="h-6 w-6" />}
            title="HR Services"
            description="Manage salaries, tasks, and sponsors"
            href="/hr-services"
          />
          <QuickLinkCard
            icon={<Users className="h-6 w-6" />}
            title="Verification"
            description="Review and approve employee verification requests"
            href="/verification"
          />
          <QuickLinkCard
            icon={<AlertCircle className="h-6 w-6" />}
            title="Reports"
            description="Generate and export HR reports"
            href="/reports"
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
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="flex flex-col items-center text-center p-6">
          <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
            {icon}
          </div>
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
