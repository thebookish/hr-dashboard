"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, CheckCircle } from "lucide-react";
import dashboardService, { DashboardStats } from "@/services/dashboardService";

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
}

const StatisticCard = ({
  title,
  value,
  icon,
  trend,
  bgColor = "bg-white dark:bg-gray-800",
}: StatisticCardProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
              {value}
            </h3>
            {trend && (
              <p
                className={`text-xs mt-1 flex items-center ${trend.isPositive ? "text-green-500" : "text-red-500"}`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  from last month
                </span>
              </p>
            )}
          </div>
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatisticsCardsProps {
  data?: DashboardStats;
}

const StatisticsCards = ({ data: propData }: StatisticsCardsProps) => {
  const [data, setData] = useState<DashboardStats | null>(propData || null);
  const [isLoading, setIsLoading] = useState(!propData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propData) {
      fetchDashboardStats();
    }
  }, [propData]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const stats = await dashboardService.getStats();
      setData(stats);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-background">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">
              {error || "No dashboard data available"}
            </p>
            <button
              onClick={fetchDashboardStats}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatisticCard
          title="Total Employees"
          value={data.totalEmployees}
          icon={<Users className="h-5 w-5 text-primary" />}
        />

        <StatisticCard
          title="Pending Leaves"
          value={data.pendingLeaves}
          icon={<Calendar className="h-5 w-5 text-amber-500" />}
        />

        <StatisticCard
          title="Verification Requests"
          value={data.verificationRequests}
          icon={<CheckCircle className="h-5 w-5 text-blue-500" />}
        />
      </div>
    </div>
  );
};

export default StatisticsCards;
