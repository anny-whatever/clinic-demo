import { STORAGE_KEYS, getItem, setItem } from "./localStorage";
import { generateEntityId } from "./idUtils";
import { DEMO_DATA_INITIALIZED } from "./constants";

/**
 * Generate demo users (4 doctors and 1 receptionist)
 * @returns {Array} - Array of user objects
 */
const generateDemoUsers = () => [
  {
    id: generateEntityId("doctor"),
    username: "doctor1",
    password: "demo123",
    role: "doctor",
    name: "Dr. John Smith",
    specialization: "General Physician",
    signature: null, // Will be updated when user adds signature
  },
  {
    id: generateEntityId("doctor"),
    username: "doctor2",
    password: "demo123",
    role: "doctor",
    name: "Dr. Sarah Jones",
    specialization: "Pediatrician",
    signature: null,
  },
  {
    id: generateEntityId("doctor"),
    username: "doctor3",
    password: "demo123",
    role: "doctor",
    name: "Dr. Robert Williams",
    specialization: "Cardiologist",
    signature: null,
  },
  {
    id: generateEntityId("doctor"),
    username: "doctor4",
    password: "demo123",
    role: "doctor",
    name: "Dr. Emily Davis",
    specialization: "Dermatologist",
    signature: null,
  },
  {
    id: generateEntityId("receptionist"),
    username: "reception1",
    password: "demo123",
    role: "receptionist",
    name: "Jessica Brown",
  },
];

/**
 * Generate demo medicines
 * @returns {Array} - Array of medicine objects
 */
const generateDemoMedicines = () => [
  {
    id: generateEntityId("medicine"),
    name: "Paracetamol",
    dosage: "500mg",
    type: "Tablet",
    inventory: 100,
  },
  {
    id: generateEntityId("medicine"),
    name: "Amoxicillin",
    dosage: "250mg",
    type: "Capsule",
    inventory: 80,
  },
  {
    id: generateEntityId("medicine"),
    name: "Ibuprofen",
    dosage: "400mg",
    type: "Tablet",
    inventory: 120,
  },
  {
    id: generateEntityId("medicine"),
    name: "Cetrizine",
    dosage: "10mg",
    type: "Tablet",
    inventory: 75,
  },
  {
    id: generateEntityId("medicine"),
    name: "Aspirin",
    dosage: "100mg",
    type: "Tablet",
    inventory: 150,
  },
  {
    id: generateEntityId("medicine"),
    name: "Omeprazole",
    dosage: "20mg",
    type: "Capsule",
    inventory: 60,
  },
  {
    id: generateEntityId("medicine"),
    name: "Salbutamol",
    dosage: "100mcg",
    type: "Inhaler",
    inventory: 30,
  },
  {
    id: generateEntityId("medicine"),
    name: "Metformin",
    dosage: "500mg",
    type: "Tablet",
    inventory: 90,
  },
  {
    id: generateEntityId("medicine"),
    name: "Simvastatin",
    dosage: "20mg",
    type: "Tablet",
    inventory: 70,
  },
  {
    id: generateEntityId("medicine"),
    name: "Amoxicillin-Clavulanate",
    dosage: "625mg",
    type: "Tablet",
    inventory: 50,
  },
];

/**
 * Generate demo patients
 * @returns {Array} - Array of patient objects
 */
const generateDemoPatients = () => [
  {
    id: generateEntityId("patient"),
    name: "Jane Doe",
    age: 35,
    gender: "Female",
    contact: "1234567890",
    email: "jane@example.com",
    address: "123 Main St",
  },
  {
    id: generateEntityId("patient"),
    name: "John Williams",
    age: 45,
    gender: "Male",
    contact: "9876543210",
    email: "john@example.com",
    address: "456 Park Ave",
  },
  {
    id: generateEntityId("patient"),
    name: "Mary Johnson",
    age: 28,
    gender: "Female",
    contact: "4567891230",
    email: "mary@example.com",
    address: "789 Maple St",
  },
  {
    id: generateEntityId("patient"),
    name: "Robert Brown",
    age: 52,
    gender: "Male",
    contact: "7891234560",
    email: "robert@example.com",
    address: "321 Oak St",
  },
  {
    id: generateEntityId("patient"),
    name: "Sarah Davis",
    age: 32,
    gender: "Female",
    contact: "1237894560",
    email: "sarah@example.com",
    address: "654 Pine St",
  },
];

/**
 * Initialize demo data in localStorage
 */
export const initializeDemoData = () => {
  // Check if demo data has already been initialized
  if (getItem(DEMO_DATA_INITIALIZED)) {
    return;
  }

  // Generate and save demo data
  setItem(STORAGE_KEYS.USERS, generateDemoUsers());
  setItem(STORAGE_KEYS.MEDICINES, generateDemoMedicines());
  setItem(STORAGE_KEYS.PATIENTS, generateDemoPatients());

  // Initialize empty arrays for other data structures
  setItem(STORAGE_KEYS.TIME_SLOTS, []);
  setItem(STORAGE_KEYS.DOCTOR_UNAVAILABILITY, []);
  setItem(STORAGE_KEYS.APPOINTMENTS, []);
  setItem(STORAGE_KEYS.WAITING_ROOM, { currentQueue: [], history: [] });
  setItem(STORAGE_KEYS.PRESCRIPTION_TEMPLATES, []);
  setItem(STORAGE_KEYS.PRESCRIPTIONS, []);
  setItem(STORAGE_KEYS.INVOICES, []);
  setItem(STORAGE_KEYS.PAYMENT_PLANS, []);
  setItem(STORAGE_KEYS.ANALYTICS_DATA, {
    appointmentStats: { daily: [], weekly: [], monthly: [] },
    doctorPerformance: [],
    financialSummary: { daily: [], weekly: [], monthly: [] },
  });

  // Mark demo data as initialized
  setItem(DEMO_DATA_INITIALIZED, true);
};
