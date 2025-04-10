import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useTimeSlot } from "../../contexts/TimeSlotContext";
import { useAuth } from "../../contexts/AuthContext";

const UnavailabilityCalendar = () => {
  const { currentUser } = useAuth();
  const {
    doctorUnavailability,
    addUnavailabilityPeriod,
    deleteUnavailabilityPeriod,
    getDoctorUnavailability,
  } = useTimeSlot();

  const [unavailabilityPeriods, setUnavailabilityPeriods] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUnavailability, setNewUnavailability] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
    isAllDay: true,
    startTime: "09:00",
    endTime: "17:00",
    isRecurring: false,
    recurrencePattern: null,
  });

  useEffect(() => {
    if (currentUser && currentUser.role === "doctor") {
      const doctorUnavailabilityPeriods = getDoctorUnavailability(
        currentUser.id
      );
      setUnavailabilityPeriods(doctorUnavailabilityPeriods);
    }
  }, [currentUser, doctorUnavailability, getDoctorUnavailability]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewUnavailability({
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      reason: "",
      isAllDay: true,
      startTime: "09:00",
      endTime: "17:00",
      isRecurring: false,
      recurrencePattern: null,
    });
  };

  const handleAddUnavailability = () => {
    if (!newUnavailability.reason) {
      alert("Please provide a reason for unavailability");
      return;
    }

    addUnavailabilityPeriod(
      currentUser.id,
      newUnavailability.startDate,
      newUnavailability.endDate,
      newUnavailability.reason,
      newUnavailability.isAllDay ? null : newUnavailability.startTime,
      newUnavailability.isAllDay ? null : newUnavailability.endTime,
      newUnavailability.isRecurring,
      newUnavailability.recurrencePattern
    );

    handleCloseDialog();
  };

  const handleDeleteUnavailability = (unavailabilityId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this unavailability period?"
    );
    if (confirmed) {
      deleteUnavailabilityPeriod(unavailabilityId);
    }
  };

  const renderUnavailabilityList = () => {
    if (unavailabilityPeriods.length === 0) {
      return (
        <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-500 text-sm">
            No unavailability periods have been scheduled.
          </p>
        </div>
      );
    }

    return unavailabilityPeriods.map((period) => (
      <div
        key={period.id}
        className="mb-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">{period.reason}</h3>
          <button
            onClick={() => handleDeleteUnavailability(period.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-600">
            From: {format(new Date(period.startDate), "MMM d, yyyy")}
            {period.startTime && ` at ${period.startTime}`}
          </p>
          <p className="text-sm text-gray-600">
            To: {format(new Date(period.endDate), "MMM d, yyyy")}
            {period.endTime && ` at ${period.endTime}`}
          </p>
        </div>

        <div className="mt-2 flex gap-2">
          {!period.startTime && !period.endTime && (
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
              All Day
            </span>
          )}
          {period.isRecurring && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              Recurring
            </span>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Manage Unavailability
          </h2>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
            onClick={handleOpenDialog}
          >
            Add Unavailability
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Mark periods when you are unavailable for appointments. This will
          prevent patients from booking appointments during these times.
        </p>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Unavailability Periods
          </h3>
          {renderUnavailabilityList()}
        </div>
      </div>

      {/* Add Unavailability Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Add Unavailability Period
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={newUnavailability.reason}
                    onChange={(e) =>
                      setNewUnavailability((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={newUnavailability.startDate}
                      onChange={(e) =>
                        setNewUnavailability((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={newUnavailability.endDate}
                      onChange={(e) =>
                        setNewUnavailability((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      min={newUnavailability.startDate}
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      checked={newUnavailability.isAllDay}
                      onChange={(e) =>
                        setNewUnavailability((prev) => ({
                          ...prev,
                          isAllDay: e.target.checked,
                        }))
                      }
                    />
                    <span className="ml-2 text-sm text-gray-700">All Day</span>
                  </label>
                </div>

                {!newUnavailability.isAllDay && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={newUnavailability.startTime}
                        onChange={(e) =>
                          setNewUnavailability((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={newUnavailability.endTime}
                        onChange={(e) =>
                          setNewUnavailability((prev) => ({
                            ...prev,
                            endTime: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      checked={newUnavailability.isRecurring}
                      onChange={(e) =>
                        setNewUnavailability((prev) => ({
                          ...prev,
                          isRecurring: e.target.checked,
                        }))
                      }
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Recurring
                    </span>
                  </label>
                </div>

                {newUnavailability.isRecurring && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recurrence Pattern
                    </label>
                    <select
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={newUnavailability.recurrencePattern || ""}
                      onChange={(e) =>
                        setNewUnavailability((prev) => ({
                          ...prev,
                          recurrencePattern: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select a pattern</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={handleCloseDialog}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={handleAddUnavailability}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnavailabilityCalendar;
