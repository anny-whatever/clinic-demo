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

// Create Patient Context
const PatientContext = createContext();

// Patient Provider Component
export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load patients from localStorage on mount
  useEffect(() => {
    const loadPatients = () => {
      try {
        const storedPatients = getEntities(STORAGE_KEYS.PATIENTS);
        setPatients(storedPatients);
      } catch (error) {
        console.error("Error loading patients:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // Get patient by ID
  const getPatientById = useCallback((id) => {
    return getEntityById(STORAGE_KEYS.PATIENTS, id);
  }, []);

  // Add new patient
  const addPatient = useCallback((patientData) => {
    const newPatient = {
      id: generateEntityId("patient"),
      ...patientData,
    };

    const addedPatient = addEntity(STORAGE_KEYS.PATIENTS, newPatient);
    setPatients((prevPatients) => [...prevPatients, addedPatient]);

    return addedPatient;
  }, []);

  // Update patient
  const updatePatient = useCallback((id, updates) => {
    const updatedPatient = updateEntity(STORAGE_KEYS.PATIENTS, id, updates);

    if (updatedPatient) {
      setPatients((prevPatients) =>
        prevPatients.map((patient) =>
          patient.id === id ? updatedPatient : patient
        )
      );
    }

    return updatedPatient;
  }, []);

  // Remove patient
  const removePatient = useCallback((id) => {
    const success = removeEntity(STORAGE_KEYS.PATIENTS, id);

    if (success) {
      setPatients((prevPatients) =>
        prevPatients.filter((patient) => patient.id !== id)
      );
    }

    return success;
  }, []);

  // Search patients (by name, email, or contact)
  const searchPatients = useCallback(
    (searchTerm) => {
      if (!searchTerm) return patients;

      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      return patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          (patient.email &&
            patient.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (patient.contact && patient.contact.includes(searchTerm))
      );
    },
    [patients]
  );

  // Value object for the context provider
  const value = {
    patients,
    loading,
    getPatientById,
    addPatient,
    updatePatient,
    removePatient,
    searchPatients,
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};

// Custom hook for using Patient Context
export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatients must be used within a PatientProvider");
  }
  return context;
};

// Alias for backward compatibility
export const usePatient = usePatients;

export default PatientContext;
