import { createContext, useState, useEffect, useContext } from "react";
import { differenceInMinutes } from "date-fns";

const WaitingRoomContext = createContext();

export const useWaitingRoom = () => useContext(WaitingRoomContext);

export const WaitingRoomProvider = ({ children }) => {
  // Initialize waiting room state
  const [waitingRoom, setWaitingRoom] = useState({
    currentQueue: [],
    history: [],
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const storedWaitingRoom = localStorage.getItem("cms_waitingRoom");
    if (storedWaitingRoom) {
      setWaitingRoom(JSON.parse(storedWaitingRoom));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cms_waitingRoom", JSON.stringify(waitingRoom));
  }, [waitingRoom]);

  // Check in a patient for an appointment
  const checkInPatient = (appointment, patient, doctor) => {
    const checkedInTime = new Date().toISOString();

    // Calculate estimated wait time based on number of patients ahead
    const patientsForDoctor = waitingRoom.currentQueue.filter(
      (queueItem) => queueItem.doctorId === appointment.doctorId
    );

    // Assume each patient takes about 15 minutes
    const estimatedWaitTime = patientsForDoctor.length * 15;

    const queueItem = {
      appointmentId: appointment.id,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: appointment.doctorId,
      doctorName: doctor.name,
      checkedInTime,
      estimatedWaitTime,
      priority: 1, // Normal priority by default
      status: "waiting", // waiting, in-progress, completed
    };

    setWaitingRoom((prev) => ({
      ...prev,
      currentQueue: [...prev.currentQueue, queueItem],
    }));

    return { ...queueItem };
  };

  // Update appointment status to in-progress
  const startAppointment = (appointmentId) => {
    setWaitingRoom((prev) => ({
      ...prev,
      currentQueue: prev.currentQueue.map((item) =>
        item.appointmentId === appointmentId
          ? { ...item, status: "in-progress" }
          : item
      ),
    }));

    // Recalculate estimated wait times for other patients
    updateEstimatedWaitTimes();

    return true;
  };

  // Check out a patient (remove from waiting room and move to history)
  const checkOutPatient = (appointmentId) => {
    const patientQueueItem = waitingRoom.currentQueue.find(
      (item) => item.appointmentId === appointmentId
    );

    if (!patientQueueItem) return false;

    const checkoutTime = new Date().toISOString();
    const waitingTimeMinutes = differenceInMinutes(
      new Date(checkoutTime),
      new Date(patientQueueItem.checkedInTime)
    );

    const completedItem = {
      ...patientQueueItem,
      checkoutTime,
      waitingTime: waitingTimeMinutes,
      status: "completed",
    };

    setWaitingRoom((prev) => ({
      currentQueue: prev.currentQueue.filter(
        (item) => item.appointmentId !== appointmentId
      ),
      history: [...prev.history, completedItem],
    }));

    // Recalculate estimated wait times
    updateEstimatedWaitTimes();

    return { ...completedItem };
  };

  // Update priority of a patient in waiting room
  const updatePatientPriority = (appointmentId, priority) => {
    setWaitingRoom((prev) => ({
      ...prev,
      currentQueue: prev.currentQueue.map((item) =>
        item.appointmentId === appointmentId ? { ...item, priority } : item
      ),
    }));

    // Recalculate estimated wait times
    updateEstimatedWaitTimes();

    return true;
  };

  // Get waiting patients for a specific doctor
  const getWaitingPatientsForDoctor = (doctorId) => {
    return waitingRoom.currentQueue
      .filter((item) => item.doctorId === doctorId)
      .sort((a, b) => {
        // Sort by priority first (lower number = higher priority)
        const priorityA = a.priority ?? 0;
        const priorityB = b.priority ?? 0;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Then by check-in time
        const timeA = a.checkedInTime ? new Date(a.checkedInTime) : new Date(0);
        const timeB = b.checkedInTime ? new Date(b.checkedInTime) : new Date(0);
        return timeA - timeB;
      });
  };

  // Get all waiting patients
  const getAllWaitingPatients = () => {
    return waitingRoom.currentQueue.sort((a, b) => {
      // Sort by priority first (lower number = higher priority)
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Then by check-in time
      const timeA = a.checkedInTime ? new Date(a.checkedInTime) : new Date(0);
      const timeB = b.checkedInTime ? new Date(b.checkedInTime) : new Date(0);
      return timeA - timeB;
    });
  };

  // Update estimated wait times for all patients
  const updateEstimatedWaitTimes = () => {
    const updatedQueue = [...waitingRoom.currentQueue];

    // Group patients by doctor
    const patientsByDoctor = {};

    updatedQueue.forEach((patient) => {
      if (!patientsByDoctor[patient.doctorId]) {
        patientsByDoctor[patient.doctorId] = [];
      }
      patientsByDoctor[patient.doctorId].push(patient);
    });

    // Sort patients for each doctor by priority and check-in time
    Object.keys(patientsByDoctor).forEach((doctorId) => {
      patientsByDoctor[doctorId].sort((a, b) => {
        const priorityA = a.priority ?? 0;
        const priorityB = b.priority ?? 0;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        const timeA = a.checkedInTime ? new Date(a.checkedInTime) : new Date(0);
        const timeB = b.checkedInTime ? new Date(b.checkedInTime) : new Date(0);
        return timeA - timeB;
      });

      // Update estimated wait times
      patientsByDoctor[doctorId].forEach((patient, index) => {
        // Assume each patient takes about 15 minutes
        // If a patient is currently in-progress, they take less time
        const patientsAhead = patientsByDoctor[doctorId].slice(0, index);
        const waitingPatientsAhead = patientsAhead.filter(
          (p) => p.status === "waiting"
        ).length;
        const inProgressPatientsAhead = patientsAhead.filter(
          (p) => p.status === "in-progress"
        ).length;

        patient.estimatedWaitTime =
          waitingPatientsAhead * 15 + inProgressPatientsAhead * 5;
      });
    });

    // Flatten the grouped patients back to a single array
    const newQueue = Object.values(patientsByDoctor).flat();

    setWaitingRoom((prev) => ({
      ...prev,
      currentQueue: newQueue,
    }));
  };

  // Get waiting room history for analytics
  const getWaitingRoomHistory = () => {
    return waitingRoom.history;
  };

  // Check if a patient is already in the waiting room
  const isPatientInWaitingRoom = (appointmentId) => {
    return waitingRoom.currentQueue.some(
      (item) => item.appointmentId === appointmentId
    );
  };

  // Calculate average waiting time for a doctor
  const getAverageWaitingTime = (doctorId) => {
    const doctorHistory = waitingRoom.history.filter(
      (item) => item.doctorId === doctorId
    );

    if (doctorHistory.length === 0) return 0;

    const totalWaitingTime = doctorHistory.reduce(
      (total, item) => total + item.waitingTime,
      0
    );

    return Math.round(totalWaitingTime / doctorHistory.length);
  };

  const value = {
    waitingRoom,
    checkInPatient,
    startAppointment,
    checkOutPatient,
    updatePatientPriority,
    getWaitingPatientsForDoctor,
    getAllWaitingPatients,
    getWaitingRoomHistory,
    isPatientInWaitingRoom,
    getAverageWaitingTime,
    updateEstimatedWaitTimes,
  };

  return (
    <WaitingRoomContext.Provider value={value}>
      {children}
    </WaitingRoomContext.Provider>
  );
};

export default WaitingRoomContext;
