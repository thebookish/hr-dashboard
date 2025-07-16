import axiosInstance from "@/utils/axiosInstance";
import {
  setToken,
  setUser,
  clearAuthData,
  UserModel,
  getUser,
} from "@/utils/storage";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  position?: string;
  department?: string;
  joinDate?: string;
  profilePic?: string;
  role?: string;
  permissions?: {
    dashboard: boolean;
    employees: boolean;
    leaves: boolean;
    hrServices: boolean;
    settings: boolean;
  };
  otp?: string;
}

export interface OTPData {
  email: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: UserModel;
  message: string;
}

export interface ChangePasswordData {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  position?: string;
  department?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log(
        "Attempting login to:",
        axiosInstance.defaults.baseURL + "/auth/login",
      );
      const response = await axiosInstance.post("/auth/login", credentials);
      const { token, user, message } = response.data;

      if (!token) {
        throw new Error("No authentication token received from server");
      }

      if (!user || !user.email) {
        throw new Error("Invalid user data received from server");
      }

      // Create properly structured user object
      const structuredUser: UserModel = {
        id: user.id || user._id || user.email,
        name: user.name || "",
        email: user.email,
        role: user.role || "admin",
        permissions: {
          dashboard: user.permissions?.dashboard ?? true,
          employees: user.permissions?.employees ?? true,
          leaves: user.permissions?.leaves ?? true,
          hrServices: user.permissions?.hrServices ?? true,
          settings: user.permissions?.settings ?? true,
        },
      };

      // Store token and user data
      setToken(token);
      setUser(structuredUser);

      return {
        token,
        user: structuredUser,
        message: message || "Login successful",
      };
    } catch (error: any) {
      console.error("Login failed:", error);
      console.error("Error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
        method: error?.config?.method,
      });

      // Clear any partial auth data on error
      clearAuthData();

      let errorMessage;

      if (error?.response?.status === 404) {
        errorMessage =
          "Login service is currently unavailable. The authentication endpoint was not found. Please contact your system administrator.";
      } else if (error?.response?.status === 500) {
        errorMessage =
          "Server error occurred during login. Please try again later or contact support.";
      } else if (error?.response?.status === 401) {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (
        error?.code === "ECONNREFUSED" ||
        error?.code === "NETWORK_ERROR" ||
        error?.code === "ERR_NETWORK" ||
        error?.message?.includes("Network Error") ||
        error?.message?.includes("fetch") ||
        !error?.response
      ) {
        errorMessage =
          "Network connection failed. Please check your internet connection and try again. If the problem persists, contact your system administrator.";
      } else {
        errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Login failed. Please try again.";
      }

      throw new Error(errorMessage);
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/register", data);
      const { token, user, message } = response.data;

      if (token && user) {
        const structuredUser: UserModel = {
          id: user.id || user._id || user.email,
          name: user.name || "",
          email: user.email,
          role: user.role || "admin",
          permissions: {
            dashboard: user.permissions?.dashboard ?? true,
            employees: user.permissions?.employees ?? true,
            leaves: user.permissions?.leaves ?? true,
            hrServices: user.permissions?.hrServices ?? true,
            settings: user.permissions?.settings ?? true,
          },
        };

        setToken(token);
        setUser(structuredUser);

        return {
          token,
          user: structuredUser,
          message: message || "Registration successful",
        };
      }

      return response.data;
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  }

  async registerWithOTP(data: RegisterData): Promise<AuthResponse> {
    try {
      // First verify OTP
      if (data.otp) {
        await this.verifyOTP({ email: data.email, otp: data.otp });
      }

      // Then proceed with registration
      const response = await axiosInstance.post("/auth/register", data);
      const { token, user, message } = response.data;

      if (token && user) {
        const structuredUser: UserModel = {
          id: user.id || user._id || user.email,
          name: user.name || "",
          email: user.email,
          role: user.role || "admin",
          permissions: {
            dashboard: user.permissions?.dashboard ?? true,
            employees: user.permissions?.employees ?? true,
            leaves: user.permissions?.leaves ?? true,
            hrServices: user.permissions?.hrServices ?? true,
            settings: user.permissions?.settings ?? true,
          },
        };

        setToken(token);
        setUser(structuredUser);

        return {
          token,
          user: structuredUser,
          message: message || "Registration successful",
        };
      }

      return response.data;
    } catch (error: any) {
      console.error("Registration with OTP failed:", error);
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  }

  async sendOTP(email: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post("/auth/send-otp", { email });
      return response.data;
    } catch (error: any) {
      console.error("Send OTP failed:", error);
      throw new Error(error.response?.data?.message || "Failed to send OTP");
    }
  }

  async verifyOTP(data: OTPData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/verify-otp", data);
      const { token, user, message } = response.data;

      if (token && user) {
        const structuredUser: UserModel = {
          id: user.id || user._id || user.email,
          name: user.name || "",
          email: user.email,
          role: user.role || "admin",
          permissions: {
            dashboard: user.permissions?.dashboard ?? true,
            employees: user.permissions?.employees ?? true,
            leaves: user.permissions?.leaves ?? true,
            hrServices: user.permissions?.hrServices ?? true,
            settings: user.permissions?.settings ?? true,
          },
        };

        setToken(token);
        setUser(structuredUser);

        return {
          token,
          user: structuredUser,
          message: message || "OTP verification successful",
        };
      }

      return response.data;
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      throw new Error(
        error.response?.data?.message || "OTP verification failed",
      );
    }
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post("/auth/change-password", data);
      return response.data;
    } catch (error: any) {
      console.error("Change password failed:", error);
      throw new Error(
        error.response?.data?.message || "Failed to change password",
      );
    }
  }

  async updateProfile(
    data: UpdateProfileData,
  ): Promise<{ message: string; user: UserModel }> {
    try {
      // Get current user to extract email
      const currentUser = getUser();
      if (!currentUser || !currentUser.email) {
        throw new Error("User not found or email not available");
      }

      const response = await axiosInstance.put(
        `/users/update-profile?email=${encodeURIComponent(currentUser.email)}`,
        data,
      );
      const { user, message } = response.data;

      if (user) {
        const structuredUser: UserModel = {
          id: user.id || user._id || user.email,
          name: user.name || "",
          email: user.email,
          role: user.role || "admin",
          permissions: {
            dashboard: user.permissions?.dashboard ?? true,
            employees: user.permissions?.employees ?? true,
            leaves: user.permissions?.leaves ?? true,
            hrServices: user.permissions?.hrServices ?? true,
            settings: user.permissions?.settings ?? true,
          },
        };

        // Update stored user data
        setUser(structuredUser);

        return {
          message: message || "Profile updated successfully",
          user: structuredUser,
        };
      }

      return response.data;
    } catch (error: any) {
      console.log("Update profile failed:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update profile",
      );
    }
  }

  logout(): void {
    clearAuthData();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}

export default new AuthService();
