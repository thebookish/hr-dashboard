import axiosInstance from "@/utils/axiosInstance";
import { setToken, setUser, removeToken } from "@/utils/storage";

export interface UserModel {
  id: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
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

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      const { token, user } = response.data;

      if (token && user) {
        setToken(token);
        setUser(user);
      }

      return response.data;
    } catch (error: any) {
      console.error("Login API failed:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/register", data);
      return response.data;
    } catch (error: any) {
      console.error("Registration API failed:", error);
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  }

  async sendOTP(email: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post("/auth/send-otp", { email });
      return response.data;
    } catch (error: any) {
      console.error("Send OTP API failed:", error);
      throw new Error(error.response?.data?.message || "Failed to send OTP");
    }
  }

  async verifyOTP(data: OTPData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/verify-otp", data);
      const { token, user } = response.data;

      if (token) {
        setToken(token);
        setUser(user);
      }

      return response.data;
    } catch (error: any) {
      console.error("OTP verification API failed:", error);
      throw new Error(
        error.response?.data?.message || "OTP verification failed",
      );
    }
  }

  logout(): void {
    removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}

export default new AuthService();
