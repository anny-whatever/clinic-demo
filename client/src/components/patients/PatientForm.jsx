import { useState, useEffect } from "react";

const PatientForm = ({ patient, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    contact: "",
    email: "",
    address: "",
    medicalHistory: [],
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    insurance: {
      provider: "",
      planType: "",
      policyNumber: "",
      effectiveDate: "",
      copayAmount: 0,
    },
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [tempMedicalCondition, setTempMedicalCondition] = useState("");

  // Load patient data if editing
  useEffect(() => {
    if (patient) {
      // Ensure all required nested objects are initialized even if missing from patient data
      const patientData = {
        ...patient,
        medicalHistory: patient.medicalHistory || [],
        emergencyContact: patient.emergencyContact || {
          name: "",
          relationship: "",
          phone: "",
        },
        insurance: patient.insurance || {
          provider: "",
          planType: "",
          policyNumber: "",
          effectiveDate: "",
          copayAmount: 0,
        },
      };
      setFormData(patientData);
      setIsEditing(true);
    }
  }, [patient]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    let parsedValue = value;
    if (name === "age") {
      parsedValue = value === "" ? "" : parseInt(value, 10);
    }

    if (name.includes(".")) {
      // Handle nested objects (emergency contact, insurance)
      const [objectName, fieldName] = name.split(".");

      setFormData((prev) => ({
        ...prev,
        [objectName]: {
          ...prev[objectName],
          [fieldName]:
            objectName === "insurance" && fieldName === "copayAmount"
              ? value === ""
                ? 0
                : parseInt(value, 10)
              : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: parsedValue,
      }));
    }

    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle adding a medical condition
  const handleAddMedicalCondition = () => {
    if (!tempMedicalCondition.trim()) return;

    setFormData((prev) => ({
      ...prev,
      medicalHistory: [...prev.medicalHistory, tempMedicalCondition.trim()],
    }));

    setTempMedicalCondition("");
  };

  // Handle removing a medical condition
  const handleRemoveMedicalCondition = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index),
    }));
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.age === "") {
      newErrors.age = "Age is required";
    } else if (formData.age < 0 || formData.age > 120) {
      newErrors.age = "Age must be between 0 and 120";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (
      formData.contact &&
      !/^\d{10}$/.test(formData.contact.replace(/\D/g, ""))
    ) {
      newErrors.contact = "Contact should be 10 digits";
    }

    // Validate emergency contact phone if provided
    if (
      formData.emergencyContact.phone &&
      !/^\+?[\d\s-]{10,15}$/.test(
        formData.emergencyContact.phone.replace(/\D/g, "")
      )
    ) {
      newErrors["emergencyContact.phone"] = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      // Clean up empty emergency contact and insurance if all fields are empty
      const dataToSubmit = { ...formData };

      const isEmergencyContactEmpty = !Object.values(
        dataToSubmit.emergencyContact
      ).some((val) => val.trim());
      if (isEmergencyContactEmpty) {
        dataToSubmit.emergencyContact = null;
      }

      const isInsuranceEmpty =
        !dataToSubmit.insurance.provider &&
        !dataToSubmit.insurance.planType &&
        !dataToSubmit.insurance.policyNumber;
      if (isInsuranceEmpty) {
        dataToSubmit.insurance = null;
      }

      onSubmit(dataToSubmit);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? "Edit Patient" : "Add New Patient"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="border border-gray-200 rounded-md p-4">
          <legend className="text-sm font-medium text-gray-700 px-2">
            Basic Information
          </legend>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name <span className="text-red-500">*</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className={`form-input ${errors.age ? "border-red-300" : ""}`}
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  max="120"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  className={`form-input ${
                    errors.gender ? "border-red-300" : ""
                  }`}
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contact"
                  name="contact"
                  className={`form-input ${
                    errors.contact ? "border-red-300" : ""
                  }`}
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="e.g., 1234567890"
                />
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${
                    errors.email ? "border-red-300" : ""
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., patient@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                placeholder="Patient's residential address"
              ></textarea>
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-gray-200 rounded-md p-4">
          <legend className="text-sm font-medium text-gray-700 px-2">
            Medical History
          </legend>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="tempMedicalCondition"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Add Medical Condition
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="tempMedicalCondition"
                  className="form-input flex-1"
                  value={tempMedicalCondition}
                  onChange={(e) => setTempMedicalCondition(e.target.value)}
                  placeholder="e.g., Hypertension, Diabetes, etc."
                />
                <button
                  type="button"
                  onClick={handleAddMedicalCondition}
                  className="ml-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                >
                  Add
                </button>
              </div>
            </div>

            {formData.medicalHistory.length > 0 ? (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Current Medical Conditions:
                </p>
                <ul className="bg-gray-50 p-3 rounded-md">
                  {formData.medicalHistory.map((condition, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center py-1"
                    >
                      <span>{condition}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicalCondition(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No medical conditions recorded
              </p>
            )}
          </div>
        </fieldset>

        <fieldset className="border border-gray-200 rounded-md p-4">
          <legend className="text-sm font-medium text-gray-700 px-2">
            Emergency Contact
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="emergency-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contact Name
              </label>
              <input
                type="text"
                id="emergency-name"
                name="emergencyContact.name"
                className="form-input"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                placeholder="Emergency contact name"
              />
            </div>

            <div>
              <label
                htmlFor="emergency-relationship"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Relationship
              </label>
              <select
                id="emergency-relationship"
                name="emergencyContact.relationship"
                className="form-input"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
              >
                <option value="">Select relationship</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="emergency-phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="emergency-phone"
                name="emergencyContact.phone"
                className={`form-input ${
                  errors["emergencyContact.phone"] ? "border-red-300" : ""
                }`}
                value={formData.emergencyContact.phone}
                onChange={handleChange}
                placeholder="Emergency contact phone"
              />
              {errors["emergencyContact.phone"] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors["emergencyContact.phone"]}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-gray-200 rounded-md p-4">
          <legend className="text-sm font-medium text-gray-700 px-2">
            Insurance Information
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="insurance-provider"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Provider
              </label>
              <input
                type="text"
                id="insurance-provider"
                name="insurance.provider"
                className="form-input"
                value={formData.insurance.provider}
                onChange={handleChange}
                placeholder="Insurance provider name"
              />
            </div>

            <div>
              <label
                htmlFor="insurance-plan"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Plan Type
              </label>
              <select
                id="insurance-plan"
                name="insurance.planType"
                className="form-input"
                value={formData.insurance.planType}
                onChange={handleChange}
              >
                <option value="">Select plan type</option>
                <option value="HMO">HMO</option>
                <option value="PPO">PPO</option>
                <option value="EPO">EPO</option>
                <option value="POS">POS</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="insurance-policy"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Policy Number
              </label>
              <input
                type="text"
                id="insurance-policy"
                name="insurance.policyNumber"
                className="form-input"
                value={formData.insurance.policyNumber}
                onChange={handleChange}
                placeholder="Policy number"
              />
            </div>

            <div>
              <label
                htmlFor="insurance-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Effective Date
              </label>
              <input
                type="date"
                id="insurance-date"
                name="insurance.effectiveDate"
                className="form-input"
                value={formData.insurance.effectiveDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="insurance-copay"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Copay Amount ($)
              </label>
              <input
                type="number"
                id="insurance-copay"
                name="insurance.copayAmount"
                className="form-input"
                value={formData.insurance.copayAmount}
                onChange={handleChange}
                min="0"
                step="5"
              />
            </div>
          </div>
        </fieldset>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {isEditing ? "Update Patient" : "Add Patient"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
