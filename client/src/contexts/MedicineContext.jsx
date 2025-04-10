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

// Create Medicine Context
const MedicineContext = createContext();

// Medicine Provider Component
export const MedicineProvider = ({ children }) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load medicines from localStorage on mount
  useEffect(() => {
    const loadMedicines = () => {
      try {
        const storedMedicines = getEntities(STORAGE_KEYS.MEDICINES);
        setMedicines(storedMedicines);
      } catch (error) {
        console.error("Error loading medicines:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMedicines();
  }, []);

  // Get medicine by ID
  const getMedicineById = useCallback((id) => {
    return getEntityById(STORAGE_KEYS.MEDICINES, id);
  }, []);

  // Add new medicine
  const addMedicine = useCallback((medicineData) => {
    const newMedicine = {
      id: generateEntityId("medicine"),
      ...medicineData,
    };

    const addedMedicine = addEntity(STORAGE_KEYS.MEDICINES, newMedicine);
    setMedicines((prevMedicines) => [...prevMedicines, addedMedicine]);

    return addedMedicine;
  }, []);

  // Update medicine
  const updateMedicine = useCallback((id, updates) => {
    const updatedMedicine = updateEntity(STORAGE_KEYS.MEDICINES, id, updates);

    if (updatedMedicine) {
      setMedicines((prevMedicines) =>
        prevMedicines.map((medicine) =>
          medicine.id === id ? updatedMedicine : medicine
        )
      );
    }

    return updatedMedicine;
  }, []);

  // Remove medicine
  const removeMedicine = useCallback((id) => {
    const success = removeEntity(STORAGE_KEYS.MEDICINES, id);

    if (success) {
      setMedicines((prevMedicines) =>
        prevMedicines.filter((medicine) => medicine.id !== id)
      );
    }

    return success;
  }, []);

  // Update medicine inventory
  const updateInventory = useCallback(
    (id, change) => {
      const medicine = getMedicineById(id);

      if (!medicine) return null;

      const updatedInventory = Math.max(0, medicine.inventory + change);
      return updateMedicine(id, { inventory: updatedInventory });
    },
    [getMedicineById, updateMedicine]
  );

  // Check if medicine is low in stock
  const isLowStock = useCallback((medicine, threshold = 20) => {
    return medicine.inventory <= threshold;
  }, []);

  // Value object for the context provider
  const value = {
    medicines,
    loading,
    getMedicineById,
    addMedicine,
    updateMedicine,
    removeMedicine,
    updateInventory,
    isLowStock,
  };

  return (
    <MedicineContext.Provider value={value}>
      {children}
    </MedicineContext.Provider>
  );
};

// Custom hook for using Medicine Context
export const useMedicines = () => {
  const context = useContext(MedicineContext);
  if (!context) {
    throw new Error("useMedicines must be used within a MedicineProvider");
  }
  return context;
};

export default MedicineContext;
