import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import { useAppointment } from "../contexts/AppointmentContext";
import { useInvoice } from "../contexts/InvoiceContext";
import { useWaitingRoom } from "../contexts/WaitingRoomContext";
import { useEffect, useState } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssignmentIcon from "@mui/icons-material/Assignment";

const ReceptionistDashboard = () => {
  const { currentUser } = useAuth();
  const { appointments } = useAppointment() || { appointments: [] };
  const { invoices } = useInvoice() || { invoices: [] };
  const { waitingRoom } = useWaitingRoom() || {
    waitingRoom: { currentQueue: [] },
  };
  const [stats, setStats] = useState({
    todayAppointments: 0,
    waitingPatients: 0,
    pendingPayments: 0,
    pendingAmount: 0,
  });

  useEffect(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Calculate today's appointments
    const todayAppts =
      appointments?.filter((app) => app.date === today).length || 0;

    // Get waiting room count
    const waitingCount = waitingRoom?.currentQueue?.length || 0;

    // Calculate pending payments
    const pendingInvoices =
      invoices?.filter(
        (inv) =>
          inv.paymentStatus === "pending" || inv.paymentStatus === "partial"
      ) || [];

    // Calculate total pending amount
    const totalPending = pendingInvoices.reduce((total, inv) => {
      if (inv.paymentStatus === "pending") {
        return total + inv.totalAmount;
      } else if (inv.paymentStatus === "partial") {
        // For partial payments, calculate the remaining amount
        return total + (inv.totalAmount - (inv.paidAmount || 0));
      }
      return total;
    }, 0);

    setStats({
      todayAppointments: todayAppts,
      waitingPatients: waitingCount,
      pendingPayments: pendingInvoices.length,
      pendingAmount: totalPending,
    });
  }, [appointments, waitingRoom, invoices]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Welcome, {currentUser?.name}
      </h1>
      <p className="text-gray-600 mb-6">
        This is the Receptionist Dashboard. From here, you can manage
        appointments, handle patient check-ins/check-outs, and process payments.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="text-lg font-medium text-blue-800 mb-2">
            Today's Appointments
          </h2>
          <div className="text-3xl font-bold text-blue-600">
            {stats.todayAppointments}
          </div>
          <p className="text-sm text-blue-500 mt-1">
            {stats.todayAppointments === 0
              ? "No appointments scheduled for today"
              : `${stats.todayAppointments} appointment${
                  stats.todayAppointments !== 1 ? "s" : ""
                } today`}
          </p>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h2 className="text-lg font-medium text-amber-800 mb-2">
            Waiting Room
          </h2>
          <div className="text-3xl font-bold text-amber-600">
            {stats.waitingPatients}
          </div>
          <p className="text-sm text-amber-500 mt-1">
            {stats.waitingPatients === 0
              ? "No patients currently waiting"
              : `${stats.waitingPatients} patient${
                  stats.waitingPatients !== 1 ? "s" : ""
                } waiting`}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h2 className="text-lg font-medium text-red-800 mb-2">
            Pending Payments
          </h2>
          <div className="text-3xl font-bold text-red-600">
            {stats.pendingPayments}
          </div>
          <p className="text-sm text-red-500 mt-1">
            {stats.pendingPayments === 0
              ? "No pending payments"
              : `$${stats.pendingAmount.toFixed(2)} pending`}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to={`${ROUTES.RECEPTIONIST.APPOINTMENTS}?tab=scheduler`}
            className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 text-center flex flex-col items-center justify-center"
          >
            <CalendarMonthIcon className="mb-2" />
            <span>Appointment Scheduler</span>
          </Link>
          <Link
            to={ROUTES.RECEPTIONIST.WAITING_ROOM}
            className="bg-amber-600 text-white p-4 rounded-lg hover:bg-amber-700 text-center flex flex-col items-center justify-center"
          >
            <EventNoteIcon className="mb-2" />
            <span>Check-in Patient</span>
          </Link>
          <Link
            to={ROUTES.RECEPTIONIST.INVOICES}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 text-center flex flex-col items-center justify-center"
          >
            <MonetizationOnIcon className="mb-2" />
            <span>Process Payment</span>
          </Link>
          <Link
            to={ROUTES.RECEPTIONIST.PATIENTS}
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 text-center flex flex-col items-center justify-center"
          >
            <PersonAddIcon className="mb-2" />
            <span>Register Patient</span>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Waiting Room Status
        </h2>
        {stats.waitingPatients > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {waitingRoom?.currentQueue?.map((patient) => (
                  <tr key={patient.appointmentId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.patientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {patient.doctorName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(patient.checkedInTime).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.priority === 0
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {patient.priority === 0 ? "Urgent" : "Normal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-500 text-center py-4">
              No patients in waiting room
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
