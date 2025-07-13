import axiosInstance from "@/utils/axiosInstance";

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
