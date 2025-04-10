import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePrescriptions } from "../contexts/PrescriptionContext";
import { useMedicines } from "../contexts/MedicineContext";
import { useAuth } from "../contexts/AuthContext";
import {
  MEDICINE_FREQUENCY,
  MEDICINE_DURATION,
  ADMINISTRATION_ROUTES,
  MEDICINE_TYPES,
  MEAL_RELATION,
  SPECIAL_INSTRUCTIONS,
} from "../utils/constants";

const PrescriptionTemplates = () => {
  const { currentUser } = useAuth();
  const {
    prescriptionTemplates,
    getCurrentUserTemplates,
    getTemplateById,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addCustomMedicine,
    loading: templatesLoading,
  } = usePrescriptions();

  const { medicines, loading: medicinesLoading } = useMedicines();

  const [userTemplates, setUserTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // For new/edit template
  const [templateData, setTemplateData] = useState({
    name: "",
    diagnosis: "",
    notes: "",
    advice: "",
    followUpInstructions: "",
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

  // Load user templates
  useEffect(() => {
    if (!templatesLoading) {
      const templates = getCurrentUserTemplates();
      setUserTemplates(templates);
    }
  }, [prescriptionTemplates, templatesLoading, getCurrentUserTemplates]);

  // Filter templates on search
  useEffect(() => {
    if (!templatesLoading) {
      const templates = getCurrentUserTemplates();

      if (!searchQuery.trim()) {
        setUserTemplates(templates);
        return;
      }

      const query = searchQuery.toLowerCase();
      const filtered = templates.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.diagnosis?.toLowerCase().includes(query)
      );

      setUserTemplates(filtered);
    }
  }, [
    searchQuery,
    prescriptionTemplates,
    templatesLoading,
    getCurrentUserTemplates,
  ]);

  const handleCreateNew = () => {
    setTemplateData({
      name: "",
      diagnosis: "",
      notes: "",
      advice: "",
      followUpInstructions: "",
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
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (template) => {
    const templateCopy = {
      ...template,
      medicines: [...template.medicines],
    };

    // Ensure all medicine entries have the necessary properties
    templateCopy.medicines = templateCopy.medicines.map((med) => ({
      medicineId: med.medicineId || "",
      name: med.name || "",
      isCustom: med.isCustom || false,
      dosage: med.dosage || "",
      type: med.type || "",
      route: med.route || "",
      frequency: med.frequency || "",
      duration: med.duration || "",
      mealRelation: med.mealRelation || "",
      remarks: med.remarks || "",
      specialInstructions: med.specialInstructions || [],
    }));

    setTemplateData(templateCopy);
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      await deleteTemplate(id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemplateData({
      ...templateData,
      [name]: value,
    });
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...templateData.medicines];

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

    setTemplateData({
      ...templateData,
      medicines: updatedMedicines,
    });
  };

  const toggleSpecialInstruction = (index, instruction) => {
    const updatedMedicines = [...templateData.medicines];
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

    setTemplateData({
      ...templateData,
      medicines: updatedMedicines,
    });
  };

  const handleCustomInstructionAdd = (index, customInstruction) => {
    if (!customInstruction.trim()) return;

    const updatedMedicines = [...templateData.medicines];
    const currentInstructions =
      updatedMedicines[index].specialInstructions || [];

    if (!currentInstructions.includes(customInstruction)) {
      updatedMedicines[index].specialInstructions = [
        ...currentInstructions,
        customInstruction,
      ];

      setTemplateData({
        ...templateData,
        medicines: updatedMedicines,
      });
    }
  };

  const addMedicineRow = () => {
    setTemplateData({
      ...templateData,
      medicines: [
        ...templateData.medicines,
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
  };

  const removeMedicineRow = (index) => {
    const updatedMedicines = [...templateData.medicines];
    updatedMedicines.splice(index, 1);

    if (updatedMedicines.length === 0) {
      updatedMedicines.push({
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
      });
    }

    setTemplateData({
      ...templateData,
      medicines: updatedMedicines,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!templateData.name) {
      alert("Template name is required");
      return;
    }

    // Process and validate medicines
    const processedMedicines = templateData.medicines
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
        ...templateData,
        medicines: processedMedicines,
      };

      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, dataToSave);
      } else {
        await addTemplate({
          ...dataToSave,
          doctorId: currentUser.id,
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template. Please try again.");
    }
  };

  const isLoading = templatesLoading || medicinesLoading;

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
        <h1 className="text-2xl font-bold">Prescription Templates</h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          onClick={handleCreateNew}
        >
          Create New Template
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search templates..."
          className="form-input w-full md:w-1/2 rounded-md shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {userTemplates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">
            No templates found. Create a new one to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {template.name}
                </h3>
                {template.diagnosis && (
                  <p className="mt-1 text-sm text-gray-600">
                    {template.diagnosis}
                  </p>
                )}
              </div>
              <div className="px-6 py-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Medicines:
                </h4>
                <ul className="list-disc pl-5 mb-4">
                  {template.medicines.map((med, index) => {
                    const medicine = medicines.find(
                      (m) => m.id === med.medicineId
                    );
                    const medicineName = med.isCustom
                      ? med.name
                      : medicine
                      ? medicine.name
                      : med.medicineId;

                    return (
                      <li key={index} className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">{medicineName}</span>
                        {med.dosage && ` - ${med.dosage}`}
                        {med.frequency && `, ${med.frequency}`}
                        {med.duration && `, ${med.duration}`}
                      </li>
                    );
                  })}
                </ul>
                {template.notes && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Notes:
                    </h4>
                    <p className="text-sm text-gray-600">{template.notes}</p>
                  </div>
                )}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200"
                    onClick={() => handleEdit(template)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                    onClick={() => handleDelete(template.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-auto">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {selectedTemplate ? "Edit Template" : "New Template"}
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

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Template Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="form-input w-full rounded-md border-gray-300 shadow-sm"
                  name="name"
                  value={templateData.name}
                  onChange={handleInputChange}
                  placeholder="Enter a descriptive name for this template"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Diagnosis:
                </label>
                <input
                  type="text"
                  className="form-input w-full rounded-md border-gray-300 shadow-sm"
                  name="diagnosis"
                  value={templateData.diagnosis}
                  onChange={handleInputChange}
                  placeholder="Common diagnosis for this template"
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    Additional Information
                  </label>
                  <button
                    type="button"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    {showAdvancedOptions ? "Hide Details" : "Show Details"}
                  </button>
                </div>

                {showAdvancedOptions && (
                  <div className="grid grid-cols-1 gap-4 mb-4 bg-gray-50 p-4 rounded-md">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Advice:
                      </label>
                      <textarea
                        className="form-textarea w-full rounded-md border-gray-300 shadow-sm"
                        name="advice"
                        value={templateData.advice || ""}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="General advice for patients"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Notes:
                      </label>
                      <textarea
                        className="form-textarea w-full rounded-md border-gray-300 shadow-sm"
                        name="notes"
                        value={templateData.notes || ""}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Additional notes or comments"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Follow-up Instructions:
                      </label>
                      <textarea
                        className="form-textarea w-full rounded-md border-gray-300 shadow-sm"
                        name="followUpInstructions"
                        value={templateData.followUpInstructions || ""}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Standard follow-up instructions"
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Medicines</h3>

                {/* Medicine entries */}
                {templateData.medicines.map((medicine, index) => (
                  <div
                    key={index}
                    className="medicine-entry border border-gray-200 rounded-md p-4 mb-4"
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Medicine #{index + 1}</h4>
                      {templateData.medicines.length > 1 && (
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
                            handleMedicineChange(index, "route", e.target.value)
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
                          {Object.entries(MEAL_RELATION).map(([key, value]) => (
                            <option key={key} value={value}>
                              {value}
                            </option>
                          ))}
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
                          handleMedicineChange(index, "remarks", e.target.value)
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
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {selectedTemplate ? "Update Template" : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionTemplates;
