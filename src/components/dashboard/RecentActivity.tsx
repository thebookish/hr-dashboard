"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import dashboardService, { ActivityItem } from "@/services/dashboardService";

interface RecentActivityProps {
  activities?: ActivityItem[];
}

const RecentActivity = ({
  activities: propActivities,
}: RecentActivityProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>(
    propActivities || [],
  );
  const [isLoading, setIsLoading] = useState(!propActivities);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!propActivities) {
      fetchRecentActivities();
    }
  }, [propActivities]);

  const fetchRecentActivities = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardService.getRecentActivities();
      setActivities(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch recent activities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const filterActivities = (type: string) => {
    if (type === "all") return activities;
    return activities.filter((activity) => activity.type === type);
  };

  const ActivityItemComponent = ({ activity }: { activity: ActivityItem }) => {
    return (
      <div className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={
                activity.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.employeeEmail}`
              }
              alt={activity.employeeName}
            />
            <AvatarFallback>{activity.employeeName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{activity.employeeName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activity.action}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(activity.timestamp)}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activity.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : activity.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-3 rounded-md"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Failed to load recent activities: {error}
            </p>
            <Button onClick={fetchRecentActivities}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="employee">Employees</TabsTrigger>
            <TabsTrigger value="leave">Leaves</TabsTrigger>
            <TabsTrigger value="verification">Verifications</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filterActivities("all").length > 0 ? (
              filterActivities("all").map((activity) => (
                <ActivityItemComponent key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No recent activities found.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="employee" className="space-y-4">
            {filterActivities("employee").length > 0 ? (
              filterActivities("employee").map((activity) => (
                <ActivityItemComponent key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No employee activities found.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="leave" className="space-y-4">
            {filterActivities("leave").length > 0 ? (
              filterActivities("leave").map((activity) => (
                <ActivityItemComponent key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No leave activities found.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            {filterActivities("verification").length > 0 ? (
              filterActivities("verification").map((activity) => (
                <ActivityItemComponent key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No verification activities found.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
