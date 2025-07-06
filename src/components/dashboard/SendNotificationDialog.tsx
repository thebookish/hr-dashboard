"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Users, Send, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import notificationService from "@/services/notificationService";
import employeeService, { Employee } from "@/services/employeeService";
import { useNotifications } from "@/hooks/useNotifications";

interface SendNotificationDialogProps {
  children: React.ReactNode;
}

const SendNotificationDialog = ({ children }: SendNotificationDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "warning" | "error" | "success",
  });
  const [activeTab, setActiveTab] = useState("single");
  const { sendNotification } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const handleSendSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedEmployees.length ||
      !notificationData.title ||
      !notificationData.message
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await sendNotification({
        title: notificationData.title,
        message: notificationData.message,
        email: selectedEmployees[0],
        type: notificationData.type,
      });

      // Reset form
      setNotificationData({ title: "", message: "", type: "info" });
      setSelectedEmployees([]);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to send notification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedEmployees.length ||
      !notificationData.title ||
      !notificationData.message
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const notifications = selectedEmployees.map((email) => ({
        title: notificationData.title,
        message: notificationData.message,
        email,
        type: notificationData.type,
      }));

      await notificationService.sendBulkNotifications(notifications);

      // Reset form
      setNotificationData({ title: "", message: "", type: "info" });
      setSelectedEmployees([]);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to send bulk notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmployeeSelection = (email: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email],
    );
  };

  const selectAllEmployees = () => {
    setSelectedEmployees(employees.map((emp) => emp.email));
  };

  const clearSelection = () => {
    setSelectedEmployees([]);
  };

  const getSelectedEmployeeNames = () => {
    return employees
      .filter((emp) => selectedEmployees.includes(emp.email))
      .map((emp) => emp.name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Notification
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Employee</TabsTrigger>
            <TabsTrigger value="bulk">Multiple Employees</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <form onSubmit={handleSendSingle} className="space-y-4">
              <div>
                <Label htmlFor="employee-select">Select Employee</Label>
                <Select
                  value={selectedEmployees[0] || ""}
                  onValueChange={(value) => setSelectedEmployees([value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.email}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={
                                employee.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.email}`
                              }
                              alt={employee.name}
                            />
                            <AvatarFallback className="text-xs">
                              {employee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Notification title"
                    value={notificationData.title}
                    onChange={(e) =>
                      setNotificationData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={notificationData.type}
                    onValueChange={(
                      value: "info" | "warning" | "error" | "success",
                    ) =>
                      setNotificationData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your notification message..."
                  value={notificationData.message}
                  onChange={(e) =>
                    setNotificationData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !selectedEmployees.length}
                >
                  {isLoading ? "Sending..." : "Send Notification"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <form onSubmit={handleSendBulk} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Select Employees</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllEmployees}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {selectedEmployees.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {getSelectedEmployeeNames().map((name, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {name}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() =>
                              toggleEmployeeSelection(selectedEmployees[index])
                            }
                          />
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedEmployees.length} employee
                      {selectedEmployees.length !== 1 ? "s" : ""} selected
                    </p>
                  </div>
                )}

                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted ${
                        selectedEmployees.includes(employee.email)
                          ? "bg-primary/10 border border-primary/20"
                          : ""
                      }`}
                      onClick={() => toggleEmployeeSelection(employee.email)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.email)}
                        onChange={() => toggleEmployeeSelection(employee.email)}
                        className="rounded"
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            employee.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.email}`
                          }
                          alt={employee.name}
                        />
                        <AvatarFallback className="text-xs">
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.email} • {employee.department}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bulk-title">Title</Label>
                  <Input
                    id="bulk-title"
                    placeholder="Notification title"
                    value={notificationData.title}
                    onChange={(e) =>
                      setNotificationData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-type">Type</Label>
                  <Select
                    value={notificationData.type}
                    onValueChange={(
                      value: "info" | "warning" | "error" | "success",
                    ) =>
                      setNotificationData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bulk-message">Message</Label>
                <Textarea
                  id="bulk-message"
                  placeholder="Enter your notification message..."
                  value={notificationData.message}
                  onChange={(e) =>
                    setNotificationData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !selectedEmployees.length}
                >
                  {isLoading
                    ? "Sending..."
                    : `Send to ${selectedEmployees.length} Employee${selectedEmployees.length !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SendNotificationDialog;
