import { useState } from "react";
import DashboardStats from "../components/analytics/DashboardStats";
import DoctorPerformance from "../components/analytics/DoctorPerformance";
import FinancialSummary from "../components/analytics/FinancialSummary";
import { useAnalytics } from "../contexts/AnalyticsContext";
import { initializeEnhancedDemoData } from "../utils/enhancedDemoData";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRegeneratingData, setIsRegeneratingData] = useState(false);
  const { refreshAnalytics } = useAnalytics();

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAnalytics();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000); // Add a slight delay to show the refresh animation
  };

  const handleRegenerateData = async () => {
    setIsRegeneratingData(true);

    // Regenerate enhanced demo data
    initializeEnhancedDemoData();

    // Refresh analytics to reflect the new data
    await refreshAnalytics();

    setTimeout(() => {
      setIsRegeneratingData(false);
    }, 1500); // Longer delay to show the operation is more significant
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <DashboardStats />;
      case 1:
        return <DoctorPerformance />;
      case 2:
        return <FinancialSummary />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Analytics Dashboard
          </h1>
          <div className="flex space-x-3">
            <button
              className={`flex items-center px-4 py-2 rounded-md ${
                isRegeneratingData
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
              onClick={handleRegenerateData}
              disabled={isRegeneratingData || isRefreshing}
              title="Regenerate demo data with new random values"
            >
              {isRegeneratingData ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Regenerating...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                  Regenerate Demo Data
                </>
              )}
            </button>

            <button
              className={`flex items-center px-4 py-2 rounded-md ${
                isRefreshing
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
              onClick={handleRefresh}
              disabled={isRefreshing || isRegeneratingData}
            >
              {isRefreshing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  Refresh Data
                </>
              )}
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6"></div>

        <div className="flex flex-wrap gap-2 mb-4">
          <TabButton
            icon={
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                ></path>
              </svg>
            }
            label="Overview"
            isActive={activeTab === 0}
            onClick={() => handleTabChange(0)}
          />
          <TabButton
            icon={
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            }
            label="Doctor Performance"
            isActive={activeTab === 1}
            onClick={() => handleTabChange(1)}
          />
          <TabButton
            icon={
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            }
            label="Financial Summary"
            isActive={activeTab === 2}
            onClick={() => handleTabChange(2)}
          />
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
};

// Custom Tab Button component
const TabButton = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium focus:outline-none transition-colors duration-200 ${
      isActive
        ? "bg-indigo-600 text-white"
        : "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default Analytics;
