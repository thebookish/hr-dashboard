// Storage utilities for authentication

export interface UserModel {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: {
    dashboard: boolean;
    employees: boolean;
    leaves: boolean;
    hrServices: boolean;
    settings: boolean;
  };
}

const TOKEN_KEY = "hrms_token";
const USER_KEY = "hrms_user";

// Check if we're in browser environment
const isBrowser = typeof window !== "undefined";

// Token management
export const getToken = (): string | null => {
  if (!isBrowser) return null;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const setToken = (token: string): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error setting token:", error);
  }
};

export const removeToken = (): void => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

// User data management
export const getUser = (): UserModel | null => {
  if (!isBrowser) {
    console.log("[DEBUG] getUser: Not in browser environment");
    return null;
  }
  try {
    const userData = localStorage.getItem(USER_KEY);
    console.log("[DEBUG] getUser: Raw localStorage data:", userData);
    if (!userData) {
      console.log("[DEBUG] getUser: No user data in localStorage");
      return null;
    }
    const parsedUser = JSON.parse(userData);
    console.log("[DEBUG] getUser: Parsed user from localStorage:", parsedUser);
    console.log("[DEBUG] getUser: User permissions:", parsedUser?.permissions);
    return parsedUser;
  } catch (error) {
    console.error("[DEBUG] getUser: Error getting user:", error);
    return null;
  }
};

export const setUser = (user: UserModel): void => {
  if (!isBrowser) {
    console.log("[DEBUG] setUser: Not in browser environment");
    return;
  }
  try {
    console.log("[DEBUG] setUser: Storing user in localStorage:", user);
    console.log(
      "[DEBUG] setUser: User permissions being stored:",
      user?.permissions,
    );
    const userString = JSON.stringify(user);
    console.log("[DEBUG] setUser: Stringified user data:", userString);
    localStorage.setItem(USER_KEY, userString);

    // Verify storage
    const storedData = localStorage.getItem(USER_KEY);
    console.log("[DEBUG] setUser: Verification - stored data:", storedData);
  } catch (error) {
    console.error("[DEBUG] setUser: Error setting user:", error);
  }
};

export const removeUser = (): void => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Error removing user:", error);
  }
};

// Authentication check
export const isAuthenticated = (): boolean => {
  const token = getToken();
  const user = getUser();
  return !!token && !!user;
};

// Clear all auth data
export const clearAuthData = (): void => {
  removeToken();
  removeUser();
};
