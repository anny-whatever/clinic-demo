import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  STORAGE_KEYS,
  getItem,
  setItem,
  addItem,
  updateItem,
  deleteItem,
} from "../utils/localStorage";
import { generateEntityId } from "../utils/idUtils";
import { useAuth } from "./AuthContext";

// Make sure PRESCRIPTION_TEMPLATES key is defined
if (!STORAGE_KEYS.PRESCRIPTION_TEMPLATES) {
  STORAGE_KEYS.PRESCRIPTION_TEMPLATES = "CLINIC_PRESCRIPTION_TEMPLATES";
}

// Create Prescription Context
const PrescriptionContext = createContext();

// Prescription Provider Component
export const PrescriptionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionTemplates, setPrescriptionTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load prescriptions and templates from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedPrescriptions = getItem(STORAGE_KEYS.PRESCRIPTIONS, []);
        const storedTemplates = getItem(
          STORAGE_KEYS.PRESCRIPTION_TEMPLATES,
          []
        );

        setPrescriptions(
          Array.isArray(storedPrescriptions) ? storedPrescriptions : []
        );
        setPrescriptionTemplates(
          Array.isArray(storedTemplates) ? storedTemplates : []
        );
      } catch (error) {
        console.error("Error loading prescription data:", error);
        // Set default empty arrays in case of error
        setPrescriptions([]);
        setPrescriptionTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get prescription by ID
  const getPrescriptionById = useCallback(
    (id) => {
      return (
        prescriptions.find((prescription) => prescription.id === id) || null
      );
    },
    [prescriptions]
  );

  // Add new prescription
  const addPrescription = useCallback((prescriptionData) => {
    const newPrescription = {
      id: generateEntityId("prescription"),
      date: new Date().toISOString().split("T")[0],
      status: "active",
      ...prescriptionData,
    };

    const addedPrescription = addItem(
      STORAGE_KEYS.PRESCRIPTIONS,
      newPrescription
    );
    setPrescriptions((prev) => [...prev, addedPrescription]);

    return addedPrescription;
  }, []);

  // Update prescription
  const updatePrescription = useCallback((id, updates) => {
    const updatedPrescription = updateItem(
      STORAGE_KEYS.PRESCRIPTIONS,
      id,
      updates
    );

    if (updatedPrescription) {
      setPrescriptions((prev) =>
        prev.map((prescription) =>
          prescription.id === id ? updatedPrescription : prescription
        )
      );
    }

    return updatedPrescription;
  }, []);

  // Delete prescription
  const deletePrescription = useCallback((id) => {
    const success = deleteItem(STORAGE_KEYS.PRESCRIPTIONS, id);

    if (success) {
      setPrescriptions((prev) =>
        prev.filter((prescription) => prescription.id !== id)
      );
    }

    return success;
  }, []);

  // Get prescriptions for a patient
  const getPatientPrescriptions = useCallback(
    (patientId) => {
      return prescriptions.filter(
        (prescription) => prescription.patientId === patientId
      );
    },
    [prescriptions]
  );

  // Get prescriptions created by a doctor
  const getDoctorPrescriptions = useCallback(
    (doctorId) => {
      return prescriptions.filter(
        (prescription) => prescription.doctorId === doctorId
      );
    },
    [prescriptions]
  );

  // Get prescriptions for current user (if doctor)
  const getCurrentUserPrescriptions = useCallback(() => {
    if (!currentUser || currentUser.role !== "doctor") return [];
    return getDoctorPrescriptions(currentUser.id);
  }, [currentUser, getDoctorPrescriptions]);

  // PRESCRIPTION TEMPLATE METHODS

  // Get template by ID
  const getTemplateById = useCallback(
    (id) => {
      return (
        prescriptionTemplates.find((template) => template.id === id) || null
      );
    },
    [prescriptionTemplates]
  );

  // Add new template
  const addTemplate = useCallback((templateData) => {
    const newTemplate = {
      id: generateEntityId("template"),
      ...templateData,
    };

    const addedTemplate = addItem(
      STORAGE_KEYS.PRESCRIPTION_TEMPLATES,
      newTemplate
    );
    setPrescriptionTemplates((prev) => [...prev, addedTemplate]);

    return addedTemplate;
  }, []);

  // Update template
  const updateTemplate = useCallback((id, updates) => {
    const updatedTemplate = updateItem(
      STORAGE_KEYS.PRESCRIPTION_TEMPLATES,
      id,
      updates
    );

    if (updatedTemplate) {
      setPrescriptionTemplates((prev) =>
        prev.map((template) =>
          template.id === id ? updatedTemplate : template
        )
      );
    }

    return updatedTemplate;
  }, []);

  // Delete template
  const deleteTemplate = useCallback((id) => {
    const success = deleteItem(STORAGE_KEYS.PRESCRIPTION_TEMPLATES, id);

    if (success) {
      setPrescriptionTemplates((prev) =>
        prev.filter((template) => template.id !== id)
      );
    }

    return success;
  }, []);

  // Get templates for a doctor
  const getDoctorTemplates = useCallback(
    (doctorId) => {
      // Ensure prescriptionTemplates is an array before filtering
      if (!Array.isArray(prescriptionTemplates)) {
        console.warn(
          "prescriptionTemplates is not an array:",
          prescriptionTemplates
        );
        return [];
      }
      return prescriptionTemplates.filter(
        (template) => template.doctorId === doctorId
      );
    },
    [prescriptionTemplates]
  );

  // Get templates for current user (if doctor)
  const getCurrentUserTemplates = useCallback(() => {
    if (!currentUser || currentUser.role !== "doctor") return [];
    return getDoctorTemplates(currentUser.id);
  }, [currentUser, getDoctorTemplates]);

  // Create prescription from template
  const createPrescriptionFromTemplate = useCallback(
    (templateId, patientId, appointmentId = null) => {
      const template = getTemplateById(templateId);

      if (!template) {
        throw new Error("Template not found");
      }

      const prescriptionData = {
        patientId,
        appointmentId,
        doctorId: template.doctorId,
        medicines: [...template.medicines],
        diagnosis: template.diagnosis || "",
        instructions: template.instructions || "",
        notes: template.notes || "",
        fromTemplateId: templateId,
      };

      return addPrescription(prescriptionData);
    },
    [getTemplateById, addPrescription]
  );

  // Add custom (non-inventory) medicine to prescription or template
  const addCustomMedicine = useCallback((medicine) => {
    // Generate a custom ID for the non-inventory medicine
    const customId = generateEntityId("customMed");

    return {
      ...medicine,
      medicineId: medicine.medicineId || customId,
      isCustom: true,
      name: medicine.name || "", // Ensure name is included for custom medicines
    };
  }, []);

  // Value object
  const value = {
    prescriptions,
    prescriptionTemplates,
    loading,
    getPrescriptionById,
    addPrescription,
    updatePrescription,
    deletePrescription,
    getPatientPrescriptions,
    getDoctorPrescriptions,
    getCurrentUserPrescriptions,
    getTemplateById,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getDoctorTemplates,
    getCurrentUserTemplates,
    createPrescriptionFromTemplate,
    addCustomMedicine,
  };

  return (
    <PrescriptionContext.Provider value={value}>
      {children}
    </PrescriptionContext.Provider>
  );
};

// Custom hook for using Prescription Context
export const usePrescriptions = () => {
  const context = useContext(PrescriptionContext);
  if (!context) {
    throw new Error(
      "usePrescriptions must be used within a PrescriptionProvider"
    );
  }
  return context;
};

export default PrescriptionContext;
