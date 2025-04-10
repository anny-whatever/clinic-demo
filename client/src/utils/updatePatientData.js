/**
 * Utility functions to update patient data
 */

import { STORAGE_KEYS, getItem, setItem } from "./localStorage";

/**
 * Adds titles to patient names (Mr., Mrs., Dr., etc.)
 */
export const addTitlesToPatientNames = () => {
  const patients = getItem(STORAGE_KEYS.PATIENTS, []);

  if (!patients || patients.length === 0) {
    console.log("No patients found to update");
    return [];
  }

  const updatedPatients = patients.map((patient) => {
    if (!patient.name) return patient;

    // Skip if already has title
    if (
      patient.name.startsWith("Mr.") ||
      patient.name.startsWith("Mrs.") ||
      patient.name.startsWith("Ms.") ||
      patient.name.startsWith("Dr.")
    ) {
      return patient;
    }

    // Add appropriate title based on gender
    let updatedName;
    if (patient.gender === "Male") {
      updatedName = `Mr. ${patient.name}`;
    } else if (patient.gender === "Female") {
      // Randomly choose between Mrs. and Ms.
      const title = Math.random() > 0.5 ? "Mrs." : "Ms.";
      updatedName = `${title} ${patient.name}`;
    } else {
      // No change for other genders
      return patient;
    }

    return {
      ...patient,
      name: updatedName,
    };
  });

  // Save updated patients
  setItem(STORAGE_KEYS.PATIENTS, updatedPatients);
  console.log(`Updated ${updatedPatients.length} patient names with titles`);

  return updatedPatients;
};

/**
 * Adds middle names to patients
 */
export const addMiddleNamesToPatients = () => {
  const patients = getItem(STORAGE_KEYS.PATIENTS, []);

  if (!patients || patients.length === 0) {
    console.log("No patients found to update");
    return [];
  }

  const middleNames = [
    "A.",
    "B.",
    "C.",
    "D.",
    "E.",
    "J.",
    "L.",
    "M.",
    "R.",
    "S.",
    "T.",
  ];

  const updatedPatients = patients.map((patient) => {
    if (!patient.name) return patient;

    // Split the name to check if there's already a middle name
    const nameParts = patient.name.split(" ");

    // If name already has 3 or more parts, assume it has a middle name
    if (nameParts.length >= 3) return patient;

    // For names with titles like "Mr. John Smith"
    if (
      nameParts.length === 3 &&
      (nameParts[0].endsWith(".") || nameParts[0].endsWith(","))
    ) {
      return patient;
    }

    // Add a random middle name
    const randomMiddleName =
      middleNames[Math.floor(Math.random() * middleNames.length)];
    let updatedName;

    if (nameParts.length === 2) {
      // Simple first and last name
      updatedName = `${nameParts[0]} ${randomMiddleName} ${nameParts[1]}`;
    } else if (nameParts.length === 3 && nameParts[0].endsWith(".")) {
      // Name with title like "Mr. John Smith"
      updatedName = `${nameParts[0]} ${nameParts[1]} ${randomMiddleName} ${nameParts[2]}`;
    } else {
      // Other cases - just leave as is
      return patient;
    }

    return {
      ...patient,
      name: updatedName,
    };
  });

  // Save updated patients
  setItem(STORAGE_KEYS.PATIENTS, updatedPatients);
  console.log(`Updated patient names with middle names`);

  return updatedPatients;
};

/**
 * Update patient data with professional titles for some patients
 */
export const addProfessionalTitles = () => {
  const patients = getItem(STORAGE_KEYS.PATIENTS, []);

  if (!patients || patients.length === 0) {
    console.log("No patients found to update");
    return [];
  }

  // Only update about 20% of patients with professional titles
  const updatedPatients = patients.map((patient) => {
    // Random selection - only update ~20% of patients
    if (Math.random() > 0.2) return patient;

    if (!patient.name) return patient;

    // Replace any existing title
    let nameParts = patient.name.split(" ");
    // Remove existing title if present
    if (nameParts[0].endsWith(".")) {
      nameParts.shift();
    }

    const professionalTitles = ["Dr.", "Prof.", "Rev.", "Capt.", "Lt."];
    const randomTitle =
      professionalTitles[Math.floor(Math.random() * professionalTitles.length)];

    return {
      ...patient,
      name: `${randomTitle} ${nameParts.join(" ")}`,
    };
  });

  // Save updated patients
  setItem(STORAGE_KEYS.PATIENTS, updatedPatients);
  console.log(`Updated some patients with professional titles`);

  return updatedPatients;
};

/**
 * Add medical history to patients
 */
