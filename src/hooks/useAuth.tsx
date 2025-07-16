"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getToken, getUser, clearAuthData, UserModel } from "@/utils/storage";
import authService from "@/services/authService";

// Define context type
interface AuthContextType {
  user: UserModel | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserProfile: (updatedData: Partial<UserModel>) => void;
  hasPermission: (permission: keyof UserModel["permissions"]) => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Track when component is mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getToken();
        const userData = getUser();

        if (token && userData && userData.email) {
          setUser(userData);
        } else {
          setUser(null);
          clearAuthData();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuthData();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure client-side hydration is complete
    const timer = setTimeout(() => {
      initializeAuth();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });

      // Check if user has admin or admin-head role
      if (
        response.user.role !== "admin" &&
        response.user.role !== "admin-head"
      ) {
        clearAuthData();
        setUser(null);
        throw new Error("Access denied. Only HR can access this system.");
      }

      setUser(response.user);
    } catch (error) {
      console.error("Login error:", error);
      setUser(null);
      clearAuthData();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    authService.logout();
  };

  // Refresh user data from storage
  const refreshUser = async (): Promise<void> => {
    try {
      const token = getToken();
      const userData = getUser();

      if (token && userData) {
        setUser(userData);
      } else {
        setUser(null);
        clearAuthData();
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setUser(null);
      clearAuthData();
    }
  };

  // Update user profile
  const updateUserProfile = (updatedData: Partial<UserModel>): void => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      // Update in localStorage as well
      import("@/utils/storage").then(({ setUser: setStorageUser }) => {
        setStorageUser(updatedUser);
      });
    }
  };

  // Check if user has specific permission
  const hasPermission = (
    permission: keyof UserModel["permissions"],
  ): boolean => {
    if (isLoading || !user || !user.email) {
      return false;
    }

    return user.permissions?.[permission] ?? false;
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    isLoading: isLoading || !isMounted,
    isAuthenticated: !!user && !!user.email && !isLoading && isMounted,
    login,
    logout,
    refreshUser,
    updateUserProfile,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default useAuth;
