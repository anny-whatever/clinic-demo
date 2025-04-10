/**
 * Application Constants
 */

// User Roles
export const USER_ROLES = {
  DOCTOR: "doctor",
  RECEPTIONIST: "receptionist",
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  PARTIAL: "partial",
  WAIVED: "waived",
  REFUNDED: "refunded",
};

// Gender Options
export const GENDER_OPTIONS = ["Male", "Female", "Other"];

// Demo Data Flag
export const DEMO_DATA_INITIALIZED = "CLINIC_DEMO_INITIALIZED";

// Routes
export const ROUTES = {
  LOGIN: "/login",
  DOCTOR: {
    DASHBOARD: "/doctor/dashboard",
    APPOINTMENTS: "/doctor/appointments",
    PATIENTS: "/doctor/patients",
    PRESCRIPTIONS: "/doctor/prescriptions",
    TEMPLATES: "/doctor/templates",
    UNAVAILABILITY: "/doctor/unavailability",
    TIME_SLOTS: "/doctor/time-slots",
  },
  RECEPTIONIST: {
    DASHBOARD: "/receptionist/dashboard",
    APPOINTMENTS: "/receptionist/appointments",
    PATIENTS: "/receptionist/patients",
    WAITING_ROOM: "/receptionist/waiting-room",
    INVOICES: "/receptionist/invoices",
    PAYMENTS: "/receptionist/payments",
    PAYMENT_PLANS: "/receptionist/payment-plans",
    BILLING: "/receptionist/billing",
  },
  COMMON: {
    MEDICINES: "/medicines",
    ANALYTICS: "/analytics",
  },
};

// Time slot durations (in minutes)
export const TIME_SLOT_DURATION = {
  DEFAULT: 30,
  EXTENDED: 60,
  SHORT: 15,
};

// Default working hours
export const DEFAULT_WORKING_HOURS = {
  start: "09:00",
  end: "17:00",
  lunchStart: "12:00",
  lunchEnd: "13:00",
};

// Default working days (0 = Sunday, 6 = Saturday)
export const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday

// Payment methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  ONLINE: "online",
  INSURANCE: "insurance",
};

// Medicine types
export const MEDICINE_TYPES = {
  TABLET: "Tablet",
  CAPSULE: "Capsule",
  SYRUP: "Syrup",
  INJECTION: "Injection",
  CREAM: "Cream",
  OINTMENT: "Ointment",
  DROPS: "Drops",
  INHALER: "Inhaler",
  POWDER: "Powder",
  SPRAY: "Spray",
  PATCH: "Patch",
  SUPPOSITORY: "Suppository",
  LOTION: "Lotion",
  GEL: "Gel",
  SUSPENSION: "Suspension",
  SOLUTION: "Solution",
  INFUSION: "Infusion",
};

// Route of administration
export const ADMINISTRATION_ROUTES = {
  ORAL: "Oral",
  TOPICAL: "Topical",
  INTRAVENOUS: "Intravenous (IV)",
  INTRAMUSCULAR: "Intramuscular (IM)",
  SUBCUTANEOUS: "Subcutaneous",
  INHALATION: "Inhalation",
  NASAL: "Nasal",
  OPHTHALMIC: "Ophthalmic (Eye)",
  OTIC: "Otic (Ear)",
  RECTAL: "Rectal",
  VAGINAL: "Vaginal",
  SUBLINGUAL: "Sublingual",
  BUCCAL: "Buccal",
  TRANSDERMAL: "Transdermal",
};

// Medicine frequency
export const MEDICINE_FREQUENCY = {
  ONCE: "Once a day",
  TWICE: "Twice a day",
  THRICE: "Three times a day",
  FOUR_TIMES: "Four times a day",
  EVERY_HOUR: "Every hour",
  EVERY_TWO_HOURS: "Every 2 hours",
  EVERY_FOUR_HOURS: "Every 4 hours",
  EVERY_SIX_HOURS: "Every 6 hours",
  EVERY_EIGHT_HOURS: "Every 8 hours",
  EVERY_TWELVE_HOURS: "Every 12 hours",
  AS_NEEDED: "As needed (PRN)",
  BEFORE_MEALS: "Before meals",
  AFTER_MEALS: "After meals",
  BEFORE_BED: "Before bed",
  MORNING: "Morning only",
  AFTERNOON: "Afternoon only",
  EVENING: "Evening only",
  WEEKENDS: "Weekends only",
  WEEKLY: "Once a week",
  BIWEEKLY: "Twice a week",
  MONTHLY: "Once a month",
  CUSTOM: "Custom frequency",
};

// Meal relation
export const MEAL_RELATION = {
  BEFORE_MEAL: "Before meals",
  WITH_MEAL: "With meals",
  AFTER_MEAL: "After meals",
  NO_RELATION: "No specific relation to meals",
  EMPTY_STOMACH: "On empty stomach",
};

// Medicine durations
export const MEDICINE_DURATION = {
  ONE_DAY: "1 day",
  TWO_DAYS: "2 days",
  THREE_DAYS: "3 days",
  FIVE_DAYS: "5 days",
  ONE_WEEK: "1 week",
  TWO_WEEKS: "2 weeks",
  THREE_WEEKS: "3 weeks",
  ONE_MONTH: "1 month",
  TWO_MONTHS: "2 months",
  THREE_MONTHS: "3 months",
  SIX_MONTHS: "6 months",
  ONE_YEAR: "1 year",
  CONTINUOUS: "Continuous",
  AS_DIRECTED: "As directed",
  CUSTOM: "Custom duration",
};

// Special instructions
export const SPECIAL_INSTRUCTIONS = [
  "Take with plenty of water",
  "Avoid alcohol while taking this medicine",
  "May cause drowsiness, avoid driving",
  "Take on an empty stomach",
  "Complete the full course even if feeling better",
  "Store in a cool, dry place",
  "Protect from sunlight",
  "Keep refrigerated",
  "Shake well before use",
  "Do not crush or chew",
  "May discolor urine or stool",
  "May cause sensitivity to sunlight",
  "Avoid grapefruit juice",
  "Take at the same time each day",
];

// Time slots (30 min intervals from 8 AM to 6 PM)
export const DEFAULT_TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  const startTime = `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;

  const endHour = minute === 30 ? hour + 1 : hour;
  const endMinute = minute === 30 ? 0 : 30;
  const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
    .toString()
    .padStart(2, "0")}`;

  return { startTime, endTime };
});

// Default appointment duration in minutes
export const DEFAULT_APPOINTMENT_DURATION = 30;

// Waiting room priority
export const WAITING_ROOM_PRIORITY = {
  URGENT: 0,
  NORMAL: 1,
};

// Chart colors
export const CHART_COLORS = [
  "#4299E1", // blue
  "#48BB78", // green
  "#F6AD55", // orange
  "#F56565", // red
  "#9F7AEA", // purple
  "#ED8936", // orange-darker
  "#38B2AC", // teal
  "#667EEA", // indigo
  "#FC8181", // pink
  "#4FD1C5", // teal-lighter
];

// Date formats
export const DATE_FORMATS = {
  DEFAULT: "yyyy-MM-dd",
  DISPLAY: "MMM dd, yyyy",
  DAY_MONTH: "MMM dd",
  MONTH_YEAR: "MMM yyyy",
  TIME: "hh:mm a",
  DATE_TIME: "MMM dd, yyyy hh:mm a",
  DAY_OF_WEEK: "EEE",
};
