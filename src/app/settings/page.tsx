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
import { UserPlus, Lock, Users, ShieldX } from "lucide-react";
import authService from "@/services/authService";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Change Password Form Component
function ChangePasswordForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({
        email: user?.email || "",
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated",
        variant: "default",
      });

      // Reset form and close dialog
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Lock className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            Change Password
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="old-password">Current Password</Label>
            <Input
              id="old-password"
              type="password"
              placeholder="Enter current password"
              value={formData.oldPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  oldPassword: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Assistant Registration Form Component
function RegisterAssistantForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    permissions: {
      dashboard: true,
      employees: false,
      leaves: false,
      hrServices: false,
      settings: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked,
      },
    }));
  };

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
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "admin",
        permissions: formData.permissions,
      });

      toast({
        title: "Admin Account Created",
        description: `New admin account with selected permissions created for ${formData.email}`,
        variant: "default",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        permissions: {
          dashboard: true,
          employees: false,
          leaves: false,
          hrServices: false,
          settings: false,
        },
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create assistant account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Register New Admin with Selected Access
        </h3>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="assistant-name">Full Name</Label>
          <Input
            id="assistant-name"
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
          <Label htmlFor="assistant-email">Email Address</Label>
          <Input
            id="assistant-email"
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
          <Label htmlFor="assistant-password">Password</Label>
          <Input
            id="assistant-password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            required
          />
        </div>

        <div className="grid gap-4">
          <Label className="text-base font-semibold">
            Dashboard Access Permissions
          </Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  Dashboard Overview
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Access to main dashboard and statistics
                </p>
              </div>
              <Switch
                checked={formData.permissions.dashboard}
                onCheckedChange={(checked) =>
                  handlePermissionChange("dashboard", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  Employee Management
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  View and manage employee records
                </p>
              </div>
              <Switch
                checked={formData.permissions.employees}
                onCheckedChange={(checked) =>
                  handlePermissionChange("employees", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Leave Management</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Approve and manage leave requests
                </p>
              </div>
              <Switch
                checked={formData.permissions.leaves}
                onCheckedChange={(checked) =>
                  handlePermissionChange("leaves", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">HR Services</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Access to HR services and notifications
                </p>
              </div>
              <Switch
                checked={formData.permissions.hrServices}
                onCheckedChange={(checked) =>
                  handlePermissionChange("hrServices", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Settings</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Access to system settings (limited)
                </p>
              </div>
              <Switch
                checked={formData.permissions.settings}
                onCheckedChange={(checked) =>
                  handlePermissionChange("settings", checked)
                }
              />
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating Account..." : "Create Admin Account"}
      </Button>
    </form>
  );
}

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
  const { user, hasPermission } = useAuth();
  const { theme, setTheme } = useTheme();

  if (!hasPermission("settings")) {
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
                You don't have permission to access Settings. Please contact
                your administrator for access.
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

          {/* Admin Account Registration - Only for admin-head */}
          {user?.role === "admin-head" && (
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">
                  Admin Account Management (Selected Access)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RegisterAssistantForm />
              </CardContent>
            </Card>
          )}

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
