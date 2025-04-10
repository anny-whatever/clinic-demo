import { createContext, useState, useEffect, useContext } from "react";
import {
  format,
  startOfWeek,
  startOfMonth,
  parseISO,
  differenceInDays,
} from "date-fns";
import { useAppointment } from "./AppointmentContext";
import { useWaitingRoom } from "./WaitingRoomContext";
import { useInvoice } from "./InvoiceContext";

const AnalyticsContext = createContext();

export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsProvider = ({ children }) => {
  // Use all the necessary contexts to generate analytics
  const { appointments } = useAppointment() || { appointments: [] };
  const waitingRoomContext = useWaitingRoom();
  const invoiceContext = useInvoice();

  const [analyticsData, setAnalyticsData] = useState({
    appointmentStats: {
      daily: [],
      weekly: [],
      monthly: [],
    },
    doctorPerformance: [],
    financialSummary: {
      daily: [],
      weekly: [],
      monthly: [],
    },
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const storedAnalyticsData = localStorage.getItem("cms_analyticsData");
    if (storedAnalyticsData) {
      setAnalyticsData(JSON.parse(storedAnalyticsData));
    }
  }, []);

  // Calculate and update analytics data
  useEffect(() => {
    if (appointments.length > 0 && waitingRoomContext && invoiceContext) {
      updateAnalyticsData();
    }
  }, [appointments, waitingRoomContext, invoiceContext]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cms_analyticsData", JSON.stringify(analyticsData));
  }, [analyticsData]);

  // Calculate appointment statistics
  const calculateAppointmentStats = () => {
    const today = new Date();
    const stats = {
      daily: [],
      weekly: [],
      monthly: [],
    };

    // Daily stats for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = format(date, "yyyy-MM-dd");

      const dailyAppointments = appointments.filter(
        (appointment) => appointment.date === dateString
      );

      const total = dailyAppointments.length;
      const completed = dailyAppointments.filter(
        (app) => app.status === "completed"
      ).length;
      const canceled = dailyAppointments.filter(
        (app) => app.status === "canceled"
      ).length;
      const noShow = dailyAppointments.filter(
        (app) => app.status === "no-show"
      ).length;

      stats.daily.push({
        date: dateString,
        total,
        completed,
        canceled,
        noShow,
      });
    }

    // Weekly stats (simplified for demo)
    const thisWeek = format(startOfWeek(today), "yyyy-'W'ww");
    const lastWeek = format(
      startOfWeek(new Date(today.setDate(today.getDate() - 7))),
      "yyyy-'W'ww"
    );

    stats.weekly = [
      {
        week: lastWeek,
        total: 120,
        completed: 100,
        canceled: 15,
        noShow: 5,
      },
      {
        week: thisWeek,
        total: 115,
        completed: 95,
        canceled: 12,
        noShow: 8,
      },
    ];

    // Monthly stats (simplified for demo)
    const thisMonth = format(startOfMonth(today), "yyyy-MM");
    const lastMonth = format(
      startOfMonth(new Date(today.setMonth(today.getMonth() - 1))),
      "yyyy-MM"
    );

    stats.monthly = [
      {
        month: lastMonth,
        total: 480,
        completed: 400,
        canceled: 60,
        noShow: 20,
      },
      {
        month: thisMonth,
        total: 450,
        completed: 380,
        canceled: 55,
        noShow: 15,
      },
    ];

    return stats;
  };

  // Calculate doctor performance metrics
  const calculateDoctorPerformance = () => {
    // Get unique doctor IDs from appointments
    const doctorIds = [...new Set(appointments.map((app) => app.doctorId))];

    return doctorIds.map((doctorId) => {
      const doctorAppointments = appointments.filter(
        (app) => app.doctorId === doctorId
      );

      const appointmentsCompleted = doctorAppointments.filter(
        (app) => app.status === "completed"
      ).length;

      // Calculate average duration (in minutes)
      const completedWithCheckout = doctorAppointments.filter(
        (app) =>
          app.status === "completed" && app.checkoutTime && app.checkedInTime
      );

      let averageDuration = 0;
      if (completedWithCheckout.length > 0) {
        const totalDuration = completedWithCheckout.reduce((total, app) => {
          const duration =
            (new Date(app.checkoutTime) - new Date(app.checkedInTime)) /
            (1000 * 60);
          return total + duration;
        }, 0);
        averageDuration = Math.round(
          totalDuration / completedWithCheckout.length
        );
      }

      // Calculate cancellation rate
      const cancelationRate =
        doctorAppointments.length > 0
          ? doctorAppointments.filter((app) => app.status === "canceled")
              .length / doctorAppointments.length
          : 0;

      // Get average wait time from waiting room context
      const averageWaitTime =
        waitingRoomContext?.getAverageWaitingTime(doctorId) || 0;

      // Calculate revenue
      let revenue = 0;
      doctorAppointments.forEach((app) => {
        const invoice = invoiceContext?.getInvoiceByAppointmentId(app.id);
        if (
          invoice &&
          (invoice.paymentStatus === "paid" ||
            invoice.paymentStatus === "partial")
        ) {
          revenue +=
            invoice.paymentStatus === "paid"
              ? invoice.totalAmount
              : invoice.paidAmount || 0;
        }
      });

      return {
        doctorId,
        appointmentsCompleted,
        averageDuration,
        cancelationRate,
        averageWaitTime,
        revenue,
      };
    });
  };

  // Get financial summary from invoice context
  const getFinancialSummary = () => {
    return {
      daily: invoiceContext?.getFinancialSummary("daily") || [],
      weekly: invoiceContext?.getFinancialSummary("weekly") || [],
      monthly: invoiceContext?.getFinancialSummary("monthly") || [],
    };
  };

  // Update all analytics data
  const updateAnalyticsData = () => {
    const newAnalyticsData = {
      appointmentStats: calculateAppointmentStats(),
      doctorPerformance: calculateDoctorPerformance(),
      financialSummary: getFinancialSummary(),
    };

    setAnalyticsData(newAnalyticsData);
    return newAnalyticsData;
  };

  // Get appointment statistics for a specific period
  const getAppointmentStats = (period = "daily") => {
    return analyticsData.appointmentStats[period] || [];
  };

  // Get doctor performance metrics
  const getDoctorPerformance = () => {
    return analyticsData.doctorPerformance || [];
  };

  // Get doctor performance by ID
  const getDoctorPerformanceById = (doctorId) => {
    return analyticsData.doctorPerformance.find(
      (doc) => doc.doctorId === doctorId
    );
  };

  // Get financial summary for a specific period
  const getFinancialSummaryByPeriod = (period = "daily") => {
    return analyticsData.financialSummary[period] || [];
  };

  // Get waiting time statistics
  const getWaitingTimeStats = () => {
    const waitingRoomHistory =
      waitingRoomContext?.getWaitingRoomHistory() || [];

    const averageWaitTime =
      waitingRoomHistory.length > 0
        ? Math.round(
            waitingRoomHistory.reduce(
              (total, item) => total + item.waitingTime,
              0
            ) / waitingRoomHistory.length
          )
        : 0;

    // Calculate waiting time per doctor
    const doctorIds = [
      ...new Set(waitingRoomHistory.map((item) => item.doctorId)),
    ];
    const doctorWaitTimes = doctorIds.map((doctorId) => {
      const doctorHistory = waitingRoomHistory.filter(
        (item) => item.doctorId === doctorId
      );
      const avgTime =
        doctorHistory.length > 0
          ? Math.round(
              doctorHistory.reduce(
                (total, item) => total + item.waitingTime,
                0
              ) / doctorHistory.length
            )
          : 0;

      return {
        doctorId,
        averageWaitTime: avgTime,
      };
    });

    return {
      averageWaitTime,
      doctorWaitTimes,
    };
  };

  // Get appointment completion rate by doctor
  const getCompletionRateByDoctor = () => {
    const doctorIds = [...new Set(appointments.map((app) => app.doctorId))];

    return doctorIds.map((doctorId) => {
      const doctorAppointments = appointments.filter(
        (app) => app.doctorId === doctorId
      );
      const completed = doctorAppointments.filter(
        (app) => app.status === "completed"
      ).length;
      const total = doctorAppointments.length;

      return {
        doctorId,
        completionRate: total > 0 ? completed / total : 0,
        totalAppointments: total,
        completedAppointments: completed,
      };
    });
  };

  // Force a refresh of analytics data
  const refreshAnalytics = () => {
    return updateAnalyticsData();
  };

  const value = {
    analyticsData,
    getAppointmentStats,
    getDoctorPerformance,
    getDoctorPerformanceById,
    getFinancialSummaryByPeriod,
    getWaitingTimeStats,
    getCompletionRateByDoctor,
    refreshAnalytics,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsContext;
