import { STORAGE_KEYS } from "./localStorage";
import { generateId, getCurrentDate } from "./helpers";
import { DEMO_DATA_INITIALIZED } from "./constants";

/**
 * Initial users for the demo application
 */
const initialUsers = [
  {
    id: "doctor1",
    username: "doctor1",
    password: "demo123",
    role: "doctor",
    name: "Dr. John Smith",
    specialization: "General Physician",
    signature: null,
  },
  {
    id: "receptionist1",
    username: "reception1",
    password: "demo123",
    role: "receptionist",
    name: "Jessica Brown",
  },
];

/**
 * Initial patients for the demo application
 */
const initialPatients = [
  {
    id: "patient1",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael@example.com",
    dob: "1985-06-15",
    gender: "Male",
    phone: "555-111-2222",
    address: "123 Main St, Anytown, USA",
    medicalHistory: "Hypertension, Allergies to penicillin",
    registrationDate: "2023-01-10",
  },
  {
    id: "patient2",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily@example.com",
    dob: "1990-09-22",
    gender: "Female",
    phone: "555-222-3333",
    address: "456 Oak Ave, Somewhere, USA",
    medicalHistory: "Asthma",
    registrationDate: "2023-02-15",
  },
  {
    id: "patient3",
    firstName: "Robert",
    lastName: "Wilson",
    email: "robert@example.com",
    dob: "1975-11-30",
    gender: "Male",
    phone: "555-333-4444",
    address: "789 Pine St, Elsewhere, USA",
    medicalHistory: "Diabetes Type 2",
    registrationDate: "2023-03-05",
  },
];

/**
 * Initial appointments for the demo application
 */
const initialAppointments = [
  {
    id: "appt1",
    patientId: "patient1",
    doctorId: "doctor1",
    date: getCurrentDate(),
    time: "09:00",
    status: "scheduled",
    reason: "Annual checkup",
    notes: "",
  },
  {
    id: "appt2",
    patientId: "patient2",
    doctorId: "doctor1",
    date: getCurrentDate(),
    time: "10:30",
    status: "scheduled",
    reason: "Respiratory issues",
    notes: "",
  },
  {
    id: "appt3",
    patientId: "patient3",
    doctorId: "doctor1",
    date: getCurrentDate(),
    time: "14:00",
    status: "scheduled",
    reason: "Follow-up on medication",
    notes: "",
  },
];

/**
 * Initial medicines for the demo application
 */
const initialMedicines = [
  {
    id: "med1",
    name: "Amoxicillin",
    manufacturer: "PharmaCorp",
    description: "Antibiotic for bacterial infections",
    dosageForm: "Capsule",
    strength: "500mg",
    stock: 150,
  },
  {
    id: "med2",
    name: "Lisinopril",
    manufacturer: "MediLabs",
    description: "ACE inhibitor for hypertension",
    dosageForm: "Tablet",
    strength: "10mg",
    stock: 200,
  },
  {
    id: "med3",
    name: "Albuterol",
    manufacturer: "RespiCare",
    description: "Bronchodilator for asthma",
    dosageForm: "Inhaler",
    strength: "90mcg",
    stock: 75,
  },
  {
    id: "med4",
    name: "Metformin",
    manufacturer: "DiabeCare",
    description: "Oral medication for type 2 diabetes",
    dosageForm: "Tablet",
    strength: "500mg",
    stock: 180,
  },
  {
    id: "med5",
    name: "Atorvastatin",
    manufacturer: "HeartWell",
    description: "Statin for cholesterol control",
    dosageForm: "Tablet",
    strength: "20mg",
    stock: 120,
  },
];

/**
 * Initial prescriptions for the demo application
 */
