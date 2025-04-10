import { useState, useEffect } from "react";
import { useAppointments } from "../contexts/AppointmentContext";
import { useAuth } from "../contexts/AuthContext";
import { APPOINTMENT_STATUS } from "../utils/constants";
import AppointmentScheduler from "../components/appointments/AppointmentScheduler";
import { USER_ROLES } from "../utils/constants";
import { useLocation } from "react-router-dom";

const Appointments = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get("tab");

  const { currentUser } = useAuth();
  const {
    appointments,
    getCurrentUserAppointments,
    updateAppointmentStatus,
    createFollowUpAppointment,
    loading,
  } = useAppointments();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [activeTab, setActiveTab] = useState(
    tabParam === "scheduler" || currentUser?.role === USER_ROLES.RECEPTIONIST
      ? "scheduler"
      : "list"
  );

  // Filter appointments by date and status
  useEffect(() => {
    const userAppointments = getCurrentUserAppointments();
    let filtered = userAppointments.filter(
      (appointment) => appointment.date === selectedDate
    );

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.status === statusFilter
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, selectedDate, statusFilter, getCurrentUserAppointments]);

  // Update tab when URL query parameter changes
  useEffect(() => {
    if (tabParam === "scheduler") {
      setActiveTab("scheduler");
    } else if (tabParam === "list") {
      setActiveTab("list");
    }
  }, [tabParam]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    await updateAppointmentStatus(appointmentId, newStatus);
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentNotes(appointment.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveNotes = async () => {
    if (selectedAppointment) {
      await updateAppointmentStatus(selectedAppointment.id, {
        notes: appointmentNotes,
      });
      setIsModalOpen(false);
    }
  };

  const handleCreateFollowUp = async () => {
    if (selectedAppointment && followUpDate) {
      const followUpData = {
        date: followUpDate,
        time: selectedAppointment.time,
        status: APPOINTMENT_STATUS.SCHEDULED,
        reason: `Follow-up from ${selectedAppointment.date}`,
      };

      await createFollowUpAppointment(selectedAppointment.id, followUpData);
      setIsModalOpen(false);
      setFollowUpDate("");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading appointments...</p>
      </div>
    );
  }

  // Determine if the user is a receptionist
  const isReceptionist = currentUser?.role === USER_ROLES.RECEPTIONIST;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>

      {/* Tabs for receptionist */}
      {isReceptionist && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                className={`${
                  activeTab === "scheduler"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
                onClick={() => setActiveTab("scheduler")}
              >
                Appointment Scheduler
              </button>
              <button
                className={`${
                  activeTab === "list"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab("list")}
              >
                Appointment List
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Show scheduler for receptionists if on scheduler tab */}
      {isReceptionist && activeTab === "scheduler" ? (
        <AppointmentScheduler />
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                className="form-input rounded-md shadow-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                className="form-select rounded-md shadow-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value={APPOINTMENT_STATUS.SCHEDULED}>Scheduled</option>
                <option value={APPOINTMENT_STATUS.CONFIRMED}>Confirmed</option>
                <option value={APPOINTMENT_STATUS.CHECKED_IN}>
                  Checked In
                </option>
                <option value={APPOINTMENT_STATUS.IN_PROGRESS}>
                  In Progress
                </option>
                <option value={APPOINTMENT_STATUS.COMPLETED}>Completed</option>
                <option value={APPOINTMENT_STATUS.CANCELLED}>Cancelled</option>
                <option value={APPOINTMENT_STATUS.NO_SHOW}>No Show</option>
              </select>
            </div>
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">
                No appointments found for the selected criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.patientName || appointment.patientId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === APPOINTMENT_STATUS.COMPLETED
                              ? "bg-green-100 text-green-800"
                              : appointment.status ===
                                APPOINTMENT_STATUS.IN_PROGRESS
                              ? "bg-blue-100 text-blue-800"
                              : appointment.status ===
                                APPOINTMENT_STATUS.CHECKED_IN
                              ? "bg-yellow-100 text-yellow-800"
                              : appointment.status ===
                                APPOINTMENT_STATUS.SCHEDULED
                              ? "bg-purple-100 text-purple-800"
                              : appointment.status ===
                                APPOINTMENT_STATUS.CANCELLED
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          View
                        </button>
                        {appointment.status ===
                          APPOINTMENT_STATUS.CHECKED_IN && (
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() =>
                              handleStatusChange(
                                appointment.id,
                                APPOINTMENT_STATUS.IN_PROGRESS
                              )
                            }
                          >
                            Start
                          </button>
                        )}
                        {appointment.status ===
                          APPOINTMENT_STATUS.IN_PROGRESS && (
                          <button
                            className="text-green-600 hover:text-green-900 mr-3"
                            onClick={() =>
                              handleStatusChange(
                                appointment.id,
                                APPOINTMENT_STATUS.COMPLETED
                              )
                            }
                          >
                            Complete
                          </button>
                        )}
                        {appointment.status ===
                          APPOINTMENT_STATUS.SCHEDULED && (
                          <>
                            <button
                              className="text-yellow-600 hover:text-yellow-900 mr-3"
                              onClick={() =>
                                handleStatusChange(
                                  appointment.id,
                                  APPOINTMENT_STATUS.CONFIRMED
                                )
                              }
                            >
                              Confirm
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() =>
                                handleStatusChange(
                                  appointment.id,
                                  APPOINTMENT_STATUS.CANCELLED
                                )
                              }
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal for appointment details, notes, and follow-ups */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Appointment Details
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Patient
                </h4>
                <p className="text-gray-900">
                  {selectedAppointment.patientName ||
                    selectedAppointment.patientId}
                </p>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Date & Time
                </h4>
                <p className="text-gray-900">
                  {selectedAppointment.date} at {selectedAppointment.time}
                </p>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Reason
                </h4>
                <p className="text-gray-900">{selectedAppointment.reason}</p>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Notes
                </h4>
                <textarea
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows="4"
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="Add appointment notes..."
                ></textarea>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Schedule Follow-up
                </h4>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                onClick={handleSaveNotes}
              >
                Save Notes
              </button>
              {followUpDate && (
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                  onClick={handleCreateFollowUp}
                >
                  Create Follow-up
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
