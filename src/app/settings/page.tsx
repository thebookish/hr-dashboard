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
import { UserPlus, Lock, Users, ShieldX, Eye, EyeOff } from "lucide-react";
import authService from "@/services/authService";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Profile Name Form Component
function ProfileNameForm() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.updateProfile({
        name: name.trim(),
      });

      toast({
        title: "Profile Updated",
        description: "Your name has been successfully updated",
      });

      // Refresh user data
      await refreshUser();
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setIsEditing(false);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="name">Full Name</Label>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="flex-1"
            required
          />
          <Button type="submit" disabled={isLoading} size="sm">
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            size="sm"
          >
            Cancel
          </Button>
        </form>
      ) : (
        <div className="flex gap-2">
          <Input
            id="name"
            type="text"
            value={user?.name || ""}
            disabled
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(true)}
            size="sm"
          >
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}

// Change Password Form Component
function ChangePasswordForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

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
            <div className="relative">
              <Input
                id="old-password"
                type={showPasswords.oldPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={formData.oldPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    oldPassword: e.target.value,
                  }))
                }
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    oldPassword: !prev.oldPassword,
                  }))
                }
              >
                {showPasswords.oldPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.newPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    newPassword: !prev.newPassword,
                  }))
                }
              >
                {showPasswords.newPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirmPassword: !prev.confirmPassword,
                  }))
                }
              >
                {showPasswords.confirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
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
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    permissions: {
      dashboard: true,
      employees: false,
      leaves: false,
      hrServices: false,
      settings: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked,
      },
    }));
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast({
        title: "Validation Error",
        description: "Please enter email address first",
        variant: "destructive",
      });
      return;
    }

    setOtpLoading(true);
    try {
      await authService.sendOTP(formData.email);
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Verification code has been sent to your email",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!otpSent || !formData.otp) {
      toast({
        title: "Validation Error",
        description: "Please verify your email with OTP first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.registerWithOTP({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "admin",
        permissions: formData.permissions,
        otp: formData.otp,
      });

      toast({
        title: "Admin Account Created",
        description: `New admin account with selected permissions created for ${formData.email}`,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        otp: "",
        permissions: {
          dashboard: true,
          employees: false,
          leaves: false,
          hrServices: false,
          settings: false,
        },
      });
      setOtpSent(false);
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
          <div className="flex gap-2">
            <Input
              id="assistant-email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSendOTP}
              disabled={otpLoading || !formData.email || otpSent}
            >
              {otpLoading ? "Sending..." : otpSent ? "OTP Sent" : "Send OTP"}
            </Button>
          </div>
        </div>

        {otpSent && (
          <div className="grid gap-2">
            <Label htmlFor="assistant-otp">Verification Code (OTP)</Label>
            <Input
              id="assistant-otp"
              type="text"
              placeholder="Enter 6-digit verification code"
              value={formData.otp}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, otp: e.target.value }))
              }
              required
              maxLength={6}
            />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="assistant-password">Password</Label>
          <div className="relative">
            <Input
              id="assistant-password"
              type={showPasswords.password ? "text" : "password"}
              placeholder="Enter password (min 6 characters)"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() =>
                setShowPasswords((prev) => ({
                  ...prev,
                  password: !prev.password,
                }))
              }
            >
              {showPasswords.password ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="assistant-confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="assistant-confirm-password"
              type={showPasswords.confirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() =>
                setShowPasswords((prev) => ({
                  ...prev,
                  confirmPassword: !prev.confirmPassword,
                }))
              }
            >
              {showPasswords.confirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
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
  const { toast } = useToast();
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
              <ProfileNameForm />
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