const initialPrescriptions = [
  {
    id: "rx1",
    patientId: "patient1",
    doctorId: "doctor1",
    date: getCurrentDate(),
    medicines: [
      {
        medicineId: "med2",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "30 days",
      },
    ],
    instructions: "Take in the morning with food",
    notes: "Follow up in 30 days",
  },
  {
    id: "rx2",
    patientId: "patient2",
    doctorId: "doctor1",
    date: getCurrentDate(),
    medicines: [
      {
        medicineId: "med3",
        dosage: "2 puffs",
        frequency: "As needed",
        duration: "Ongoing",
      },
    ],
    instructions: "Use inhaler when experiencing shortness of breath",
    notes: "Schedule follow-up if symptoms worsen",
  },
  {
    id: "rx3",
    patientId: "patient3",
    doctorId: "doctor1",
    date: getCurrentDate(),
    medicines: [
      {
        medicineId: "med4",
        dosage: "1 tablet",
        frequency: "Twice daily",
        duration: "90 days",
      },
      {
        medicineId: "med5",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "90 days",
      },
    ],
    instructions:
      "Take metformin with meals. Take atorvastatin in the evening.",
    notes: "Monitor blood sugar levels regularly",
  },
];

/**
 * Initial medical records for the demo application
 */
const initialMedicalRecords = [
  {
    id: "rec1",
    patientId: "patient1",
    doctorId: "doctor1",
    date: "2023-03-15",
    visitType: "Regular checkup",
    symptoms: "Headache, elevated blood pressure",
    diagnosis: "Hypertension",
    treatment: "Prescribed Lisinopril 10mg",
    notes: "Patient advised to reduce salt intake and exercise regularly",
  },
  {
    id: "rec2",
    patientId: "patient2",
    doctorId: "doctor1",
    date: "2023-04-10",
    visitType: "Emergency",
    symptoms: "Wheezing, shortness of breath",
    diagnosis: "Acute asthma attack",
    treatment: "Administered albuterol inhaler, prescribed ongoing use",
    notes: "Patient responded well to treatment",
  },
  {
    id: "rec3",
    patientId: "patient3",
    doctorId: "doctor1",
    date: "2023-02-25",
    visitType: "Follow-up",
    symptoms: "Fatigue, excessive thirst",
    diagnosis: "Type 2 Diabetes",
    treatment: "Prescribed Metformin 500mg and Atorvastatin 20mg",
    notes: "Referred to nutritionist for dietary guidance",
  },
];

/**
 * Initialize demo data in localStorage
 */
export const initializeDemoData = () => {
  try {
    // Check if demo data is already initialized
    const initialized = localStorage.getItem(DEMO_DATA_INITIALIZED);
    if (initialized === "true") {
      return;
    }

    // Initialize users
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));

    // Initialize patients
    localStorage.setItem(
      STORAGE_KEYS.PATIENTS,
      JSON.stringify(initialPatients)
    );

    // Initialize appointments
    localStorage.setItem(
      STORAGE_KEYS.APPOINTMENTS,
      JSON.stringify(initialAppointments)
    );

    // Initialize medicines
    localStorage.setItem(
      STORAGE_KEYS.MEDICINES,
      JSON.stringify(initialMedicines)
    );

    // Initialize prescriptions
    localStorage.setItem(
      STORAGE_KEYS.PRESCRIPTIONS,
      JSON.stringify(initialPrescriptions)
    );

    // Initialize medical records
    localStorage.setItem(
      STORAGE_KEYS.MEDICAL_RECORDS,
      JSON.stringify(initialMedicalRecords)
    );

    // Mark demo data as initialized
    localStorage.setItem(DEMO_DATA_INITIALIZED, "true");

    console.log("Demo data initialized successfully");
  } catch (error) {
    console.error("Error initializing demo data:", error);
  }
};

/**
 * Reset the demo data to its initial state
 */
export const resetDemoData = () => {
  try {
    // Remove the initialization flag
    localStorage.removeItem(DEMO_DATA_INITIALIZED);

    // Re-initialize the data
    initializeDemoData();

    console.log("Demo data reset successfully");
  } catch (error) {
    console.error("Error resetting demo data:", error);
  }
};
