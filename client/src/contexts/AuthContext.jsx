import { createContext, useContext, useState, useEffect } from "react";
import {
  STORAGE_KEYS,
  getItem,
  setItem,
  removeItem,
} from "../utils/localStorage";

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = getItem(STORAGE_KEYS.CURRENT_USER);
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (user) => {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
    setCurrentUser(user);
    return user;
  };

  // Logout function
  const logout = () => {
    removeItem(STORAGE_KEYS.CURRENT_USER);
    setCurrentUser(null);
  };

  // Update user data
  const updateUser = (userData) => {
    const updatedUser = { ...currentUser, ...userData };
    setItem(STORAGE_KEYS.CURRENT_USER, updatedUser);
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  // Value object for the context provider
  const value = {
    currentUser,
    loading,
    login,
    logout,
    updateUser,
    hasRole,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
