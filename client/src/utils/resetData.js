/**
 * Utility to reset all localStorage data and reinitialize
 */
import { initializeDemoData } from "./demoData";
import { initializeEnhancedDemoData } from "./enhancedDemoData";
import { DEMO_DATA_INITIALIZED } from "./constants";

/**
 * Reset all application data in localStorage
 */
export const resetAllData = () => {
  try {
    // Clear all localStorage
    localStorage.clear();

    // Remove initialization flag
    localStorage.removeItem(DEMO_DATA_INITIALIZED);

    // Reinitialize basic demo data
    initializeDemoData();

    // Add enhanced demo data for analytics and rich features
    initializeEnhancedDemoData();

    console.log("All application data has been reset successfully");
    return true;
  } catch (error) {
    console.error("Error resetting application data:", error);
    return false;
  }
};
