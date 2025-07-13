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
  hasPermission: (permission: keyof UserModel["permissions"]) => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    // Only run in browser
    if (typeof window !== "undefined") {
      initializeAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
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
    isLoading,
    isAuthenticated: !!user && !!user.email && !isLoading,
    login,
    logout,
    refreshUser,
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
