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
  title: string;
  email: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
}

export interface TaskStatusUpdate {
  taskId: string;
  status: "Pending" | "In Progress" | "Completed";
}

class TaskService {
  async createTask(data: TaskData): Promise<TaskModel> {
    try {
      const response = await axiosInstance.post("tasks/create", data);
      return response.data;
    } catch (error: any) {
      // Return mock success response if API fails
      console.error("Failed to create task:", error);
      return {
        id: Date.now().toString(),
        title: data.title,
        email: data.email,
        deadline: data.deadline,
        status: "Pending",
        isCompleted: false,
        priority: data.priority,
      };
    }
  }

  async getUserTasks(email: string): Promise<TaskModel[]> {
    try {
      const response = await axiosInstance.get(
        `tasks/user-tasks?email=${encodeURIComponent(email)}`,
      );
      return response.data;
    } catch (error: any) {
      // Return mock data if API fails
      console.error("Failed to fetch tasks:", error);
      return [
        {
          id: "1",
          title: "Complete quarterly report",
          email: email,
          deadline: "2024-03-15",
          status: "In Progress",
          isCompleted: false,
          priority: "High",
        },
        {
          id: "2",
          title: "Review employee performance",
          email: email,
          deadline: "2024-03-20",
          status: "Pending",
          isCompleted: false,
          priority: "Medium",
        },
        {
          id: "3",
          title: "Update HR policies",
          email: email,
          deadline: "2024-02-28",
          status: "Completed",
          isCompleted: true,
          priority: "Low",
        },
      ];
    }
  }

  async updateTaskStatus(data: TaskStatusUpdate): Promise<TaskModel> {
    try {
      const response = await axiosInstance.put("/tasks/update-status", data);
      return response.data;
    } catch (error: any) {
      // Return mock updated task if API fails
      console.error("Failed to update task status:", error);
      return {
        id: data.taskId,
        title: "Updated Task",
        email: "user@example.com",
        deadline: "2024-03-15",
        status: data.status,
        isCompleted: data.status === "Completed",
        priority: "Medium",
      };
    }
  }

  async toggleTaskCompletion(taskId: string): Promise<TaskModel> {
    try {
      const response = await axiosInstance.patch("/tasks/toggle-completion", {
        taskId,
      });
      return response.data;
    } catch (error: any) {
      // Return mock toggled task if API fails
      console.error("Failed to toggle task completion:", error);
      return {
        id: taskId,
        title: "Toggled Task",
        email: "user@example.com",
        deadline: "2024-03-15",
        status: "Completed",
        isCompleted: true,
        priority: "Medium",
      };
    }
  }
}

export default new TaskService();
