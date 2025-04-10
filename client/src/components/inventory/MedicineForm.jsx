import { useState, useEffect } from "react";
import { MEDICINE_TYPES } from "../../utils/constants";

const MedicineForm = ({ medicine, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    type: Object.values(MEDICINE_TYPES)[0],
    inventory: 0,
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Load medicine data if editing
  useEffect(() => {
    if (medicine) {
      setFormData(medicine);
      setIsEditing(true);
    }
  }, [medicine]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    let parsedValue = value;
    if (name === "inventory") {
      parsedValue = parseInt(value, 10) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = "Dosage is required";
    }

    if (!formData.type) {
      newErrors.type = "Type is required";
    }

    if (formData.inventory < 0) {
      newErrors.inventory = "Inventory cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? "Edit Medicine" : "Add New Medicine"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Medicine Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-input ${errors.name ? "border-red-300" : ""}`}
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="dosage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Dosage
          </label>
          <input
            type="text"
            id="dosage"
            name="dosage"
            className={`form-input ${errors.dosage ? "border-red-300" : ""}`}
            value={formData.dosage}
            onChange={handleChange}
            placeholder="e.g., 500mg, 250ml"
          />
          {errors.dosage && (
            <p className="mt-1 text-sm text-red-600">{errors.dosage}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Type
          </label>
          <select
            id="type"
            name="type"
            className={`form-input ${errors.type ? "border-red-300" : ""}`}
            value={formData.type}
            onChange={handleChange}
          >
            {Object.values(MEDICINE_TYPES).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="inventory"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Inventory Quantity
          </label>
          <input
            type="number"
            id="inventory"
            name="inventory"
            className={`form-input ${errors.inventory ? "border-red-300" : ""}`}
            value={formData.inventory}
            onChange={handleChange}
            min="0"
          />
          {errors.inventory && (
            <p className="mt-1 text-sm text-red-600">{errors.inventory}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {isEditing ? "Update Medicine" : "Add Medicine"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicineForm;
