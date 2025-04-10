import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import { useAppointment } from "../contexts/AppointmentContext";
import { usePrescriptions } from "../contexts/PrescriptionContext";
import { useEffect, useState } from "react";

const DoctorDashboard = () => {
  const { currentUser } = useAuth();
  const { appointments } = useAppointment() || { appointments: [] };
  const { prescriptions } = usePrescriptions() || { prescriptions: [] };
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingPrescriptions: 0,
    totalPatientsSeen: 0,
  });

  useEffect(() => {
    if (appointments && appointments.length > 0) {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Calculate today's appointments for the current doctor
      const todayAppts = appointments.filter(
        (app) => app.date === today && app.doctorId === currentUser?.id
      ).length;

      // Calculate pending prescriptions (assuming 'draft' status for pending)
      const pending =
        prescriptions?.filter(
          (rx) => rx.doctorId === currentUser?.id && rx.status === "draft"
        ).length || 0;

      // Calculate total patients seen this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const completedThisMonth = appointments.filter((app) => {
        const appDate = new Date(app.date);
        return (
          app.doctorId === currentUser?.id &&
          app.status === "completed" &&
          appDate.getMonth() === currentMonth &&
          appDate.getFullYear() === currentYear
        );
      }).length;

      setStats({
        todayAppointments: todayAppts,
        pendingPrescriptions: pending,
        totalPatientsSeen: completedThisMonth,
      });
    }
  }, [appointments, prescriptions, currentUser]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Welcome, {currentUser?.name}
      </h1>
      <p className="text-gray-600 mb-6">
        This is the Doctor Dashboard. From here, you can manage your
        appointments, create prescriptions, and view patient information.
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

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h2 className="text-lg font-medium text-green-800 mb-2">
            Pending Prescriptions
          </h2>
          <div className="text-3xl font-bold text-green-600">
            {stats.pendingPrescriptions}
          </div>
          <p className="text-sm text-green-500 mt-1">
            {stats.pendingPrescriptions === 0
              ? "No pending prescriptions"
              : `${stats.pendingPrescriptions} prescription${
                  stats.pendingPrescriptions !== 1 ? "s" : ""
                } pending`}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h2 className="text-lg font-medium text-purple-800 mb-2">
            Total Patients Seen
          </h2>
          <div className="text-3xl font-bold text-purple-600">
            {stats.totalPatientsSeen}
          </div>
          <p className="text-sm text-purple-500 mt-1">This month</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to={ROUTES.DOCTOR.APPOINTMENTS}
            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 text-center"
          >
            View Appointments
          </Link>
          <Link
            to={ROUTES.DOCTOR.PRESCRIPTIONS}
            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 text-center"
          >
            Create Prescription
          </Link>
          <Link
            to={ROUTES.DOCTOR.TEMPLATES}
            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 text-center"
          >
            Manage Templates
          </Link>
          <Link
            to={ROUTES.DOCTOR.UNAVAILABILITY}
            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 text-center"
          >
            Update Availability
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
