import { useState, useEffect } from "react";
import { useAnalytics } from "../../contexts/AnalyticsContext";
import { useInvoice } from "../../contexts/InvoiceContext";
import { useAppointment } from "../../contexts/AppointmentContext";
import { useWaitingRoom } from "../../contexts/WaitingRoomContext";

const DashboardStats = () => {
  const { analyticsData, getAppointmentStats, refreshAnalytics } =
    useAnalytics();
  const { getTotalRevenue, getTotalPendingAmount, getOverduePayments } =
    useInvoice();
  const { getAppointmentsForToday } = useAppointment();
  const { waitingRoom } = useWaitingRoom();

  const [timeFrame, setTimeFrame] = useState("daily");
  const [stats, setStats] = useState({
    appointments: {
      today: 0,
      completed: 0,
      canceled: 0,
      noShow: 0,
    },
    waitingRoom: {
      current: 0,
      averageWait: 0,
    },
    finances: {
      revenue: 0,
      pending: 0,
      overdue: 0,
    },
  });

  useEffect(() => {
    // Fetch initial stats
    refreshAnalytics();
    fetchSummaryStats();
  }, []);

  useEffect(() => {
    // Update stats when time frame changes
    const appointmentStats = getAppointmentStats(timeFrame);

    if (appointmentStats && appointmentStats.length > 0) {
      // Just use the most recent stats for the selected period
      const latestStats = appointmentStats[appointmentStats.length - 1];

      setStats((prev) => ({
        ...prev,
        appointments: {
          ...prev.appointments,
          completed: latestStats.completed,
          canceled: latestStats.canceled,
          noShow: latestStats.noShow,
        },
      }));
    }
  }, [timeFrame, analyticsData, getAppointmentStats]);

  const fetchSummaryStats = async () => {
    try {
      // Get today's appointments
      const todayAppointments = await getAppointmentsForToday();

      // Get waiting room data
      const currentWaitingCount = waitingRoom?.currentQueue?.length || 0;

      // Calculate average waiting time (simplified)
      const waitingHistory = waitingRoom?.history || [];
      const totalWaitTime = waitingHistory.reduce(
        (sum, item) => sum + (item.waitingTime || 0),
        0
      );
      const averageWaitTime =
        waitingHistory.length > 0
          ? Math.round(totalWaitTime / waitingHistory.length)
          : 0;

      // Get financial data
      const totalRevenue = getTotalRevenue() || 0;
      const pendingAmount = getTotalPendingAmount() || 0;
      const overduePayments = getOverduePayments() || [];
      const overdueAmount = overduePayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      setStats({
        appointments: {
          today: todayAppointments.length,
          completed: stats.appointments.completed, // Keep existing value
          canceled: stats.appointments.canceled, // Keep existing value
          noShow: stats.appointments.noShow, // Keep existing value
        },
        waitingRoom: {
          current: currentWaitingCount,
          averageWait: averageWaitTime,
        },
        finances: {
          revenue: totalRevenue,
          pending: pendingAmount,
          overdue: overdueAmount,
        },
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleTimeFrameChange = (newValue) => {
    setTimeFrame(newValue);
  };

  // Stat card component
  const StatCard = ({ title, value, icon, bgColor, borderColor, subtitle }) => (
    <div
      className={`bg-white rounded-lg shadow p-4 border-l-4 ${borderColor} hover:shadow-lg transition-transform duration-200 transform hover:-translate-y-1`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`${bgColor} text-white p-2 rounded-md`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Dashboard Overview
          </h2>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => handleTimeFrameChange("daily")}
              className={`px-4 py-2 text-sm font-medium ${
                timeFrame === "daily"
                  ? "bg-indigo-50 text-indigo-600 border-indigo-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } border rounded-l-lg focus:z-10 focus:outline-none`}
            >
              Daily
            </button>
            <button
              onClick={() => handleTimeFrameChange("weekly")}
              className={`px-4 py-2 text-sm font-medium ${
                timeFrame === "weekly"
                  ? "bg-indigo-50 text-indigo-600 border-indigo-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } border-t border-b border-r focus:z-10 focus:outline-none`}
            >
              Weekly
            </button>
            <button
              onClick={() => handleTimeFrameChange("monthly")}
              className={`px-4 py-2 text-sm font-medium ${
                timeFrame === "monthly"
                  ? "bg-indigo-50 text-indigo-600 border-indigo-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } border-t border-b border-r rounded-r-lg focus:z-10 focus:outline-none`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Appointments */}
          <StatCard
            title="Today's Appointments"
            value={stats.appointments.today}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            }
            bgColor="bg-blue-500"
            borderColor="border-blue-500"
          />

          {/* Patients Waiting */}
          <StatCard
            title="Patients in Waiting Room"
            value={stats.waitingRoom.current}
            subtitle={`Avg. wait: ${stats.waitingRoom.averageWait} min`}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            }
            bgColor="bg-amber-500"
            borderColor="border-amber-500"
          />

          {/* Completed Appointments */}
          <StatCard
            title="Completed Appointments"
            value={stats.appointments.completed}
            subtitle={
              timeFrame === "daily"
                ? "Today"
                : timeFrame === "weekly"
                ? "This week"
                : "This month"
            }
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            }
            bgColor="bg-green-500"
            borderColor="border-green-500"
          />

          {/* Revenue */}
          <StatCard
            title="Total Revenue"
            value={`$${stats.finances.revenue.toFixed(2)}`}
            subtitle={`Pending: $${stats.finances.pending.toFixed(2)}`}
            icon={
              <svg
                className="w-5 h-5"
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
            bgColor="bg-purple-500"
            borderColor="border-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointment Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Appointment Status
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">
                  Completed
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {stats.appointments.completed}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${stats.appointments.completed ? 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">
                  Canceled
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {stats.appointments.canceled}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${stats.appointments.canceled ? 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">
                  No-Show
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {stats.appointments.noShow}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${stats.appointments.noShow ? 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Financial Status
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">
                  Revenue
                </span>
                <span className="text-sm font-medium text-gray-600">
                  ${stats.finances.revenue.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">
                  Pending
                </span>
                <span className="text-sm font-medium text-gray-600">
                  ${stats.finances.pending.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.finances.pending
                        ? (stats.finances.pending / stats.finances.revenue) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">
                  Overdue
                </span>
                <span className="text-sm font-medium text-gray-600">
                  ${stats.finances.overdue.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.finances.overdue
                        ? (stats.finances.overdue / stats.finances.revenue) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
