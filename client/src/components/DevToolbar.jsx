import { useState } from "react";
import { seedPatients, initializeSampleData } from "../utils/seedData";
import {
  addTitlesToPatientNames,
  addMiddleNamesToPatients,
  addProfessionalTitles,
  updateAllPatientData,
} from "../utils/updatePatientData";

/**
 * DevToolbar - Development toolbar for quickly initializing sample data
 * Only displays in development mode
 */
const DevToolbar = () => {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const isDev = import.meta.env.DEV;

  if (!isDev) {
    return null; // Don't render in production
  }

  const handleInitAll = () => {
    initializeSampleData();
    setMessage("All sample data initialized successfully");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleInitPatients = () => {
    const result = seedPatients();
    if (result && result.length) {
      setMessage(`Added ${result.length} sample patients`);
    } else {
      setMessage("Patient data already exists, no changes made");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleUpdatePatientNames = () => {
    updateAllPatientData();
    setMessage("Updated all patient data");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddTitles = () => {
    addTitlesToPatientNames();
    setMessage("Added titles to patient names");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddMiddleNames = () => {
    addMiddleNamesToPatients();
    setMessage("Added middle names to patients");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddProfessionalTitles = () => {
    addProfessionalTitles();
    setMessage("Added professional titles to some patients");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-2 z-50">
      <div className="flex items-center justify-between">
        <div className="text-sm">Dev Tools</div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded"
          >
            {isExpanded ? "Hide Options" : "Show Options"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 border-t border-gray-700 pt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <div className="border-r border-gray-700 pr-2">
            <div className="text-xs font-bold mb-1">Data Initialization</div>
            <button
              onClick={handleInitPatients}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded block mb-1 w-full"
            >
              Add Sample Patients
            </button>
            <button
              onClick={handleInitAll}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded block w-full"
            >
              Initialize All Data
            </button>
          </div>

          <div className="border-r border-gray-700 pr-2">
            <div className="text-xs font-bold mb-1">Patient Data</div>
            <button
              onClick={handleUpdatePatientNames}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded block mb-1 w-full"
            >
              Update All Data
            </button>
            <button
              onClick={handleAddTitles}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded block mb-1 w-full"
            >
              Add Titles
            </button>
            <button
              onClick={handleAddMiddleNames}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded block mb-1 w-full"
            >
              Add Middle Names
            </button>
            <button
              onClick={handleAddProfessionalTitles}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded block w-full"
            >
              Add Prof. Titles
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="absolute top-0 left-0 right-0 transform -translate-y-full bg-black text-white text-xs p-1 text-center">
          {message}
        </div>
      )}
    </div>
  );
};

export default DevToolbar;
