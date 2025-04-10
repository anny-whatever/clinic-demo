import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { usePrescriptions } from "../contexts/PrescriptionContext";
import { useMedicines } from "../contexts/MedicineContext";
import { usePatients } from "../contexts/PatientContext";
import { useAuth } from "../contexts/AuthContext";
import {
  MEDICINE_FREQUENCY,
  MEDICINE_DURATION,
  ADMINISTRATION_ROUTES,
  MEDICINE_TYPES,
  MEAL_RELATION,
  SPECIAL_INSTRUCTIONS,
} from "../utils/constants";
import SignatureCanvas from "react-signature-canvas";

const Prescriptions = () => {
  const { currentUser } = useAuth();
  const {
    prescriptions,
    getCurrentUserPrescriptions,
    addPrescription,
    updatePrescription,
    deletePrescription,
    prescriptionTemplates,
    getCurrentUserTemplates,
    addCustomMedicine,
    loading: prescriptionsLoading,
  } = usePrescriptions();

  const { medicines, loading: medicinesLoading } = useMedicines();
  const { patients, loading: patientsLoading } = usePatients();

  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isCustomMedicine, setIsCustomMedicine] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedSpecialInstructions, setSelectedSpecialInstructions] =
    useState([]);
  const [showPreviewMode, setShowPreviewMode] = useState(false);
  const [signatureMode, setSignatureMode] = useState(false);
  const [signature, setSignature] = useState(null);

  const signatureRef = useRef(null);

  // For new/edit prescription
  const [prescriptionData, setPrescriptionData] = useState({
    patientId: "",
    date: new Date().toISOString().split("T")[0],
    diagnosis: "",
    chiefComplaints: "",
    clinicalFindings: "",
    investigations: "",
    notes: "",
    advice: "",
    followUpInstructions: "",
    followUpDate: "",
    signature: null,
    medicines: [
      {
        medicineId: "",
        name: "",
        isCustom: false,
        dosage: "",
        type: "",
        route: "",
        frequency: "",
        duration: "",
        mealRelation: "",
        remarks: "",
        specialInstructions: [],
      },
    ],
  });

  // Load prescriptions on mount
  useEffect(() => {
    if (!prescriptionsLoading) {
      const userPrescriptions = getCurrentUserPrescriptions();
      setFilteredPrescriptions(userPrescriptions);
    }
  }, [prescriptions, prescriptionsLoading, getCurrentUserPrescriptions]);

  // Filter prescriptions on search
  useEffect(() => {
    if (!prescriptionsLoading) {
      const userPrescriptions = getCurrentUserPrescriptions();

      if (!searchQuery.trim()) {
        setFilteredPrescriptions(userPrescriptions);
        return;
      }

      const query = searchQuery.toLowerCase();
      const filtered = userPrescriptions.filter((prescription) => {
        const patient = patients.find((p) => p.id === prescription.patientId);
        const patientName = patient
          ? `${patient.firstName} ${patient.lastName}`.toLowerCase()
          : "";

        return (
          patientName.includes(query) ||
          prescription.diagnosis?.toLowerCase().includes(query)
        );
      });

      setFilteredPrescriptions(filtered);
    }
  }, [
    searchQuery,
    prescriptions,
    patients,
    prescriptionsLoading,
    getCurrentUserPrescriptions,
  ]);

  // Make signature canvas responsive and initialize it properly
  useEffect(() => {
    const initializeCanvas = () => {
      if (signatureRef.current && signatureMode) {
        const canvas = signatureRef.current._canvas;
        const container = canvas.parentElement;

        // Set canvas dimensions explicitly to match container
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Clear canvas and set proper background
        signatureRef.current.clear();

        // Configure the signature pad
        signatureRef.current.on();
      }
    };

    const resizeCanvas = () => {
      if (signatureRef.current && signatureMode) {
        // Store temporary image if there's content
        let tempSig = null;
        if (!signatureRef.current.isEmpty()) {
          tempSig = signatureRef.current.toDataURL();
        }

        // Resize
        const canvas = signatureRef.current._canvas;
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Clear (required after resize)
        signatureRef.current.clear();

        // Restore content if there was any
        if (tempSig) {
          const img = new Image();
          img.onload = () => {
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = tempSig;
        }
      }
    };

    // Add event listener for resize
    window.addEventListener("resize", resizeCanvas);

    // Initialize canvas when signature mode becomes active
    if (signatureMode && signatureRef.current) {
      // Small delay to ensure container is rendered
      setTimeout(initializeCanvas, 100);
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [signatureMode]);

  // Handle signature canvas initialization
  useEffect(() => {
    if (signatureMode && signatureRef.current) {
      try {
        // Clear canvas when entering signature mode
        signatureRef.current.clear();

        // Ensure signature pad is properly initialized
        if (typeof signatureRef.current.on === "function") {
          signatureRef.current.on();
        }
      } catch (error) {
        console.error("Error initializing signature canvas:", error);
      }
    }
  }, [signatureMode]);

  // Add help message for mobile users
  useEffect(() => {
    const handleResize = () => {
      // Check if we're likely on a mobile device
      if (signatureMode && window.innerWidth < 768) {
        const instructions = document.querySelector(".signature-instructions");
        if (instructions) {
          instructions.textContent =
            "Tap and drag to sign. For best results, use landscape orientation.";
        }
      }
    };

    window.addEventListener("resize", handleResize);
    if (signatureMode) {
      handleResize();
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [signatureMode]);

  const handleCreateNew = () => {
    setPrescriptionData({
      patientId: "",
      date: new Date().toISOString().split("T")[0],
      diagnosis: "",
      notes: "",
      medicines: [
        {
          medicineId: "",
          dosage: "",
          frequency: "",
          duration: "",
          remarks: "",
        },
      ],
    });
    setSelectedPrescription(null);
    setSelectedTemplate("");
    setIsModalOpen(true);
  };

  const handleEdit = (prescription) => {
    const prescriptionCopy = {
      ...prescription,
      medicines: [...prescription.medicines],
    };
    setPrescriptionData(prescriptionCopy);
    setSelectedPrescription(prescription);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this prescription?")) {
      await deletePrescription(id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionData({
      ...prescriptionData,
      [name]: value,
    });
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...prescriptionData.medicines];

    // If this is a medicineId change and user is switching to/from custom medicine
    if (field === "medicineId" && value === "custom") {
      // Switching to custom medicine
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        medicineId: "custom",
        isCustom: true,
        name: "",
      };
    } else if (field === "medicineId" && updatedMedicines[index].isCustom) {
      // Switching from custom medicine to inventory medicine
      const selectedMedicine = medicines.find((med) => med.id === value);
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        medicineId: value,
        isCustom: false,
        name: selectedMedicine ? selectedMedicine.name : "",
        type: selectedMedicine ? selectedMedicine.type : "",
      };
    } else {
      // Regular field update
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        [field]: value,
      };
    }

    setPrescriptionData({
      ...prescriptionData,
      medicines: updatedMedicines,
    });
  };

  const toggleSpecialInstruction = (index, instruction) => {
    const updatedMedicines = [...prescriptionData.medicines];
    const currentInstructions =
      updatedMedicines[index].specialInstructions || [];

    if (currentInstructions.includes(instruction)) {
      // Remove if already selected
      updatedMedicines[index].specialInstructions = currentInstructions.filter(
        (i) => i !== instruction
      );
    } else {
      // Add if not selected
      updatedMedicines[index].specialInstructions = [
        ...currentInstructions,
        instruction,
      ];
    }

    setPrescriptionData({
      ...prescriptionData,
      medicines: updatedMedicines,
    });
  };

  const handleCustomInstructionAdd = (index, customInstruction) => {
    if (!customInstruction.trim()) return;

    const updatedMedicines = [...prescriptionData.medicines];
    const currentInstructions =
      updatedMedicines[index].specialInstructions || [];

    if (!currentInstructions.includes(customInstruction)) {
      updatedMedicines[index].specialInstructions = [
        ...currentInstructions,
        customInstruction,
      ];

      setPrescriptionData({
        ...prescriptionData,
        medicines: updatedMedicines,
      });
    }
  };

  const clearSignature = () => {
    try {
      if (signatureRef.current) {
        signatureRef.current.clear();
        setSignature(null);
      }
    } catch (error) {
      console.error("Error clearing signature:", error);
    }
  };

  const saveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      try {
        // Get signature data directly from the canvas
        const signatureDataURL = signatureRef.current.toDataURL("image/png");

        // Create an image to check if the data URL is valid
        const img = new Image();
        img.onload = () => {
          // Successfully loaded - set state
          setSignature(signatureDataURL);
          setPrescriptionData({
            ...prescriptionData,
            signature: signatureDataURL,
          });
          setSignatureMode(false);
        };

        img.onerror = () => {
          throw new Error("Failed to load signature image");
        };

        // Set the src to test if it loads
        img.src = signatureDataURL;
      } catch (error) {
        console.error("Error saving signature:", error);
        alert(
          "There was a problem saving your signature. Please try again with a simpler signature."
        );
      }
    } else {
      alert("Please provide a signature before saving");
    }
  };

  const addMedicineRow = () => {
    setPrescriptionData({
      ...prescriptionData,
      medicines: [
        ...prescriptionData.medicines,
        {
          medicineId: "",
          dosage: "",
          frequency: "",
          duration: "",
          remarks: "",
        },
      ],
    });
  };

  const removeMedicineRow = (index) => {
    const updatedMedicines = [...prescriptionData.medicines];
    updatedMedicines.splice(index, 1);

    if (updatedMedicines.length === 0) {
      updatedMedicines.push({
        medicineId: "",
        dosage: "",
        frequency: "",
        duration: "",
        remarks: "",
      });
    }

    setPrescriptionData({
      ...prescriptionData,
      medicines: updatedMedicines,
    });
  };

  const handleTemplateSelect = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);

    if (!templateId) {
      return;
    }

    const template = prescriptionTemplates.find((t) => t.id === templateId);
    if (template) {
      setPrescriptionData({
        ...prescriptionData,
        diagnosis: template.diagnosis || prescriptionData.diagnosis,
        notes: template.notes || prescriptionData.notes,
        medicines: [...template.medicines],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!prescriptionData.patientId) {
      alert("Please select a patient");
      return;
    }

    // Process and validate medicines
    const processedMedicines = prescriptionData.medicines
      .map((medicine) => {
        // Skip empty medicine entries
        if (!medicine.medicineId && !medicine.name) {
          return null;
        }

        // Process custom medicines
        if (medicine.isCustom || medicine.medicineId === "custom") {
          if (!medicine.name) {
            alert("Custom medicines must have a name");
            throw new Error("Custom medicines must have a name");
          }

          // Use the addCustomMedicine function to create a proper custom medicine entry
          return addCustomMedicine({
            ...medicine,
            name: medicine.name,
          });
        }

        return medicine;
      })
      .filter(Boolean); // Remove null entries

    if (processedMedicines.length === 0) {
      alert("Please add at least one medicine");
      return;
    }

    try {
      const dataToSave = {
        ...prescriptionData,
        medicines: processedMedicines,
      };

      if (selectedPrescription) {
        await updatePrescription(selectedPrescription.id, dataToSave);
      } else {
        await addPrescription({
          ...dataToSave,
          doctorId: currentUser.id,
        });
      }

      setIsModalOpen(false);
      setShowPreviewMode(false);
      setSignatureMode(false);
    } catch (error) {
      console.error("Error saving prescription:", error);
      alert("Failed to save prescription. Please try again.");
    }
  };

  const isLoading = prescriptionsLoading || medicinesLoading || patientsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prescriptions</h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          onClick={handleCreateNew}
        >
          Create New
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by patient name or diagnosis..."
          className="form-input w-full md:w-1/2 rounded-md shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredPrescriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">
            No prescriptions found. Create a new one to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnosis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicines
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => {
                const patient = patients.find(
                  (p) => p.id === prescription.patientId
                );
                return (
                  <tr key={prescription.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prescription.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient
                        ? patient.name ||
                          `${patient.firstName || ""} ${patient.lastName || ""}`
                        : prescription.patientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prescription.diagnosis}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <ul className="list-disc pl-5">
                        {prescription.medicines
                          .slice(0, 3)
                          .map((med, index) => {
                            const medicine = medicines.find(
                              (m) => m.id === med.medicineId
                            );
                            return (
                              <li key={index}>
                                {medicine ? medicine.name : med.medicineId}{" "}
                                {med.dosage}
                              </li>
                            );
                          })}
                        {prescription.medicines.length > 3 && (
                          <li>+ {prescription.medicines.length - 3} more</li>
                        )}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => handleEdit(prescription)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(prescription.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Prescription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-auto">
            {showPreviewMode ? (
              // Prescription Preview Mode
              <div className="prescription-preview">
                <div className="flex justify-between mb-6">
                  <h2 className="text-2xl font-bold">Prescription Preview</h2>
                  <div>
                    <button
                      className="px-4 py-2 mr-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                      onClick={() => setShowPreviewMode(false)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      onClick={handleSubmit}
                    >
                      Save Prescription
                    </button>
                  </div>
                </div>

                <div className="border p-6 rounded-lg mb-4">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        {currentUser?.name || "Doctor"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {currentUser?.specialization || "Specialization"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        Date: {prescriptionData.date}
                      </p>
                      <p className="text-sm text-gray-600">
                        Patient:{" "}
                        {(() => {
                          const patient = patients.find(
                            (p) => p.id === prescriptionData.patientId
                          );
                          return patient
                            ? patient.name ||
                                `${patient.firstName || ""} ${
                                  patient.lastName || ""
                                }`
                            : prescriptionData.patientId;
                        })()}
                      </p>
                    </div>
                  </div>

                  {prescriptionData.diagnosis && (
                    <div className="mb-4">
                      <h4 className="font-semibold">Diagnosis:</h4>
                      <p>{prescriptionData.diagnosis}</p>
                    </div>
                  )}

                  {prescriptionData.chiefComplaints && (
                    <div className="mb-4">
                      <h4 className="font-semibold">Chief Complaints:</h4>
                      <p>{prescriptionData.chiefComplaints}</p>
                    </div>
                  )}

                  {prescriptionData.clinicalFindings && (
                    <div className="mb-4">
                      <h4 className="font-semibold">Clinical Findings:</h4>
                      <p>{prescriptionData.clinicalFindings}</p>
                    </div>
                  )}

                  {prescriptionData.investigations && (
                    <div className="mb-4">
                      <h4 className="font-semibold">Investigations:</h4>
                      <p>{prescriptionData.investigations}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="font-semibold">Medicines:</h4>
                    <ul className="list-decimal pl-5">
                      {prescriptionData.medicines.map((med, index) => {
                        const medicine = medicines.find(
                          (m) => m.id === med.medicineId
                        );
                        const medicineName = med.isCustom
                          ? med.name
                          : medicine
                          ? medicine.name
                          : med.medicineId;

                        return (
                          <li key={index} className="mb-2">
                            <p className="font-medium">
                              {medicineName} {med.type && `(${med.type})`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {med.dosage} - {med.frequency}, {med.duration}
                              {med.mealRelation && `, ${med.mealRelation}`}
                              {med.route && `, ${med.route}`}
                            </p>
                            {med.specialInstructions &&
                              med.specialInstructions.length > 0 && (
                                <ul className="list-disc pl-5 text-sm text-gray-600">
                                  {med.specialInstructions.map(
                                    (instruction, i) => (
                                      <li key={i}>{instruction}</li>
                                    )
                                  )}
                                </ul>
                              )}
                            {med.remarks && (
                              <p className="text-sm italic mt-1">
                                {med.remarks}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {prescriptionData.advice && (
                    <div className="mb-4">
                      <h4 className="font-semibold">Advice:</h4>
                      <p>{prescriptionData.advice}</p>
                    </div>
                  )}

                  {prescriptionData.notes && (
                    <div className="mb-4">
                      <h4 className="font-semibold">Notes:</h4>
                      <p>{prescriptionData.notes}</p>
                    </div>
                  )}

                  {prescriptionData.followUpInstructions && (
                    <div className="mb-4">
                      <h4 className="font-semibold">Follow-up Instructions:</h4>
                      <p>{prescriptionData.followUpInstructions}</p>
                      {prescriptionData.followUpDate && (
                        <p className="text-sm">
                          Follow-up Date: {prescriptionData.followUpDate}
                        </p>
                      )}
                    </div>
                  )}

                  {prescriptionData.signature && (
                    <div className="mt-6 border-t pt-4 border-gray-200">
                      <div className="flex justify-end">
                        <div className="text-right">
                          <p className="mb-1 text-sm font-medium text-gray-700">
                            Doctor's Signature:
                          </p>
                          <div className="bg-gray-50 border border-gray-200 rounded p-2 inline-block">
                            <img
                              src={prescriptionData.signature}
                              alt="Doctor's Signature"
                              className="h-20 object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : signatureMode ? (
              // Signature Capture Mode
              <div className="signature-capture">
                <h2 className="text-xl font-bold mb-4">Capture Signature</h2>
                <p className="text-sm text-gray-600 mb-3">
                  Use your mouse or touch screen to sign in the box below.
                </p>
                <p className="signature-instructions text-sm text-indigo-600 mb-3 font-medium">
                  Sign with a continuous motion for best results.
                </p>
                <div
                  className="border border-gray-300 rounded-md mb-4 w-full relative"
                  style={{
                    height: "200px",
                    maxWidth: "600px",
                    margin: "0 auto",
                  }}
                >
                  <div className="absolute inset-0 bg-gray-50"></div>
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      width: 600,
                      height: 200,
                      className: "signature-canvas absolute top-0 left-0",
                      style: {
                        touchAction: "none",
                        width: "100%",
                        height: "100%",
                      },
                    }}
                    options={{
                      backgroundColor: "transparent",
                      penColor: "black",
                      minWidth: 1.5,
                      maxWidth: 3,
                      velocityFilterWeight: 0.6,
                      throttle: 16,
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    onClick={clearSignature}
                  >
                    Clear
                  </button>
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    onClick={saveSignature}
                  >
                    Save Signature
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    onClick={() => setSignatureMode(false)}
                  >
                    Cancel
                  </button>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    Having trouble with the signature pad? Try using a different
                    browser or device.
                  </p>
                  <p className="mt-1">
                    You can also skip this step and come back later when using a
                    different device.
                  </p>
                </div>
              </div>
            ) : (
              // Prescription Edit Mode
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowPreviewMode(true);
                }}
              >
                <div className="flex justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {selectedPrescription
                      ? "Edit Prescription"
                      : "New Prescription"}
                  </h2>
                  <button
                    type="button"
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Template Selection */}
                {!selectedPrescription && prescriptionTemplates.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Use Template:
                    </label>
                    <select
                      className="form-select w-full rounded-md border-gray-300 shadow-sm"
                      value={selectedTemplate}
                      onChange={handleTemplateSelect}
                    >
                      <option value="">-- Select Template --</option>
                      {getCurrentUserTemplates().map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Patient Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Patient: <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="form-select w-full rounded-md border-gray-300 shadow-sm"
                      name="patientId"
                      value={prescriptionData.patientId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select Patient --</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name ||
                            `${patient.firstName || ""} ${
                              patient.lastName || ""
                            }`.trim()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date:
                    </label>
                    <input
                      type="date"
                      className="form-input w-full rounded-md border-gray-300 shadow-sm"
                      name="date"
                      value={prescriptionData.date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Diagnosis:
                  </label>
                  <input
                    type="text"
                    className="form-input w-full rounded-md border-gray-300 shadow-sm"
                    name="diagnosis"
                    value={prescriptionData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Primary diagnosis"
                  />
                </div>

                {/* Clinical Information */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      Clinical Information
                    </label>
                    <button
                      type="button"
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                      onClick={() =>
                        setShowAdvancedOptions(!showAdvancedOptions)
                      }
                    >
                      {showAdvancedOptions ? "Hide Details" : "Show Details"}
                    </button>
                  </div>

                  {showAdvancedOptions && (
                    <div className="grid grid-cols-1 gap-4 mb-4 bg-gray-50 p-4 rounded-md">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Chief Complaints:
                        </label>
                        <textarea
                          className="form-textarea w-full rounded-md border-gray-300 shadow-sm"
                          name="chiefComplaints"
                          value={prescriptionData.chiefComplaints}
                          onChange={handleInputChange}
                          rows="2"
                          placeholder="Patient's main symptoms and concerns"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Clinical Findings:
                        </label>
                        <textarea
                          className="form-textarea w-full rounded-md border-gray-300 shadow-sm"
                          name="clinicalFindings"
                          value={prescriptionData.clinicalFindings}
                          onChange={handleInputChange}
                          rows="2"
                          placeholder="Examination findings and observations"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Investigations:
                        </label>
                        <textarea
                          className="form-textarea w-full rounded-md border-gray-300 shadow-sm"
                          name="investigations"
                          value={prescriptionData.investigations}
                          onChange={handleInputChange}
                          rows="2"
                          placeholder="Tests, lab results, and other investigations"
                        ></textarea>
                      </div>
                    </div>
                  )}
                </div>

                {/* Medicines heading and continue with the form */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Medicines</h3>

                  {/* Medicines entries */}
                  {prescriptionData.medicines.map((medicine, index) => (
                    <div
                      key={index}
                      className="medicine-entry border border-gray-200 rounded-md p-4 mb-4"
                    >
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">Medicine #{index + 1}</h4>
                        {prescriptionData.medicines.length > 1 && (
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeMedicineRow(index)}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Medicine Selection with Custom Option */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Medicine:
                          </label>
                          <select
                            className="form-select w-full rounded-md border-gray-300 shadow-sm"
                            value={medicine.medicineId}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "medicineId",
                                e.target.value
                              )
                            }
                          >
                            <option value="">-- Select Medicine --</option>
                            {medicines.map((med) => (
                              <option key={med.id} value={med.id}>
                                {med.name} ({med.type}, {med.dosage})
                              </option>
                            ))}
                            <option value="custom">
                              -- Add Custom Medicine --
                            </option>
                          </select>
                        </div>

                        {/* Custom Medicine Name */}
                        {medicine.isCustom && (
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Medicine Name:{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-input w-full rounded-md border-gray-300 shadow-sm"
                              value={medicine.name || ""}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="Enter medicine name"
                              required={medicine.isCustom}
                            />
                          </div>
                        )}
                      </div>

                      {/* Medicine Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Medicine Dosage */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Dosage:
                          </label>
                          <input
                            type="text"
                            className="form-input w-full rounded-md border-gray-300 shadow-sm"
                            value={medicine.dosage}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "dosage",
                                e.target.value
                              )
                            }
                            placeholder="e.g., 500mg, 1 tablet, 5ml"
                          />
                        </div>

                        {/* Frequency */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Frequency:
                          </label>
                          <select
                            className="form-select w-full rounded-md border-gray-300 shadow-sm"
                            value={medicine.frequency}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "frequency",
                                e.target.value
                              )
                            }
                          >
                            <option value="">-- Select Frequency --</option>
                            {Object.entries(MEDICINE_FREQUENCY).map(
                              ([key, value]) => (
                                <option key={key} value={value}>
                                  {value}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Duration */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Duration:
                          </label>
                          <select
                            className="form-select w-full rounded-md border-gray-300 shadow-sm"
                            value={medicine.duration}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "duration",
                                e.target.value
                              )
                            }
                          >
                            <option value="">-- Select Duration --</option>
                            {Object.entries(MEDICINE_DURATION).map(
                              ([key, value]) => (
                                <option key={key} value={value}>
                                  {value}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* Medicine Type (for custom medicines) */}
                        {medicine.isCustom && (
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Type:
                            </label>
                            <select
                              className="form-select w-full rounded-md border-gray-300 shadow-sm"
                              value={medicine.type || ""}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "type",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">-- Select Type --</option>
                              {Object.entries(MEDICINE_TYPES).map(
                                ([key, value]) => (
                                  <option key={key} value={value}>
                                    {value}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        )}

                        {/* Route of Administration */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Route:
                          </label>
                          <select
                            className="form-select w-full rounded-md border-gray-300 shadow-sm"
                            value={medicine.route || ""}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "route",
                                e.target.value
                              )
                            }
                          >
                            <option value="">-- Select Route --</option>
                            {Object.entries(ADMINISTRATION_ROUTES).map(
                              ([key, value]) => (
                                <option key={key} value={value}>
                                  {value}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* Meal Relation */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Meal Relation:
                          </label>
                          <select
                            className="form-select w-full rounded-md border-gray-300 shadow-sm"
                            value={medicine.mealRelation || ""}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "mealRelation",
                                e.target.value
                              )
                            }
                          >
                            <option value="">-- Select Meal Relation --</option>
                            {Object.entries(MEAL_RELATION).map(
                              ([key, value]) => (
                                <option key={key} value={value}>
                                  {value}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Special Instructions */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          Special Instructions:
                        </label>
                        <div className="bg-gray-50 p-2 rounded-md max-h-32 overflow-y-auto">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {SPECIAL_INSTRUCTIONS.map((instruction, i) => (
                              <div key={i} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`instruction-${index}-${i}`}
                                  className="mr-2"
                                  checked={(
                                    medicine.specialInstructions || []
                                  ).includes(instruction)}
                                  onChange={() =>
                                    toggleSpecialInstruction(index, instruction)
                                  }
                                />
                                <label
                                  htmlFor={`instruction-${index}-${i}`}
                                  className="text-sm"
                                >
                                  {instruction}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Custom instruction */}
                        <div className="mt-2 flex">
                          <input
                            type="text"
                            className="form-input flex-grow rounded-l-md border-gray-300 shadow-sm"
                            placeholder="Add custom instruction"
                            id={`custom-instruction-${index}`}
                          />
                          <button
                            type="button"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                            onClick={() => {
                              const input = document.getElementById(
                                `custom-instruction-${index}`
                              );
                              handleCustomInstructionAdd(index, input.value);
                              input.value = "";
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Remarks */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Remarks:
                        </label>
                        <textarea
                          className="form-textarea w-full rounded-md border-gray-300 shadow-sm"
                          value={medicine.remarks || ""}
                          onChange={(e) =>
                            handleMedicineChange(
                              index,
                              "remarks",
                              e.target.value
                            )
                          }
                          rows="2"
                          placeholder="Additional notes about this medicine"
                        ></textarea>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mb-6"
                    onClick={addMedicineRow}
                  >
                    + Add Another Medicine
                  </button>

                  {/* Additional prescription information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Advice:
                      </label>
                      <textarea
                        className="form-textarea w-full rounded-md border-gray-300 shadow-sm"
                        name="advice"
                        value={prescriptionData.advice || ""}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="General advice for the patient"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Notes:
                      </label>
                      <textarea
                        className="form-textarea w-full rounded-md border-gray-300 shadow-sm"
                        name="notes"
                        value={prescriptionData.notes || ""}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Additional notes about treatment"
                      ></textarea>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Follow-up Instructions:
                      </label>
                      <textarea
                        className="form-textarea w-full rounded-md border-gray-300 shadow-sm"
                        name="followUpInstructions"
                        value={prescriptionData.followUpInstructions || ""}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Instructions for follow-up visit"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Follow-up Date:
                      </label>
                      <input
                        type="date"
                        className="form-input w-full rounded-md border-gray-300 shadow-sm"
                        name="followUpDate"
                        value={prescriptionData.followUpDate || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">
                        Digital Signature:
                      </label>
                      <button
                        type="button"
                        className="px-4 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        onClick={() => setSignatureMode(true)}
                      >
                        {prescriptionData.signature
                          ? "Update Signature"
                          : "Add Signature"}
                      </button>
                    </div>

                    {prescriptionData.signature && (
                      <div className="mt-2 border p-3 rounded-md bg-gray-50">
                        <div className="flex justify-between items-center">
                          <img
                            src={prescriptionData.signature}
                            alt="Doctor's Signature"
                            className="h-20 object-contain"
                          />
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 text-sm"
                            onClick={() => {
                              setPrescriptionData({
                                ...prescriptionData,
                                signature: null,
                              });
                              setSignature(null);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Buttons */}
                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>

                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link
          to="/doctor/templates"
          className="text-indigo-600 hover:text-indigo-900 font-medium"
        >
          Manage Prescription Templates →
        </Link>
      </div>
    </div>
  );
};

export default Prescriptions;
