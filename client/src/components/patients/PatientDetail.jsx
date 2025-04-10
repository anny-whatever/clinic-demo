import React from "react";

const PatientDetail = ({ patient, onClose, onEdit }) => {
  if (!patient) return null;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
        <h3 className="text-lg font-medium text-indigo-900">
          Patient Information
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="mb-6 flex items-center border-b border-gray-200 pb-4">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-xl font-bold">
            {patient.name ? patient.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {patient.name}
            </h2>
            <p className="text-sm text-gray-500">
              {patient.age} years old, {patient.gender}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Information
              </h4>
              <div className="mt-2 space-y-2">
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-gray-600">
                    {patient.contact || "No contact number provided"}
                  </span>
                </div>
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-gray-600">
                    {patient.email || "No email provided"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </h4>
              <p className="mt-2 text-gray-600">
                {patient.address || "No address provided"}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Emergency Contact
              </h4>
              {patient.emergencyContact ? (
                <div className="mt-2 space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">Name:</span>{" "}
                    {patient.emergencyContact.name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Relationship:</span>{" "}
                    {patient.emergencyContact.relationship}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span>{" "}
                    {patient.emergencyContact.phone}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-gray-500 italic text-sm">
                  No emergency contact provided
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Information
              </h4>
              <div className="mt-2 space-y-2">
                <div className="flex">
                  <span className="text-gray-500 mr-2">Patient ID:</span>
                  <span className="text-gray-600">{patient.id}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medical History
              </h4>
              {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                <div className="mt-2">
                  <ul className="list-disc pl-5 text-gray-600">
                    {patient.medicalHistory.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-2 text-gray-500 italic text-sm">
                  No medical history recorded
                </p>
              )}
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Insurance Information
              </h4>
              {patient.insurance ? (
                <div className="mt-2 space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">Provider:</span>{" "}
                    {patient.insurance.provider}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Plan Type:</span>{" "}
                    {patient.insurance.planType}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Policy Number:</span>{" "}
                    {patient.insurance.policyNumber}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Effective Date:</span>{" "}
                    {patient.insurance.effectiveDate}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Copay:</span> $
                    {patient.insurance.copayAmount}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-gray-500 italic text-sm">
                  No insurance information provided
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
