import axiosInstance from "@/utils/axiosInstance";
import notificationService from "./notificationService";
import { getUser } from "@/utils/storage";

export interface TaskModel {
  id: string;
  title: string;
  email: string;
  deadline: string;
  status: "Pending" | "In Progress" | "Completed";
  isCompleted: boolean;
  priority: "High" | "Medium" | "Low";
}

export interface TaskData {
  id: string;
  title: string;
  email: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  isCompleted: boolean;
}

export interface TaskStatusUpdate {
  taskId: string;
  status: "Pending" | "In Progress" | "Completed";
}

class TaskService {
  async createTask(data: TaskData): Promise<TaskModel> {
    try {
      const response = await axiosInstance.post("/tasks/create", {
        id: data.id,
        title: data.title,
        deadline: data.deadline,
        isCompleted: data.isCompleted,
        priority: data.priority,
        status: data.status,
        email: data.email,
      });

      // Send notification to employee about new task
      try {
        const currentUser = getUser();
        const adminName = currentUser?.name || "HR Admin";
        const deadlineDate = new Date(data.deadline).toLocaleDateString();

        await notificationService.sendNotification({
          title: "New Task Assigned",
          message: `You have been assigned a new task: "${data.title}" by ${adminName}. Priority: ${data.priority}. Deadline: ${deadlineDate}`,
          email: data.email,
          type: "info",
        });
      } catch (notifError) {
        console.error(
          "Failed to send task assignment notification:",
          notifError,
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to create task:", error);
      throw new Error(error.response?.data?.message || "Failed to create task");
    }
  }

  async getUserTasks(email: string): Promise<TaskModel[]> {
    try {
      const response = await axiosInstance.get(
        `/tasks/user-tasks?email=${encodeURIComponent(email)}`,
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch user tasks:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch user tasks",
      );
    }
  }

  async updateTaskStatus(data: TaskStatusUpdate): Promise<TaskModel> {
    try {
      const response = await axiosInstance.put("/tasks/update-status", data);

      // Send notification to employee about task status update
      try {
        const currentUser = getUser();
        const adminName = currentUser?.name || "HR Admin";

        // Get task details to find employee email
        const taskDetails = response.data;
        if (taskDetails.email) {
          await notificationService.sendNotification({
            title: "Task Status Updated",
            message: `Your task "${taskDetails.title}" status has been updated to "${data.status}" by ${adminName}.`,
            email: taskDetails.email,
            type: "info",
          });
        }
      } catch (notifError) {
        console.error(
          "Failed to send task status update notification:",
          notifError,
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to update task status:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update task status",
      );
    }
  }

  async toggleTaskCompletion(taskId: string): Promise<TaskModel> {
    try {
      const response = await axiosInstance.patch("/tasks/toggle-completion", {
        taskId,
      });
      return response.data;
    } catch (error: any) {
      console.error("Failed to toggle task completion:", error);
      throw new Error(
        error.response?.data?.message || "Failed to toggle task completion",
      );
    }
  }
}

export default new TaskService();
