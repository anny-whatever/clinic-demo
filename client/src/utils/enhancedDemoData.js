import {
  format,
  addDays,
  subDays,
  subMonths,
  subWeeks,
  parseISO,
} from "date-fns";
import { STORAGE_KEYS, getItem, setItem } from "./localStorage";
import { generateEntityId } from "./idUtils";
import updateAllPatientData from "./updatePatientData";

/**
 * Generate appointments for past dates to build historical data
 * @returns {Array} Array of historical appointment objects
 */
const generateHistoricalAppointments = () => {
  const today = new Date();
  const appointments = [];
  const users = getItem(STORAGE_KEYS.USERS) || [];
  const patients = getItem(STORAGE_KEYS.PATIENTS) || [];

  // Get doctor IDs
  const doctorIds = users
    .filter((user) => user.role === "doctor")
    .map((doctor) => doctor.id);

  // Get patient IDs
  const patientIds = patients.map((patient) => patient.id);

  // Create patient-doctor relationships (some patients see specific doctors regularly)
  const patientDoctorPreferences = {};
  patientIds.forEach((patientId) => {
    // Assign a primary doctor to each patient (70% chance)
    if (Math.random() < 0.7) {
      patientDoctorPreferences[patientId] =
        doctorIds[Math.floor(Math.random() * doctorIds.length)];
    }
  });

  // Generate distribution of appointments per weekday (busier on Mon, Tue, Wed)
  const dayDistribution = [0.5, 1.5, 1.5, 1.3, 1.0, 0.4, 0.1]; // Sun-Sat

  // Generate appointments for the last 90 days
  for (let i = 1; i <= 90; i++) {
    const date = subDays(today, i);
    const formattedDate = format(date, "yyyy-MM-dd");
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Skip most appointments on weekends (apply day distribution)
    const isAppointmentDay = Math.random() < dayDistribution[dayOfWeek];
    if (!isAppointmentDay && (dayOfWeek === 0 || dayOfWeek === 6)) {
      continue;
    }

    // Base number of appointments per day (4-10 depending on day of week)
    let baseAppointmentsPerDay = Math.round(
      4 + (6 * dayDistribution[dayOfWeek]) / 1.5
    );

    // Add some randomness (+/- 2)
    const appointmentsPerDay = Math.max(
      0,
      baseAppointmentsPerDay + Math.floor(Math.random() * 5) - 2
    );

    // For each doctor, create a schedule with available time slots
    const doctorSchedules = {};
    doctorIds.forEach((doctorId) => {
      // Each doctor has slightly different hours
      const startHour = 8 + Math.floor(Math.random() * 2); // 8 or 9 AM
      const endHour = 16 + Math.floor(Math.random() * 2); // 4 or 5 PM

      doctorSchedules[doctorId] = {
        availableSlots: [],
        lunchBreak: 12 + Math.floor(Math.random() * 2), // 12 or 1 PM lunch
      };

      // Create 30-minute slots
      for (let hour = startHour; hour < endHour; hour++) {
        if (hour === doctorSchedules[doctorId].lunchBreak) {
          continue; // Skip lunch hour
        }

        for (let minute of [0, 30]) {
          doctorSchedules[doctorId].availableSlots.push({
            hour,
            minute,
            booked: false,
          });
        }
      }
    });

    // Create appointments for this day
    for (let j = 0; j < appointmentsPerDay; j++) {
      // First select doctor with available slots
      const availableDoctors = doctorIds.filter((doctorId) =>
        doctorSchedules[doctorId].availableSlots.some((slot) => !slot.booked)
      );

      if (availableDoctors.length === 0) break;

      // Select random doctor from available ones
      const doctorId =
        availableDoctors[Math.floor(Math.random() * availableDoctors.length)];

      // Get available slots for this doctor
      const availableSlots = doctorSchedules[doctorId].availableSlots.filter(
        (slot) => !slot.booked
      );
      if (availableSlots.length === 0) continue;

      // Select a random time slot
      const slotIndex = Math.floor(Math.random() * availableSlots.length);
      const selectedSlot = availableSlots[slotIndex];
      selectedSlot.booked = true; // Mark as booked

      // Format time strings
      const hour = selectedSlot.hour;
      const minute = selectedSlot.minute;
      const startTime = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;

      // Calculate end time (30 min appointments)
      let endHour = hour;
      let endMinute = minute + 30;
      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`;

      // Select patient - use patient-doctor preference if available
      let patientId;
      const preferredPatients = Object.entries(patientDoctorPreferences)
        .filter(([pid, did]) => did === doctorId)
        .map(([pid]) => pid);

      if (preferredPatients.length > 0 && Math.random() < 0.7) {
        // 70% chance to select a patient who prefers this doctor
        patientId =
          preferredPatients[
            Math.floor(Math.random() * preferredPatients.length)
          ];
      } else {
        // Otherwise random patient
        patientId = patientIds[Math.floor(Math.random() * patientIds.length)];
      }

      // Randomly select appointment status
      // Status probability varies based on how far in the past the appointment is
      let status;
      const daysPast = i;

      if (daysPast > 7) {
        // Older appointments (more likely to be completed)
        const statusRandom = Math.random();
        if (statusRandom < 0.82) {
          status = "completed";
        } else if (statusRandom < 0.92) {
          status = "canceled";
        } else if (statusRandom < 0.98) {
          status = "no-show";
        } else {
          status = "rejected";
        }
      } else {
        // More recent appointments (some still scheduled)
        const statusRandom = Math.random();
        if (statusRandom < 0.75) {
          status = "completed";
        } else if (statusRandom < 0.85) {
          status = "canceled";
        } else if (statusRandom < 0.92) {
          status = "no-show";
        } else if (statusRandom < 0.96) {
          status = "rejected";
        } else {
          status = "scheduled"; // A few appointments might still be marked as scheduled
        }
      }

      // Generate random waiting time for completed appointments
      let checkedInTime = null;
      let checkoutTime = null;
      let waitingTime = null;

      if (status === "completed") {
        // Patient typically arrives 0-25 minutes before appointment
        const checkInMinutesBefore = Math.floor(Math.random() * 26);
        const appointmentDateTime = new Date(
          `${formattedDate}T${startTime}:00`
        );
        checkedInTime = subMinutes(
          appointmentDateTime,
          checkInMinutesBefore
        ).toISOString();

        // Waiting time varies by doctor (some doctors run on time, others don't)
        // Create doctor-specific average wait times (5-25 minutes)
        if (!doctorSchedules[doctorId].avgWaitTime) {
          doctorSchedules[doctorId].avgWaitTime =
            5 + Math.floor(Math.random() * 21);
        }

        // Actual wait time varies around the average
        const avgWait = doctorSchedules[doctorId].avgWaitTime;
        waitingTime = Math.max(
          0,
          avgWait + Math.floor(Math.random() * 21) - 10
        );

        // Appointment duration varies by reason (15-45 minutes)
        const appointmentDuration = 15 + Math.floor(Math.random() * 31);

        // Calculate when patient started seeing doctor
        const startSeeingDoctorTime = addMinutes(
          parseISO(checkedInTime),
          waitingTime
        );

        // Calculate checkout time
        checkoutTime = addMinutes(
          startSeeingDoctorTime,
          appointmentDuration
        ).toISOString();
      }

      // Determine if this is a follow-up
      const isFollowUp = Math.random() < 0.25; // 25% are follow-ups

      // Generate fees based on appointment type and doctor
      // Different doctors charge different rates
      if (!doctorSchedules[doctorId].baseRate) {
        // Generate base rate for each doctor ($50-$200)
        doctorSchedules[doctorId].baseRate =
          50 + Math.floor(Math.random() * 151);
      }

      // Calculate fee with some variation
      let baseFee = doctorSchedules[doctorId].baseRate;

      // Follow-ups are typically cheaper
      if (isFollowUp) {
        baseFee = Math.round(baseFee * 0.7);
      }

      // Add some random variation (+/- 10%)
      const feeVariation = 1 + (Math.random() * 0.2 - 0.1);
      const fees = Math.round((baseFee * feeVariation) / 5) * 5; // Round to nearest $5

      // Generate appointment
      const appointment = {
        id: generateEntityId("appointment"),
        patientId,
        doctorId,
        date: formattedDate,
        startTime: startTime,
        endTime: endTime,
        status,
        checkedInTime,
        checkoutTime,
        waitingTime,
        reason: getRandomAppointmentReason(),
        notes: status === "completed" ? getRandomAppointmentNotes() : "",
        isFollowUp,
        previousAppointmentId: null, // Would be set in real data
        fees,
        paymentStatus:
          status === "completed" ? getRandomPaymentStatus() : "pending",
        paymentPlan: Math.random() < 0.15, // 15% on payment plan
      };

      appointments.push(appointment);
    }
  }

  // Link some follow-up appointments to previous appointments
  const completedAppointments = appointments.filter(
    (app) => app.status === "completed"
  );

  appointments.forEach((appointment) => {
    if (appointment.isFollowUp) {
      // Find a previous appointment for the same patient and doctor
      const previousAppointments = completedAppointments.filter(
        (app) =>
          app.patientId === appointment.patientId &&
          app.doctorId === appointment.doctorId &&
          app.date < appointment.date && // Must be earlier
          app !== appointment // Can't link to self
      );

      if (previousAppointments.length > 0) {
        // Link to the most recent previous appointment
        previousAppointments.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        appointment.previousAppointmentId = previousAppointments[0].id;
      }
    }
  });

  return appointments;
};

/**
 * Generate realistic invoice data based on appointments
 * @param {Array} appointments Array of appointment objects
 * @returns {Array} Array of invoice objects
 */
const generateInvoices = (appointments) => {
  const invoices = [];
  const today = new Date();

  // Define common medical services and their price ranges
  const medicalServices = [
    { description: "General Consultation", minPrice: 80, maxPrice: 200 },
    { description: "Specialist Consultation", minPrice: 150, maxPrice: 350 },
    { description: "Follow-up Visit", minPrice: 60, maxPrice: 150 },
    { description: "Blood Test - Basic Panel", minPrice: 50, maxPrice: 120 },
    {
      description: "Blood Test - Comprehensive Panel",
      minPrice: 150,
      maxPrice: 300,
    },
    { description: "X-Ray", minPrice: 100, maxPrice: 250 },
    { description: "Ultrasound", minPrice: 200, maxPrice: 400 },
    { description: "EKG/ECG", minPrice: 75, maxPrice: 150 },
    { description: "Medication Administration", minPrice: 25, maxPrice: 75 },
    { description: "Vaccination", minPrice: 40, maxPrice: 120 },
    { description: "Wound Care", minPrice: 50, maxPrice: 150 },
    { description: "Physical Therapy Session", minPrice: 80, maxPrice: 160 },
    { description: "Mental Health Consultation", minPrice: 120, maxPrice: 250 },
    { description: "Allergy Testing", minPrice: 100, maxPrice: 300 },
    { description: "Preventative Screening", minPrice: 100, maxPrice: 250 },
  ];

  appointments.forEach((appointment) => {
    // Only create invoices for completed appointments
    if (appointment.status === "completed") {
      // Start with the base consultation fee from the appointment
      let mainServiceType;

      // Determine service type based on appointment reason
      if (appointment.reason.toLowerCase().includes("follow-up")) {
        mainServiceType = "Follow-up Visit";
      } else if (
        appointment.reason.toLowerCase().includes("physical") ||
        appointment.reason.toLowerCase().includes("check-up") ||
        appointment.reason.toLowerCase().includes("annual")
      ) {
        mainServiceType = "Preventative Screening";
      } else if (
        appointment.reason.toLowerCase().includes("depression") ||
        appointment.reason.toLowerCase().includes("anxiety") ||
        appointment.reason.toLowerCase().includes("mental")
      ) {
        mainServiceType = "Mental Health Consultation";
      } else {
        // Default to general consultation
        mainServiceType = "General Consultation";
      }

      // Find the service in our list
      const mainService =
        medicalServices.find((s) => s.description === mainServiceType) ||
        medicalServices[0]; // Fallback to general consultation

      // Create the main service item with the appointment fee
      const items = [
        {
          description: mainService.description,
          amount: appointment.fees,
        },
      ];

      let totalAmount = appointment.fees;

      // Determine if there are additional charges (based on appointment notes and reason)
      // 40% of visits have additional charges
      if (Math.random() < 0.4) {
        // How many additional services (1-3)
        const numAdditionalServices = Math.floor(Math.random() * 3) + 1;

        // Filter services that make sense for this appointment
        let relevantServices = [...medicalServices]; // Start with all

        // Filter based on appointment reason
        if (
          appointment.reason.toLowerCase().includes("blood") ||
          appointment.notes.toLowerCase().includes("blood test")
        ) {
          relevantServices = relevantServices.filter(
            (s) => s.description.includes("Blood Test") || Math.random() < 0.3
          );
        }

        if (
          appointment.reason.toLowerCase().includes("pain") ||
          appointment.notes.toLowerCase().includes("physical therapy")
        ) {
          relevantServices = relevantServices.filter(
            (s) =>
              s.description.includes("Physical Therapy") ||
              s.description.includes("X-Ray") ||
              Math.random() < 0.3
          );
        }

        if (
          appointment.reason.toLowerCase().includes("rash") ||
          appointment.reason.toLowerCase().includes("allerg")
        ) {
          relevantServices = relevantServices.filter(
            (s) => s.description.includes("Allergy") || Math.random() < 0.3
          );
        }

        // If we filtered too aggressively, reset
        if (relevantServices.length < 3) {
          relevantServices = medicalServices;
        }

        // Add the additional services (excluding the main service)
        const additionalServices = relevantServices
          .filter((s) => s.description !== mainService.description)
          .sort(() => 0.5 - Math.random()) // Shuffle
          .slice(0, numAdditionalServices);

        additionalServices.forEach((service) => {
          // Generate a price within the service's range
          const price =
            Math.round(
              (service.minPrice +
                Math.random() * (service.maxPrice - service.minPrice)) /
                5
            ) * 5; // Round to nearest $5

          items.push({
            description: service.description,
            amount: price,
          });

          totalAmount += price;
        });
      }

      // Create payment status based on various factors
      let paymentStatus;
      let paidAmount = 0;

      // Base payment status on appointment's paymentStatus
      if (appointment.paymentStatus === "paid") {
        paymentStatus = "paid";
        paidAmount = totalAmount;
      } else if (appointment.paymentStatus === "partial") {
        paymentStatus = "partial";
        // 30-80% paid for partial payments
        const percentPaid = 0.3 + Math.random() * 0.5;
        paidAmount = Math.round(totalAmount * percentPaid);
      } else {
        paymentStatus = "pending";
      }

      // Payment timing - more recent invoices more likely to be pending
      const appointmentDate = new Date(appointment.date);
      const daysSinceAppointment = Math.round(
        (today - appointmentDate) / (1000 * 60 * 60 * 24)
      );

      // Adjust payment status based on time
      // Older invoices more likely to be paid
      if (
        daysSinceAppointment > 30 &&
        paymentStatus === "pending" &&
        Math.random() < 0.8
      ) {
        paymentStatus = "paid";
        paidAmount = totalAmount;
      } else if (
        daysSinceAppointment > 14 &&
        paymentStatus === "pending" &&
        Math.random() < 0.6
      ) {
        paymentStatus = "paid";
        paidAmount = totalAmount;
      } else if (
        daysSinceAppointment > 7 &&
        paymentStatus === "pending" &&
        Math.random() < 0.4
      ) {
        if (Math.random() < 0.7) {
          paymentStatus = "paid";
          paidAmount = totalAmount;
        } else {
          paymentStatus = "partial";
          const percentPaid = 0.3 + Math.random() * 0.5;
          paidAmount = Math.round(totalAmount * percentPaid);
        }
      }

      // For very recent appointments (last 3 days), most are still pending
      if (daysSinceAppointment <= 3 && Math.random() < 0.8) {
        paymentStatus = "pending";
        paidAmount = 0;
      }

      // Payment method only applies to paid or partial
      let paymentMethod = null;
      if (paymentStatus === "paid" || paymentStatus === "partial") {
        // Distribution of payment methods
        const methodRandom = Math.random();
        if (methodRandom < 0.4) {
          paymentMethod = "card"; // 40%
        } else if (methodRandom < 0.7) {
          paymentMethod = "insurance"; // 30%
        } else if (methodRandom < 0.9) {
          paymentMethod = "cash"; // 20%
        } else {
          paymentMethod = "online"; // 10%
        }
      }

      // Determine if this invoice will have a payment plan
      // Higher amounts and partial payments more likely to have plans
      let isPaymentPlan = appointment.paymentPlan;

      // Higher amounts have higher chance of payment plan
      if (totalAmount > 300 && !isPaymentPlan && Math.random() < 0.3) {
        isPaymentPlan = true;
      }

      // Create the invoice with real data
      const invoice = {
        id: generateEntityId("invoice"),
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        date: appointment.date,
        items,
        totalAmount,
        paymentStatus,
        paymentMethod,
        isPaymentPlan,
        paymentPlanDetails: null, // Will be filled for payment plans
        paidAmount,
        paymentDate:
          paymentStatus === "paid" || paymentStatus === "partial"
            ? generatePaymentDate(appointment.date, daysSinceAppointment)
            : null,
      };

      invoices.push(invoice);
    }
  });

  return invoices;
};

// Helper function to generate realistic payment dates
const generatePaymentDate = (appointmentDate, daysSinceAppointment) => {
  const appDate = new Date(appointmentDate);

  // Payment usually happens on the same day or within 7 days
  // For same-day payments: 60% chance
  if (Math.random() < 0.6) {
    return appointmentDate; // Same day
  } else {
    // Otherwise, payment within 1-7 days, but not after today
    const maxDays = Math.min(7, daysSinceAppointment);
    const daysAfter = Math.floor(Math.random() * maxDays) + 1;
    const paymentDate = new Date(appDate);
    paymentDate.setDate(paymentDate.getDate() + daysAfter);
    return format(paymentDate, "yyyy-MM-dd");
  }
};

/**
 * Generate payment plans for invoices that have isPaymentPlan flag
 * @param {Array} invoices Array of invoice objects
 * @returns {Array} Array of payment plan objects
 */
const generatePaymentPlans = (invoices) => {
  const paymentPlans = [];
  const today = new Date();

  // Filter invoices that have payment plans
  const invoicesWithPlans = invoices.filter((invoice) => invoice.isPaymentPlan);

  invoicesWithPlans.forEach((invoice) => {
    // Determine number of installments based on total amount
    let numberOfInstallments;
    if (invoice.totalAmount < 200) {
      numberOfInstallments = 2; // Small amounts get 2 installments
    } else if (invoice.totalAmount < 500) {
      numberOfInstallments = 3; // Medium amounts get 3 installments
    } else if (invoice.totalAmount < 1000) {
      numberOfInstallments = 4; // Large amounts get 4 installments
    } else {
      numberOfInstallments = 6; // Very large amounts get 6 installments
    }

    // Calculate installment amount (rounded to nearest dollar)
    const installmentAmount = Math.round(
      invoice.totalAmount / numberOfInstallments
    );

    // Determine start date (usually same as invoice date)
    const startDate = parseISO(invoice.date);

    // Create installments
    const installments = [];
    let remainingAmount = invoice.totalAmount;

    for (let i = 0; i < numberOfInstallments; i++) {
      // For the last installment, use the remaining amount to account for rounding
      const amount =
        i === numberOfInstallments - 1 ? remainingAmount : installmentAmount;
      remainingAmount -= amount;

      // Due date is every 30 days from start
      const dueDate = format(addDays(startDate, 30 * i), "yyyy-MM-dd");

      // Determine payment status based on due date
      // If due date is in the past, it's either paid or late
      const dueDateObj = parseISO(dueDate);
      let status;
      let paymentDate = null;

      if (dueDateObj < today) {
        // Due date is in the past
        // The older the due date, the more likely it's paid
        const daysPast = Math.round(
          (today - dueDateObj) / (1000 * 60 * 60 * 24)
        );

        if (daysPast > 45 && Math.random() < 0.95) {
          status = "paid";
          // Payment date is somewhere between due date and 10 days after
          const daysAfterDue = Math.min(
            10,
            Math.floor(Math.random() * daysPast)
          );
          paymentDate = format(addDays(dueDateObj, daysAfterDue), "yyyy-MM-dd");
        } else if (daysPast > 30 && Math.random() < 0.85) {
          status = "paid";
          const daysAfterDue = Math.min(
            14,
            Math.floor(Math.random() * daysPast)
          );
          paymentDate = format(addDays(dueDateObj, daysAfterDue), "yyyy-MM-dd");
        } else if (daysPast > 14 && Math.random() < 0.7) {
          status = "paid";
          const daysAfterDue = Math.min(
            7,
            Math.floor(Math.random() * daysPast)
          );
          paymentDate = format(addDays(dueDateObj, daysAfterDue), "yyyy-MM-dd");
        } else if (daysPast > 7 && Math.random() < 0.5) {
          status = "paid";
          const daysAfterDue = Math.min(
            5,
            Math.floor(Math.random() * daysPast)
          );
          paymentDate = format(addDays(dueDateObj, daysAfterDue), "yyyy-MM-dd");
        } else {
          status = "late";
        }
      } else {
        // Due date is in the future
        status = "pending";

        // Some patients pay early
        const daysUntilDue = Math.round(
          (dueDateObj - today) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDue < 7 && Math.random() < 0.2) {
          status = "paid";
          // Paid 1-3 days early
          const daysEarly = Math.floor(Math.random() * 3) + 1;
          paymentDate = format(subDays(dueDateObj, daysEarly), "yyyy-MM-dd");
        }
      }

      installments.push({
        installmentNumber: i + 1,
        amount,
        dueDate,
        status,
        paymentDate,
        paymentMethod: paymentDate ? getRandomPaymentMethod() : null,
      });
    }

    // Create the payment plan
    const paymentPlan = {
      id: generateEntityId("plan"),
      invoiceId: invoice.id,
      patientId: invoice.patientId,
      startDate: format(startDate, "yyyy-MM-dd"),
      numberOfInstallments,
      totalAmount: invoice.totalAmount,
      installmentAmount,
      installments,
      status: getPaymentPlanStatus(installments),
      createdAt: format(startDate, "yyyy-MM-dd"),
    };

    // Add reference to invoice
    invoice.paymentPlanDetails = {
      id: paymentPlan.id,
      installmentAmount,
      numberOfInstallments,
      status: paymentPlan.status,
    };

    // Update invoice paid amount based on installments
    const paidInstallments = installments.filter(
      (inst) => inst.status === "paid"
    );
    invoice.paidAmount = paidInstallments.reduce(
      (sum, inst) => sum + inst.amount,
      0
    );

    // Update invoice payment status based on plan status
    if (paymentPlan.status === "completed") {
      invoice.paymentStatus = "paid";
    } else if (paidInstallments.length > 0) {
      invoice.paymentStatus = "partial";
    } else {
      invoice.paymentStatus = "pending";
    }

    paymentPlans.push(paymentPlan);
  });

  return paymentPlans;
};

// Helper function to determine payment plan status
const getPaymentPlanStatus = (installments) => {
  const allPaid = installments.every((inst) => inst.status === "paid");
  const anyLate = installments.some((inst) => inst.status === "late");
  const anyPending = installments.some((inst) => inst.status === "pending");

  if (allPaid) {
    return "completed";
  } else if (anyLate) {
    return "late";
  } else if (anyPending) {
    return "active";
  } else {
    return "active"; // Default fallback
  }
};

// Random payment method generator
const getRandomPaymentMethod = () => {
  const methods = ["card", "cash", "insurance", "online"];
  const weights = [0.4, 0.2, 0.3, 0.1]; // 40% card, 20% cash, 30% insurance, 10% online

  const random = Math.random();
  let sum = 0;

  for (let i = 0; i < methods.length; i++) {
    sum += weights[i];
    if (random < sum) {
      return methods[i];
    }
  }

  return methods[0]; // Default fallback
};

/**
 * Generate waiting room history
 * @param {Array} appointments Array of appointment objects
 * @returns {Object} Waiting room object with history
 */
const generateWaitingRoomHistory = (appointments) => {
  const history = [];

  // Generate waiting room history from completed appointments with check-in
  appointments.forEach((appointment) => {
    if (appointment.status === "completed" && appointment.checkedInTime) {
      history.push({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: getPatientName(appointment.patientId),
        doctorId: appointment.doctorId,
        doctorName: getDoctorName(appointment.doctorId),
        checkedInTime: appointment.checkedInTime,
        waitingTime: appointment.waitingTime,
        priority: Math.random() < 0.1 ? 0 : 1, // 10% urgent priority
      });
    }
  });

  return {
    currentQueue: [], // Empty for initial state
    history,
  };
};

/**
 * Generate analytics data based on appointments and invoices
 * @param {Array} appointments Array of appointment objects
 * @param {Array} invoices Array of invoice objects
 * @returns {Object} Analytics data object
 */
const generateAnalyticsData = (appointments, invoices) => {
  const today = new Date();

  // Generate daily stats for the last 30 days
  const dailyStats = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const dateString = format(date, "yyyy-MM-dd");

    // Filter appointments for this date
    const dailyAppointments = appointments.filter(
      (app) => app.date === dateString
    );

    // Calculate metrics
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

    dailyStats.push({
      date: dateString,
      total,
      completed,
      canceled,
      noShow,
    });
  }

  // Generate weekly stats for past 12 weeks
  const weeklyStats = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = subWeeks(today, i);
    const weekString = format(weekStart, "yyyy-'W'ww");

    // For simplicity, generate random but realistic stats for weekly data
    const total = 20 + Math.floor(Math.random() * 31); // 20-50 appointments per week
    const completed = Math.floor(total * (0.65 + Math.random() * 0.2)); // 65-85% completed
    const canceled = Math.floor((total - completed) * 0.7); // About 70% of remaining are cancellations
    const noShow = total - completed - canceled; // Rest are no-shows

    weeklyStats.push({
      week: weekString,
      total,
      completed,
      canceled,
      noShow,
    });
  }

  // Generate monthly stats for past 6 months
  const monthlyStats = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = subMonths(today, i);
    const monthString = format(monthStart, "yyyy-MM");

    // For simplicity, generate random but realistic stats for monthly data
    const total = 80 + Math.floor(Math.random() * 71); // 80-150 appointments per month
    const completed = Math.floor(total * (0.65 + Math.random() * 0.2)); // 65-85% completed
    const canceled = Math.floor((total - completed) * 0.7); // About 70% of remaining are cancellations
    const noShow = total - completed - canceled; // Rest are no-shows

    monthlyStats.push({
      month: monthString,
      total,
      completed,
      canceled,
      noShow,
    });
  }

  // Calculate doctor performance metrics
  const doctorPerformance = calculateDoctorPerformance(appointments, invoices);

  // Generate financial summary
  const financialSummary = generateFinancialSummary(invoices);

  return {
    appointmentStats: {
      daily: dailyStats,
      weekly: weeklyStats,
      monthly: monthlyStats,
    },
    doctorPerformance,
    financialSummary,
  };
};

/**
 * Calculate doctor performance metrics
 * @param {Array} appointments Array of appointment objects
 * @param {Array} invoices Array of invoice objects
 * @returns {Array} Array of doctor performance objects
 */
const calculateDoctorPerformance = (appointments, invoices) => {
  const users = getItem(STORAGE_KEYS.USERS) || [];
  const doctors = users.filter((user) => user.role === "doctor");

  return doctors.map((doctor) => {
    const doctorAppointments = appointments.filter(
      (app) => app.doctorId === doctor.id
    );

    // Calculate metrics
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
        ? doctorAppointments.filter((app) => app.status === "canceled").length /
          doctorAppointments.length
        : 0;

    // Calculate average wait time
    const appointmentsWithWaitTime = doctorAppointments.filter(
      (app) => app.waitingTime !== null
    );
    const averageWaitTime =
      appointmentsWithWaitTime.length > 0
        ? Math.round(
            appointmentsWithWaitTime.reduce(
              (sum, app) => sum + app.waitingTime,
              0
            ) / appointmentsWithWaitTime.length
          )
        : 0;

    // Calculate revenue
    let revenue = 0;
    doctorAppointments.forEach((app) => {
      const invoice = invoices.find((inv) => inv.appointmentId === app.id);
      if (
        invoice &&
        (invoice.paymentStatus === "paid" ||
          invoice.paymentStatus === "partial")
      ) {
        revenue +=
          invoice.paymentStatus === "paid"
            ? invoice.totalAmount
            : invoice.paidAmount;
      }
    });

    return {
      doctorId: doctor.id,
      appointmentsCompleted,
      averageDuration,
      cancelationRate,
      averageWaitTime,
      revenue,
    };
  });
};

/**
 * Generate financial summary data
 * @param {Array} invoices Array of invoice objects
 * @returns {Object} Financial summary object
 */
const generateFinancialSummary = (invoices) => {
  const today = new Date();

  // Generate daily financial data for past 30 days
  const dailyData = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const dateString = format(date, "yyyy-MM-dd");

    // Get invoices for this date
    const dailyInvoices = invoices.filter((inv) => inv.date === dateString);

    // Calculate metrics
    const revenue = dailyInvoices.reduce((sum, inv) => {
      if (inv.paymentStatus === "paid") {
        return sum + inv.totalAmount;
      } else if (inv.paymentStatus === "partial") {
        return sum + inv.paidAmount;
      }
      return sum;
    }, 0);

    const pending = dailyInvoices.reduce((sum, inv) => {
      if (inv.paymentStatus === "pending") {
        return sum + inv.totalAmount;
      } else if (inv.paymentStatus === "partial") {
        return sum + (inv.totalAmount - inv.paidAmount);
      }
      return sum;
    }, 0);

    // Calculate overdue (randomly for demo)
    const overdue =
      Math.random() < 0.7 ? 0 : Math.floor(pending * Math.random() * 0.5);

    dailyData.push({
      date: dateString,
      revenue,
      pending,
      overdue,
    });
  }

  // Generate weekly financial data
  const weeklyData = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = subWeeks(today, i);
    const weekString = format(weekStart, "yyyy-'W'ww");

    // For simplicity, generate realistic but random data
    const revenue = 2000 + Math.floor(Math.random() * 3001); // $2000-5000 per week
    const pending = 500 + Math.floor(Math.random() * 1001); // $500-1500 pending
    const overdue =
      Math.random() < 0.7 ? 0 : Math.floor(pending * Math.random() * 0.5);

    weeklyData.push({
      week: weekString,
      revenue,
      pending,
      overdue,
    });
  }

  // Generate monthly financial data
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = subMonths(today, i);
    const monthString = format(monthStart, "yyyy-MM");

    // For simplicity, generate realistic but random data
    const revenue = 8000 + Math.floor(Math.random() * 12001); // $8000-20000 per month
    const pending = 2000 + Math.floor(Math.random() * 3001); // $2000-5000 pending
    const overdue = Math.floor(pending * Math.random() * 0.4); // 0-40% of pending is overdue

    monthlyData.push({
      month: monthString,
      revenue,
      pending,
      overdue,
    });
  }

  return {
    daily: dailyData,
    weekly: weeklyData,
    monthly: monthlyData,
  };
};

// Helper functions for random data generation
const getRandomAppointmentReason = () => {
  const reasons = [
    "Annual physical exam",
    "Fever and sore throat",
    "Persistent cough for 5 days",
    "Lower back pain",
    "Skin rash and itching",
    "Migraine headache",
    "Follow-up for hypertension",
    "Shortness of breath",
    "Abdominal pain and nausea",
    "Eye infection with discharge",
    "Ear pain and reduced hearing",
    "Prescription renewal for diabetes",
    "Joint pain in knees",
    "Blood pressure monitoring",
    "Diabetes monitoring",
    "Chest pain and palpitations",
    "Dizziness and vertigo",
    "Allergic reaction with hives",
    "Urinary tract infection symptoms",
    "Prenatal check-up",
    "Depression and anxiety",
    "Insomnia for past 2 weeks",
    "Weight management consultation",
    "Respiratory infection follow-up",
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
};

const getRandomAppointmentNotes = () => {
  const notes = [
    "Patient reports improvement with prescribed medication. Blood pressure readings within normal range. Recommended continuing current treatment plan.",
    "Patient experiencing adequate symptom relief. Updated medication dosage and provided lifestyle modification advice. Schedule follow-up in 3 months.",
    "Referred to specialist for further evaluation. Symptoms not improving with current treatment regimen. Ordered comprehensive blood panel.",
    "Prescribed 7-day course of antibiotics. Throat culture taken and sent to lab. Patient advised to increase fluid intake and rest.",
    "Symptoms subsiding with current treatment. Physical examination shows improvement. Continue treatment for additional 5 days.",
    "Administered scheduled vaccination with no adverse reactions. Updated immunization records and provided information sheet.",
    "Blood tests ordered to evaluate liver and kidney function. Discussed potential medication side effects and monitoring parameters.",
    "Reviewed diet and exercise habits. Recommended specific modifications including reduced sodium intake and 30 minutes of daily walking.",
    "Symptoms persist despite current regimen. Adjusted medication dosage and added new prescription to address breakthrough symptoms.",
    "No concerns identified during examination. All vitals within normal range. Routine follow-up scheduled for 6 months.",
    "Patient responding well to therapy. Reduced dosage of pain medication. Recommended physical therapy twice weekly for continued improvement.",
    "Discussed test results which indicate well-controlled condition. No medication changes needed at this time.",
    "Reviewed diabetic foot care and glucose monitoring technique. Adjusted insulin dosage based on recent glucose log.",
    "Provided nutritional counseling and weight management strategies. Set target goals for next visit.",
    "Addressed concerns about medication side effects. Explained expected timeline for symptom improvement.",
    "Performed comprehensive skin examination. Removed suspicious lesion for biopsy. Results pending.",
  ];
  return notes[Math.floor(Math.random() * notes.length)];
};

const getRandomPaymentStatus = () => {
  // 70% paid, 20% partial, 10% pending
  const random = Math.random();
  if (random < 0.7) {
    return "paid";
  } else if (random < 0.9) {
    return "partial";
  } else {
    return "pending";
  }
};

// Helper function to get patient name by ID
const getPatientName = (patientId) => {
  const patients = getItem(STORAGE_KEYS.PATIENTS) || [];
  const patient = patients.find((p) => p.id === patientId);
  return patient ? patient.name : "Unknown Patient";
};

// Helper function to get doctor name by ID
const getDoctorName = (doctorId) => {
  const users = getItem(STORAGE_KEYS.USERS) || [];
  const doctor = users.find((u) => u.id === doctorId && u.role === "doctor");
  return doctor ? doctor.name : "Unknown Doctor";
};

// Helper function to add minutes to a date
const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

// Helper function to subtract minutes from a date
const subMinutes = (date, minutes) => {
  return new Date(date.getTime() - minutes * 60000);
};

/**
 * Initialize enhanced demo data with realistic analytics and historical appointments
 */
export const initializeEnhancedDemoData = () => {
  // First, enhance the patient data with additional details
  updateAllPatientData();

  // Generate historical appointments
  const appointments = generateHistoricalAppointments();

  // Generate invoices based on appointments
  const invoices = generateInvoices(appointments);

  // Generate payment plans
  const paymentPlans = generatePaymentPlans(invoices);

  // Generate waiting room history
  const waitingRoom = generateWaitingRoomHistory(appointments);

  // Generate analytics data
  const analyticsData = generateAnalyticsData(appointments, invoices);

  // Save all the generated data to localStorage
  setItem(STORAGE_KEYS.APPOINTMENTS, appointments);
  setItem(STORAGE_KEYS.INVOICES, invoices);
  setItem(STORAGE_KEYS.PAYMENT_PLANS, paymentPlans);
  setItem(STORAGE_KEYS.WAITING_ROOM, waitingRoom);
  setItem(STORAGE_KEYS.ANALYTICS_DATA, analyticsData);

  // Return generated data for reference
  return {
    appointments,
    invoices,
    paymentPlans,
    waitingRoom,
    analyticsData,
  };
};

/**
 * Generate demo data
 * @returns {Object} Object containing doctors, patients, appointments, and invoices
 */
const generateDemoData = () => {
  const doctors = generateDoctors();
  const patients = generatePatients();
  const appointments = generateAppointments(doctors, patients);
  const invoices = generateInvoices(appointments);
  const paymentPlans = generatePaymentPlans(invoices);

  return {
    doctors,
    patients,
    appointments,
    invoices,
    paymentPlans,
  };
};