export const addMedicalHistoryToPatients = () => {
  const patients = getItem(STORAGE_KEYS.PATIENTS, []);

  if (!patients || patients.length === 0) {
    console.log("No patients found to update");
    return [];
  }

  const medicalConditions = [
    "Hypertension",
    "Diabetes Type 2",
    "Asthma",
    "Arthritis",
    "Migraine",
    "Hypothyroidism",
    "Allergies",
    "Gastritis",
    "Depression",
    "Anxiety Disorder",
    "GERD",
  ];

  const updatedPatients = patients.map((patient) => {
    // Skip patients who already have medical history
    if (patient.medicalHistory && patient.medicalHistory.length > 0) {
      return patient;
    }

    // Randomly assign 0-3 medical conditions
    const numberOfConditions = Math.floor(Math.random() * 4);
    const selectedConditions = [];

    for (let i = 0; i < numberOfConditions; i++) {
      const randomCondition =
        medicalConditions[Math.floor(Math.random() * medicalConditions.length)];
      // Avoid duplicates
      if (!selectedConditions.includes(randomCondition)) {
        selectedConditions.push(randomCondition);
      }
    }

    return {
      ...patient,
      medicalHistory: selectedConditions,
    };
  });

  // Save updated patients
  setItem(STORAGE_KEYS.PATIENTS, updatedPatients);
  console.log("Updated patients with medical history");

  return updatedPatients;
};

/**
 * Add emergency contact information to patients
 */
export const addEmergencyContacts = () => {
  const patients = getItem(STORAGE_KEYS.PATIENTS, []);

  if (!patients || patients.length === 0) {
    console.log("No patients found to update");
    return [];
  }

  const relationships = ["Spouse", "Parent", "Sibling", "Child", "Friend"];

  const updatedPatients = patients.map((patient) => {
    // Skip if patient already has emergency contact
    if (patient.emergencyContact) {
      return patient;
    }

    // Generate random name based on gender
    const relationship =
      relationships[Math.floor(Math.random() * relationships.length)];
    const phone = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    // Generate a name for emergency contact
    const names =
      relationship === "Spouse"
        ? patient.gender === "Male"
          ? ["Mary", "Sarah", "Jennifer"]
          : ["John", "Robert", "Michael"]
        : ["Emma", "David", "Sarah", "Thomas", "Lisa"];
    const surnames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Miller",
      "Davis",
    ];

    const contactName = `${names[Math.floor(Math.random() * names.length)]} ${
      surnames[Math.floor(Math.random() * surnames.length)]
    }`;

    return {
      ...patient,
      emergencyContact: {
        name: contactName,
        relationship: relationship,
        phone: phone,
      },
    };
  });

  // Save updated patients
  setItem(STORAGE_KEYS.PATIENTS, updatedPatients);
  console.log("Updated patients with emergency contacts");

  return updatedPatients;
};

/**
 * Add insurance information to patients
 */
export const addInsuranceInformation = () => {
  const patients = getItem(STORAGE_KEYS.PATIENTS, []);

  if (!patients || patients.length === 0) {
    console.log("No patients found to update");
    return [];
  }

  const insuranceProviders = [
    "Blue Cross",
    "Aetna",
    "UnitedHealth",
    "Cigna",
    "Humana",
    "Kaiser Permanente",
  ];

  const planTypes = ["HMO", "PPO", "EPO", "POS"];

  const updatedPatients = patients.map((patient) => {
    // Skip if patient already has insurance info
    if (patient.insurance) {
      return patient;
    }

    // 15% chance of having no insurance
    if (Math.random() < 0.15) {
      return {
        ...patient,
        insurance: null,
      };
    }

    const provider =
      insuranceProviders[Math.floor(Math.random() * insuranceProviders.length)];
    const planType = planTypes[Math.floor(Math.random() * planTypes.length)];
    const policyNumber = `POL-${Math.floor(
      10000000 + Math.random() * 90000000
    )}`;

    return {
      ...patient,
      insurance: {
        provider: provider,
        planType: planType,
        policyNumber: policyNumber,
        effectiveDate: new Date(
          Date.now() - Math.floor(Math.random() * 31536000000)
        )
          .toISOString()
          .split("T")[0], // Random date within the last year
        copayAmount: Math.floor(Math.random() * 4) * 5 + 20, // Random copay between $20-35 in $5 increments
      },
    };
  });

  // Save updated patients
  setItem(STORAGE_KEYS.PATIENTS, updatedPatients);
  console.log("Updated patients with insurance information");

  return updatedPatients;
};

/**
 * Update all patient names with various enhancements
 */
export const updateAllPatientData = () => {
  addTitlesToPatientNames();
  addMiddleNamesToPatients();
  addProfessionalTitles();
  addMedicalHistoryToPatients();
  addEmergencyContacts();
  addInsuranceInformation();
  console.log("All patient data updates completed");
};

export default updateAllPatientData;
