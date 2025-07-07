"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { UserPlus } from "lucide-react";
import authService from "@/services/authService";
import { toast } from "@/components/ui/use-toast";

// HR Registration Form Component
function RegisterHRForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        ...formData,
        role: "admin",
      });

      toast({
        title: "HR Account Created",
        description: `New HR account created for ${formData.email}`,
        variant: "default",
      });

      // Reset form
      setFormData({ name: "", email: "", password: "" });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create HR account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Register New HR Account
        </h3>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="hr-name">Full Name</Label>
          <Input
            id="hr-name"
            type="text"
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="hr-email">Email Address</Label>
          <Input
            id="hr-email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="hr-password">Password</Label>
          <Input
            id="hr-password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating Account..." : "Create HR Account"}
      </Button>
    </form>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 bg-background">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account settings and preferences.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={user?.role || ""} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-900 dark:text-gray-100">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                System Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-900 dark:text-gray-100">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-900 dark:text-gray-100">
                    Desktop Notifications
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Show desktop notifications for new activities
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* HR Account Registration */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                HR Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RegisterHRForm />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Export Data
              </Button>
              <Separator />
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
