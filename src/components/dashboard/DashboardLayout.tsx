"use client";

import React, { useEffect } from "react";
import {
  MoonIcon,
  SunIcon,
  BellIcon,
  UserIcon,
  LogOutIcon,
  LayoutDashboardIcon,
  UsersIcon,
  CalendarIcon,
  SettingsIcon,
} from "lucide-react";
import Image from "next/image";
import emLogo from "@/components/dashboard/em_logo.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({
  children = <div className="p-6">Dashboard Content</div>,
}: DashboardLayoutProps) => {
  const { theme, setTheme } = useTheme();
  const { user, logout, isAuthenticated, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  // Get current path to determine active navigation item
  const [currentPath, setCurrentPath] = React.useState("/");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // Check if user has any permissions
  const hasAnyPermission = () => {
    if (!user || !user.permissions) return false;
    return Object.values(user.permissions).some(
      (permission) => permission === true,
    );
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check if user has any permissions
  if (!hasAnyPermission()) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-12 w-12 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Access Restricted
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You don't have permission to access any features in this system.
                Please contact your administrator to request appropriate access
                permissions.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/login")}>
                Back to Login
              </Button>
              <Button variant="destructive" onClick={logout}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <aside className="hidden md:flex md:w-64 flex-col bg-card border-r p-4 space-y-6">
        <div className="flex items-center space-x-3">
          <Image
            src={emLogo}
            alt="Embassy Team Logo"
            width={60} // 🔼 Increased width
            height={60} // 🔼 Increased height
            className="h-10 w-10 object-contain" // h-10 = 40px
            priority
          />
          <h1 className="text-2xl font-bold">HR Dashboard</h1>{" "}
          {/* Optional: bumped font size */}
        </div>

        <Separator />

        <nav className="space-y-1">
          {hasPermission("dashboard") && (
            <Button
              variant={currentPath === "/" ? "default" : "ghost"}
              className={`w-full justify-start ${
                currentPath === "/" ? "bg-primary text-primary-foreground" : ""
              }`}
              asChild
            >
              <a href="/" onClick={() => setCurrentPath("/")}>
                <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                Dashboard
              </a>
            </Button>
          )}
          {hasPermission("employees") && (
            <Button
              variant={currentPath === "/employees" ? "default" : "ghost"}
              className={`w-full justify-start ${
                currentPath === "/employees"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
              asChild
            >
              <a href="/employees" onClick={() => setCurrentPath("/employees")}>
                <UsersIcon className="mr-2 h-4 w-4" />
                Employees
              </a>
            </Button>
          )}
          {hasPermission("leaves") && (
            <Button
              variant={currentPath === "/leaves" ? "default" : "ghost"}
              className={`w-full justify-start ${
                currentPath === "/leaves"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
              asChild
            >
              <a href="/leaves" onClick={() => setCurrentPath("/leaves")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Leave Management
              </a>
            </Button>
          )}
          {hasPermission("hrServices") && (
            <Button
              variant={currentPath === "/hr-services" ? "default" : "ghost"}
              className={`w-full justify-start ${
                currentPath === "/hr-services"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
              asChild
            >
              <a
                href="/hr-services"
                onClick={() => setCurrentPath("/hr-services")}
              >
                <BellIcon className="mr-2 h-4 w-4" />
                HR Services
              </a>
            </Button>
          )}
          {hasPermission("settings") && (
            <Button
              variant={currentPath === "/settings" ? "default" : "ghost"}
              className={`w-full justify-start ${
                currentPath === "/settings"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
              asChild
            >
              <a href="/settings" onClick={() => setCurrentPath("/settings")}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </a>
            </Button>
          )}
        </nav>

        <div className="mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500"
            onClick={logout}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b p-4 flex items-center justify-between">
          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full bg-card p-4 space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center shadow-sm border">
                    <Image
                      src={emLogo}
                      alt="Embassy Team Logo"
                      width={50}
                      height={50}
                      className="h-6 w-6 object-contain"
                      priority
                    />
                  </div>
                  <h1 className="text-xl font-bold">HR Dashboard</h1>
                </div>

                <Separator />

                <nav className="space-y-1">
                  {hasPermission("dashboard") && (
                    <Button
                      variant={currentPath === "/" ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        currentPath === "/"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      asChild
                    >
                      <a href="/" onClick={() => setCurrentPath("/")}>
                        <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                        Dashboard
                      </a>
                    </Button>
                  )}
                  {hasPermission("employees") && (
                    <Button
                      variant={
                        currentPath === "/employees" ? "default" : "ghost"
                      }
                      className={`w-full justify-start ${
                        currentPath === "/employees"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      asChild
                    >
                      <a
                        href="/employees"
                        onClick={() => setCurrentPath("/employees")}
                      >
                        <UsersIcon className="mr-2 h-4 w-4" />
                        Employees
                      </a>
                    </Button>
                  )}
                  {hasPermission("leaves") && (
                    <Button
                      variant={currentPath === "/leaves" ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        currentPath === "/leaves"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      asChild
                    >
                      <a
                        href="/leaves"
                        onClick={() => setCurrentPath("/leaves")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Leave Management
                      </a>
                    </Button>
                  )}
                  {hasPermission("hrServices") && (
                    <Button
                      variant={
                        currentPath === "/hr-services" ? "default" : "ghost"
                      }
                      className={`w-full justify-start ${
                        currentPath === "/hr-services"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      asChild
                    >
                      <a
                        href="/hr-services"
                        onClick={() => setCurrentPath("/hr-services")}
                      >
                        <BellIcon className="mr-2 h-4 w-4" />
                        HR Services
                      </a>
                    </Button>
                  )}
                  {hasPermission("settings") && (
                    <Button
                      variant={
                        currentPath === "/settings" ? "default" : "ghost"
                      }
                      className={`w-full justify-start ${
                        currentPath === "/settings"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      asChild
                    >
                      <a
                        href="/settings"
                        onClick={() => setCurrentPath("/settings")}
                      >
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        Settings
                      </a>
                    </Button>
                  )}
                </nav>

                <div className="mt-auto">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500"
                    onClick={logout}
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Right side header items */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
