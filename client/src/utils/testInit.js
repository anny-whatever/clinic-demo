import { STORAGE_KEYS } from "./localStorage";
import { DEMO_DATA_INITIALIZED } from "./constants";

/**
 * Test users for the application
 */
const testUsers = [
  {
    id: "doctor1",
    username: "doctor1",
    password: "demo123",
    role: "doctor",
    name: "Dr. John Smith",
    specialization: "General Physician",
    signature: null,
  },
  {
    id: "receptionist1",
    username: "reception1",
    password: "demo123",
    role: "receptionist",
    name: "Jessica Brown",
  },
];

/**
 * Force initialization of test data in localStorage
 */
export const forceInitTestData = () => {
  try {
    // Clear current users
    localStorage.removeItem(STORAGE_KEYS.USERS);

    // Set test users directly
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(testUsers));

    // Mark as not initialized so other data will be reinitialized properly
    localStorage.removeItem(DEMO_DATA_INITIALIZED);

    console.log("Test users force initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing test users:", error);
    return false;
  }
};
