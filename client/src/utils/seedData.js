/**
 * Seeds the application with sample data
 */

import { STORAGE_KEYS, getItem, setItem } from "./localStorage";
import { generateEntityId } from "./idUtils";
import { DEMO_DATA_INITIALIZED } from "./constants";

/**
 * Seed sample patients
 */
export const seedPatients = () => {
  // Get existing patients
  const existingPatients = getItem(STORAGE_KEYS.PATIENTS, []);

  // Check if demo data has already been initialized
  const demoInitialized = getItem(DEMO_DATA_INITIALIZED);

  // Only seed if there are fewer than 3 patients and demo hasn't been initialized
  if (existingPatients.length >= 3 || demoInitialized) {
    console.log("Patient data already exists, skipping seed");
    return;
  }

  const samplePatients = [
    {
      id: generateEntityId("patient"),
      name: "John Smith",
      age: 42,
      gender: "Male",
      contact: "555-123-4567",
      email: "john.smith@example.com",
      address: "123 Main St, Anytown, USA",
      bloodGroup: "O+",
      medicalHistory: "Hypertension, Seasonal allergies",
      emergencyContact: "Jane Smith (Wife) - 555-987-6543",
      insuranceDetails: "HealthPlus #12345678",
      registrationDate: new Date().toISOString(),
    },
    {
      id: generateEntityId("patient"),
      name: "Emily Johnson",
      age: 35,
      gender: "Female",
      contact: "555-234-5678",
      email: "emily.johnson@example.com",
      address: "456 Oak Ave, Someville, USA",
      bloodGroup: "A-",
      medicalHistory: "Asthma, Migraine",
      emergencyContact: "Michael Johnson (Husband) - 555-876-5432",
      insuranceDetails: "MediCare #87654321",
      registrationDate: new Date().toISOString(),
    },
    {
      id: generateEntityId("patient"),
      name: "David Chen",
      age: 28,
      gender: "Male",
      contact: "555-345-6789",
      email: "david.chen@example.com",
      address: "789 Pine St, Otherburg, USA",
      bloodGroup: "B+",
      medicalHistory: "No significant issues",
      emergencyContact: "Linda Chen (Mother) - 555-765-4321",
      insuranceDetails: "Blue Shield #23456789",
      registrationDate: new Date().toISOString(),
    },
    {
      id: generateEntityId("patient"),
      name: "Sarah Wilson",
      age: 51,
      gender: "Female",
      contact: "555-456-7890",
      email: "sarah.wilson@example.com",
      address: "101 Elm St, Newtown, USA",
      bloodGroup: "AB+",
      medicalHistory: "Type 2 Diabetes, Osteoarthritis",
      emergencyContact: "Robert Wilson (Son) - 555-654-3210",
      insuranceDetails: "HealthGuard #34567890",
      registrationDate: new Date().toISOString(),
    },
    {
      id: generateEntityId("patient"),
      name: "Michael Rodriguez",
      age: 63,
      gender: "Male",
      contact: "555-567-8901",
      email: "michael.rodriguez@example.com",
      address: "202 Cedar Ln, Oldville, USA",
      bloodGroup: "O-",
      medicalHistory: "Coronary Artery Disease, Hyperlipidemia",
      emergencyContact: "Maria Rodriguez (Daughter) - 555-543-2109",
      insuranceDetails: "Senior Care #45678901",
      registrationDate: new Date().toISOString(),
    },
  ];

  // Merge with existing patients and save
  const updatedPatients = [...existingPatients, ...samplePatients];
  setItem(STORAGE_KEYS.PATIENTS, updatedPatients);

  console.log(`Added ${samplePatients.length} sample patients`);
  return samplePatients;
};

/**
 * Initialize all sample data
 */
export const initializeSampleData = () => {
  // Check if demo data has already been initialized
  if (getItem(DEMO_DATA_INITIALIZED)) {
    console.log("Demo data already initialized, skipping");
    return;
  }

  seedPatients();
  // Add other seed functions here as needed

  console.log("Sample data initialized");
};

export default initializeSampleData;
