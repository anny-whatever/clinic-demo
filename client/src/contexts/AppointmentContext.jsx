import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  STORAGE_KEYS,
  getEntities,
  getEntityById,
  addEntity,
  updateEntity,
  removeEntity,
} from "../utils/localStorage";
import { generateEntityId } from "../utils/idUtils";
import { useAuth } from "./AuthContext";
import { APPOINTMENT_STATUS } from "../utils/constants";

// Create Appointment Context
const AppointmentContext = createContext();

// Appointment Provider Component
export const AppointmentProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [doctorUnavailability, setDoctorUnavailability] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedAppointments = getEntities(STORAGE_KEYS.APPOINTMENTS);
        const storedTimeSlots = getEntities(STORAGE_KEYS.TIME_SLOTS);
        const storedUnavailability = getEntities(
          STORAGE_KEYS.DOCTOR_UNAVAILABILITY
        );

        setAppointments(storedAppointments);
        setTimeSlots(storedTimeSlots);
        setDoctorUnavailability(storedUnavailability);
      } catch (error) {
        console.error("Error loading appointment data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // APPOINTMENT METHODS

  // Get appointment by ID
  const getAppointmentById = useCallback((id) => {
    return getEntityById(STORAGE_KEYS.APPOINTMENTS, id);
  }, []);

  // Add new appointment
  const addAppointment = useCallback((appointmentData) => {
    const newAppointment = {
      id: generateEntityId("appointment"),
      status: APPOINTMENT_STATUS.SCHEDULED,
      checkedInTime: null,
      checkoutTime: null,
      waitingTime: null,
      notes: "",
      isFollowUp: false,
      previousAppointmentId: null,
      paymentStatus: "pending",
      paymentPlan: false,
      ...appointmentData,
    };

    const addedAppointment = addEntity(
      STORAGE_KEYS.APPOINTMENTS,
      newAppointment
    );
    setAppointments((prevAppointments) => [
      ...prevAppointments,
      addedAppointment,
    ]);

    return addedAppointment;
  }, []);

  // Update appointment
  const updateAppointment = useCallback((id, updates) => {
    const updatedAppointment = updateEntity(
      STORAGE_KEYS.APPOINTMENTS,
      id,
      updates
    );

    if (updatedAppointment) {
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === id ? updatedAppointment : appointment
        )
      );
    }

    return updatedAppointment;
  }, []);

  // Remove appointment
  const removeAppointment = useCallback((id) => {
    const success = removeEntity(STORAGE_KEYS.APPOINTMENTS, id);

    if (success) {
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment.id !== id)
      );
    }

    return success;
  }, []);

  // Get appointments for a specific doctor
  const getDoctorAppointments = useCallback(
    (doctorId) => {
      return appointments.filter(
        (appointment) => appointment.doctorId === doctorId
      );
    },
    [appointments]
  );

  // Get appointments for a specific patient
  const getPatientAppointments = useCallback(
    (patientId) => {
      return appointments.filter(
        (appointment) => appointment.patientId === patientId
      );
    },
    [appointments]
  );

  // Get appointments for current user (if doctor)
  const getCurrentUserAppointments = useCallback(() => {
    if (!currentUser || currentUser.role !== "doctor") return [];

    return getDoctorAppointments(currentUser.id);
  }, [currentUser, getDoctorAppointments]);

  // Get appointments for a specific date
  const getAppointmentsByDate = useCallback(
    (date) => {
      return appointments.filter((appointment) => appointment.date === date);
    },
    [appointments]
  );

  // Update appointment status
  const updateAppointmentStatus = useCallback(
    (appointmentId, status) => {
      return updateAppointment(appointmentId, { status });
    },
    [updateAppointment]
  );

  // Create follow-up appointment
  const createFollowUpAppointment = useCallback(
    (originalAppointmentId, followUpData) => {
      const originalAppointment = getAppointmentById(originalAppointmentId);

      if (!originalAppointment) {
        throw new Error("Original appointment not found");
      }

      const followUpAppointment = {
        ...followUpData,
        isFollowUp: true,
        previousAppointmentId: originalAppointmentId,
        patientId: originalAppointment.patientId,
        doctorId: originalAppointment.doctorId,
      };

      return addAppointment(followUpAppointment);
    },
    [addAppointment, getAppointmentById]
  );

  // TIME SLOT METHODS

  // Get time slot by ID
  const getTimeSlotById = useCallback((id) => {
    return getEntityById(STORAGE_KEYS.TIME_SLOTS, id);
  }, []);

  // Add new time slot
  const addTimeSlot = useCallback((timeSlotData) => {
    const newTimeSlot = {
      id: generateEntityId("timeslot"),
      isBooked: false,
      isAvailable: true,
      ...timeSlotData,
    };

    const addedTimeSlot = addEntity(STORAGE_KEYS.TIME_SLOTS, newTimeSlot);
    setTimeSlots((prevTimeSlots) => [...prevTimeSlots, addedTimeSlot]);

    return addedTimeSlot;
  }, []);

  // Update time slot
  const updateTimeSlot = useCallback((id, updates) => {
    const updatedTimeSlot = updateEntity(STORAGE_KEYS.TIME_SLOTS, id, updates);

    if (updatedTimeSlot) {
      setTimeSlots((prevTimeSlots) =>
        prevTimeSlots.map((timeSlot) =>
          timeSlot.id === id ? updatedTimeSlot : timeSlot
        )
      );
    }

    return updatedTimeSlot;
  }, []);

  // Remove time slot
  const removeTimeSlot = useCallback((id) => {
    const success = removeEntity(STORAGE_KEYS.TIME_SLOTS, id);

    if (success) {
      setTimeSlots((prevTimeSlots) =>
        prevTimeSlots.filter((timeSlot) => timeSlot.id !== id)
      );
    }

    return success;
  }, []);

  // Get time slots for a specific doctor
  const getDoctorTimeSlots = useCallback(
    (doctorId) => {
      return timeSlots.filter((timeSlot) => timeSlot.doctorId === doctorId);
    },
    [timeSlots]
  );

  // Get available time slots for a specific doctor and date
  const getAvailableTimeSlots = useCallback(
    (doctorId, date) => {
      return timeSlots.filter(
        (timeSlot) =>
          timeSlot.doctorId === doctorId &&
          timeSlot.date === date &&
          timeSlot.isAvailable &&
          !timeSlot.isBooked
      );
    },
    [timeSlots]
  );

  // Book a time slot
  const bookTimeSlot = useCallback(
    (timeSlotId) => {
      return updateTimeSlot(timeSlotId, { isBooked: true });
    },
    [updateTimeSlot]
  );

  // Generate time slots for a doctor for a specific date range
  const generateTimeSlots = useCallback(
    (doctorId, startDate, endDate, timeSlotConfig) => {
      // Implementation would depend on date manipulation library (e.g., date-fns)
      // For demo purposes, we'll just create a simple structure

      const newTimeSlots = [];
      const currentDate = new Date(startDate);
      const end = new Date(endDate);

      while (currentDate <= end) {
        const dateString = currentDate.toISOString().split("T")[0];

        // For each time in timeSlotConfig
        timeSlotConfig.forEach((config) => {
          const newTimeSlot = {
            doctorId,
            date: dateString,
            startTime: config.startTime,
            endTime: config.endTime,
            isBooked: false,
            isAvailable: true,
          };

          const addedTimeSlot = addTimeSlot(newTimeSlot);
          newTimeSlots.push(addedTimeSlot);
        });

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return newTimeSlots;
    },
    [addTimeSlot]
  );

  // DOCTOR UNAVAILABILITY METHODS

  // Get doctor unavailability by ID
  const getUnavailabilityById = useCallback((id) => {
    return getEntityById(STORAGE_KEYS.DOCTOR_UNAVAILABILITY, id);
  }, []);

  // Add new doctor unavailability
  const addUnavailability = useCallback(
    (unavailabilityData) => {
      const newUnavailability = {
        id: generateEntityId("unavailability"),
        isRecurring: false,
        recurrencePattern: null,
        ...unavailabilityData,
      };

      const addedUnavailability = addEntity(
        STORAGE_KEYS.DOCTOR_UNAVAILABILITY,
        newUnavailability
      );
      setDoctorUnavailability((prevUnavailability) => [
        ...prevUnavailability,
        addedUnavailability,
      ]);

      // Update affected time slots to be unavailable
      if (addedUnavailability.doctorId) {
        const affectedTimeSlots = timeSlots.filter(
          (timeSlot) =>
            timeSlot.doctorId === addedUnavailability.doctorId &&
            timeSlot.date >= addedUnavailability.startDate &&
            timeSlot.date <= addedUnavailability.endDate
        );

        affectedTimeSlots.forEach((timeSlot) => {
          if (!timeSlot.isBooked) {
            updateTimeSlot(timeSlot.id, { isAvailable: false });
          }
        });
      }

      return addedUnavailability;
    },
    [timeSlots, updateTimeSlot]
  );

  // Update doctor unavailability
  const updateUnavailability = useCallback(
    (id, updates) => {
      const updatedUnavailability = updateEntity(
        STORAGE_KEYS.DOCTOR_UNAVAILABILITY,
        id,
        updates
      );

      if (updatedUnavailability) {
        setDoctorUnavailability((prevUnavailability) =>
          prevUnavailability.map((unavailability) =>
            unavailability.id === id ? updatedUnavailability : unavailability
          )
        );

        // Update affected time slots based on new unavailability data
        if (updatedUnavailability.doctorId) {
          // This would require more complex logic in a real implementation
          // For demo, we'll just mark all time slots in the range as unavailable
          const affectedTimeSlots = timeSlots.filter(
            (timeSlot) =>
              timeSlot.doctorId === updatedUnavailability.doctorId &&
              timeSlot.date >= updatedUnavailability.startDate &&
              timeSlot.date <= updatedUnavailability.endDate
          );

          affectedTimeSlots.forEach((timeSlot) => {
            if (!timeSlot.isBooked) {
              updateTimeSlot(timeSlot.id, { isAvailable: false });
            }
          });
        }
      }

      return updatedUnavailability;
    },
    [timeSlots, updateTimeSlot]
  );

  // Remove doctor unavailability
  const removeUnavailability = useCallback(
    (id) => {
      const unavailabilityToRemove = getUnavailabilityById(id);

      if (!unavailabilityToRemove) {
        return false;
      }

      const success = removeEntity(STORAGE_KEYS.DOCTOR_UNAVAILABILITY, id);

      if (success) {
        setDoctorUnavailability((prevUnavailability) =>
          prevUnavailability.filter(
            (unavailability) => unavailability.id !== id
          )
        );

        // Update affected time slots to be available again
        if (unavailabilityToRemove.doctorId) {
          const affectedTimeSlots = timeSlots.filter(
            (timeSlot) =>
              timeSlot.doctorId === unavailabilityToRemove.doctorId &&
              timeSlot.date >= unavailabilityToRemove.startDate &&
              timeSlot.date <= unavailabilityToRemove.endDate
          );

          affectedTimeSlots.forEach((timeSlot) => {
            if (!timeSlot.isBooked) {
              updateTimeSlot(timeSlot.id, { isAvailable: true });
            }
          });
        }
      }

      return success;
    },
    [getUnavailabilityById, timeSlots, updateTimeSlot]
  );

  // Get unavailability periods for a specific doctor
  const getDoctorUnavailabilityPeriods = useCallback(
    (doctorId) => {
      return doctorUnavailability.filter(
        (unavailability) => unavailability.doctorId === doctorId
      );
    },
    [doctorUnavailability]
  );

  // Check if a doctor is available on a specific date
  const isDoctorAvailable = useCallback(
    (doctorId, date) => {
      const unavailabilityPeriods = getDoctorUnavailabilityPeriods(doctorId);

      return !unavailabilityPeriods.some(
        (unavailability) =>
          date >= unavailability.startDate && date <= unavailability.endDate
      );
    },
    [getDoctorUnavailabilityPeriods]
  );

  // Value object for the context provider
  const value = {
    // Data
    appointments,
    timeSlots,
    doctorUnavailability,
    loading,

    // Appointment methods
    getAppointmentById,
    addAppointment,
    updateAppointment,
    removeAppointment,
    getDoctorAppointments,
    getPatientAppointments,
    getCurrentUserAppointments,
    getAppointmentsByDate,
    updateAppointmentStatus,
    createFollowUpAppointment,

    // Time slot methods
    getTimeSlotById,
    addTimeSlot,
    updateTimeSlot,
    removeTimeSlot,
    getDoctorTimeSlots,
    getAvailableTimeSlots,
    bookTimeSlot,
    generateTimeSlots,

    // Doctor unavailability methods
    getUnavailabilityById,
    addUnavailability,
    updateUnavailability,
    removeUnavailability,
    getDoctorUnavailabilityPeriods,
    isDoctorAvailable,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

// Custom hook for using Appointment Context
export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error(
      "useAppointments must be used within an AppointmentProvider"
    );
  }
  return context;
};

// Alias for backward compatibility
export const useAppointment = useAppointments;

export default AppointmentContext;
