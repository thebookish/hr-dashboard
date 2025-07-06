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
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <aside className="hidden md:flex md:w-64 flex-col bg-card border-r p-4 space-y-6">
        <div className="flex items-center space-x-2">
          <LayoutDashboardIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">HR Dashboard</h1>
        </div>

        <Separator />

        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/">
              <LayoutDashboardIcon className="mr-2 h-4 w-4" />
              Dashboard
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/employees">
              <UsersIcon className="mr-2 h-4 w-4" />
              Employees
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/leaves">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Leave Management
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/hr-services">
              <BellIcon className="mr-2 h-4 w-4" />
              HR Services
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/settings">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </a>
          </Button>
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
                  <LayoutDashboardIcon className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-bold">HR Dashboard</h1>
                </div>

                <Separator />

                <nav className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href="/">
                      <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                      Dashboard
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href="/employees">
                      <UsersIcon className="mr-2 h-4 w-4" />
                      Employees
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href="/leaves">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Leave Management
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href="/hr-services">
                      <BellIcon className="mr-2 h-4 w-4" />
                      HR Services
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href="/settings">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Settings
                    </a>
                  </Button>
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

          <div className="md:hidden flex items-center">
            <LayoutDashboardIcon className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-lg font-bold">HR Dashboard</h1>
          </div>

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
