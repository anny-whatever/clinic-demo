import { createContext, useState, useEffect, useContext } from "react";
import { format, addDays, parseISO, isWithinInterval } from "date-fns";

const TimeSlotContext = createContext();

export const useTimeSlot = () => useContext(TimeSlotContext);

export const TimeSlotProvider = ({ children }) => {
  // State for time slots and doctor unavailability
  const [timeSlots, setTimeSlots] = useState([]);
  const [doctorUnavailability, setDoctorUnavailability] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedTimeSlots = localStorage.getItem("cms_timeSlots");
    const storedUnavailability = localStorage.getItem(
      "cms_doctorUnavailability"
    );

    if (storedTimeSlots) {
      setTimeSlots(JSON.parse(storedTimeSlots));
    }

    if (storedUnavailability) {
      setDoctorUnavailability(JSON.parse(storedUnavailability));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cms_timeSlots", JSON.stringify(timeSlots));
  }, [timeSlots]);

  useEffect(() => {
    localStorage.setItem(
      "cms_doctorUnavailability",
      JSON.stringify(doctorUnavailability)
    );
  }, [doctorUnavailability]);

  // Generate time slots for a doctor
  const generateTimeSlots = (
    doctorId,
    startDate,
    endDate,
    startTime,
    endTime,
    slotDuration
  ) => {
    const newTimeSlots = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    // Convert duration to minutes
    const durationInMinutes = parseInt(slotDuration);

    while (currentDate <= lastDate) {
      const formattedDate = format(currentDate, "yyyy-MM-dd");

      // Parse start and end times
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      let currentTime = new Date(currentDate);
      currentTime.setHours(startHour, startMinute, 0, 0);

      const endTimeObj = new Date(currentDate);
      endTimeObj.setHours(endHour, endMinute, 0, 0);

      while (currentTime < endTimeObj) {
        const slotStartTime = format(currentTime, "HH:mm");

        // Add duration minutes to current time
        const slotEndTime = format(
          new Date(currentTime.getTime() + durationInMinutes * 60000),
          "HH:mm"
        );

        // Check if this time is during an unavailable period
        const isUnavailable = checkIfUnavailable(
          doctorId,
          formattedDate,
          slotStartTime,
          slotEndTime
        );

        if (!isUnavailable) {
          newTimeSlots.push({
            id: `slot-${doctorId}-${formattedDate}-${slotStartTime}`,
            doctorId,
            date: formattedDate,
            startTime: slotStartTime,
            endTime: slotEndTime,
            isBooked: false,
            isAvailable: true,
          });
        }

        // Move to next slot
        currentTime = new Date(
          currentTime.getTime() + durationInMinutes * 60000
        );
      }

      // Move to next day
      currentDate = addDays(currentDate, 1);
    }

    setTimeSlots((prevSlots) => [...prevSlots, ...newTimeSlots]);
    return newTimeSlots;
  };

  // Check if a time slot conflicts with doctor unavailability
  const checkIfUnavailable = (doctorId, date, startTime, endTime) => {
    return doctorUnavailability.some((unavail) => {
      if (unavail.doctorId !== doctorId) return false;

      // Check if the date is within the unavailable range
      const unavailStart = new Date(unavail.startDate);
      const unavailEnd = new Date(unavail.endDate);
      const slotDate = new Date(date);

      if (slotDate < unavailStart || slotDate > unavailEnd) return false;

      // If checking a specific time range on this date
      if (startTime && endTime) {
        // Convert times to comparable values
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        // For all-day unavailability, return true
        if (!unavail.startTime || !unavail.endTime) return true;

        // Parse unavailable time range
        const [unavailStartHour, unavailStartMinute] = unavail.startTime
          .split(":")
          .map(Number);
        const [unavailEndHour, unavailEndMinute] = unavail.endTime
          .split(":")
          .map(Number);

        // Check if times overlap
        if (
          (startHour < unavailEndHour ||
            (startHour === unavailEndHour && startMinute < unavailEndMinute)) &&
          (endHour > unavailStartHour ||
            (endHour === unavailStartHour && endMinute > unavailStartMinute))
        ) {
          return true;
        }
      } else {
        // If just checking the date
        return true;
      }

      return false;
    });
  };

  // Add a new unavailability period
  const addUnavailabilityPeriod = (
    doctorId,
    startDate,
    endDate,
    reason,
    startTime = null,
    endTime = null,
    isRecurring = false,
    recurrencePattern = null
  ) => {
    const newUnavailability = {
      id: `unavail-${doctorId}-${Date.now()}`,
      doctorId,
      startDate,
      endDate,
      startTime,
      endTime,
      reason,
      isRecurring,
      recurrencePattern,
    };

    setDoctorUnavailability((prev) => [...prev, newUnavailability]);

    // Update existing time slots that might be affected
    updateTimeSlotsForUnavailability(newUnavailability);

    return newUnavailability;
  };

  // Update time slots based on new unavailability
  const updateTimeSlotsForUnavailability = (unavailability) => {
    const { doctorId, startDate, endDate } = unavailability;

    setTimeSlots((prevSlots) => {
      return prevSlots.map((slot) => {
        if (
          slot.doctorId === doctorId &&
          new Date(slot.date) >= new Date(startDate) &&
          new Date(slot.date) <= new Date(endDate) &&
          checkIfUnavailable(doctorId, slot.date, slot.startTime, slot.endTime)
        ) {
          return { ...slot, isAvailable: false };
        }
        return slot;
      });
    });
  };

  // Delete unavailability period
  const deleteUnavailabilityPeriod = (unavailabilityId) => {
    const unavailToDelete = doctorUnavailability.find(
      (u) => u.id === unavailabilityId
    );

    if (!unavailToDelete) return false;

    setDoctorUnavailability((prev) =>
      prev.filter((u) => u.id !== unavailabilityId)
    );

    // Update time slots that were affected
    resetTimeSlotsAfterUnavailabilityRemoval(unavailToDelete);

    return true;
  };

  // Reset time slots after an unavailability period is removed
  const resetTimeSlotsAfterUnavailabilityRemoval = (removedUnavailability) => {
    const { doctorId, startDate, endDate } = removedUnavailability;

    setTimeSlots((prevSlots) => {
      return prevSlots.map((slot) => {
        if (
          slot.doctorId === doctorId &&
          new Date(slot.date) >= new Date(startDate) &&
          new Date(slot.date) <= new Date(endDate) &&
          !slot.isBooked
        ) {
          // Check if slot is still unavailable due to another unavailability period
          const stillUnavailable = checkIfUnavailable(
            doctorId,
            slot.date,
            slot.startTime,
            slot.endTime
          );

          if (!stillUnavailable) {
            return { ...slot, isAvailable: true };
          }
        }
        return slot;
      });
    });
  };

  // Get available time slots for a doctor on a specific date
  const getAvailableTimeSlots = (doctorId, date) => {
    return timeSlots.filter(
      (slot) =>
        slot.doctorId === doctorId &&
        slot.date === date &&
        slot.isAvailable === true &&
        slot.isBooked === false
    );
  };

  // Update a time slot
  const updateTimeSlot = (slotId, updates) => {
    setTimeSlots((prevSlots) => {
      return prevSlots.map((slot) => {
        if (slot.id === slotId) {
          return { ...slot, ...updates };
        }
        return slot;
      });
    });
  };

  // Delete a time slot
  const deleteTimeSlot = (slotId) => {
    setTimeSlots((prevSlots) => prevSlots.filter((slot) => slot.id !== slotId));
  };

  // Get doctor unavailability periods
  const getDoctorUnavailability = (doctorId) => {
    return doctorUnavailability.filter(
      (unavail) => unavail.doctorId === doctorId
    );
  };

  const value = {
    timeSlots,
    doctorUnavailability,
    generateTimeSlots,
    getAvailableTimeSlots,
    updateTimeSlot,
    deleteTimeSlot,
    addUnavailabilityPeriod,
    deleteUnavailabilityPeriod,
    getDoctorUnavailability,
    checkIfUnavailable,
  };

  return (
    <TimeSlotContext.Provider value={value}>
      {children}
    </TimeSlotContext.Provider>
  );
};

export default TimeSlotContext;
