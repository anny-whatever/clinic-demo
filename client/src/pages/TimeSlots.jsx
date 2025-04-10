import { useState } from "react";
import TimeSlotConfiguration from "../components/doctor/TimeSlotConfiguration";
import UnavailabilityCalendar from "../components/doctor/UnavailabilityCalendar";
import { useAuth } from "../contexts/AuthContext";

const TimeSlots = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { currentUser } = useAuth();

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const isDoctor = currentUser && currentUser.role === "doctor";

  if (!isDoctor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">
            Only doctors can access the time slot management page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Time Slot Management</h1>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 mr-4 font-medium text-sm focus:outline-none ${
              activeTab === 0
                ? "text-indigo-600 border-b-2 border-indigo-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabChange(0)}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Time Slot Configuration
            </div>
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              activeTab === 1
                ? "text-indigo-600 border-b-2 border-indigo-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabChange(1)}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Unavailability Calendar
            </div>
          </button>
        </div>

        {activeTab === 0 ? (
          <TimeSlotConfiguration />
        ) : (
          <UnavailabilityCalendar />
        )}
      </div>
    </div>
  );
};

export default TimeSlots;
