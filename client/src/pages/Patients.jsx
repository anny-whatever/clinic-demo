import { useState } from "react";
import { PatientProvider, usePatients } from "../contexts/PatientContext";
import PatientList from "../components/patients/PatientList";
import PatientForm from "../components/patients/PatientForm";
import PatientDetail from "../components/patients/PatientDetail";

// Modal component
const Modal = ({ isOpen, onClose, children, wide = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={onClose}
          ></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${
            wide ? "sm:max-w-4xl" : "sm:max-w-lg"
          } sm:w-full`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// Confirmation dialog
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirm}
            >
              Delete
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main content component
const PatientsContent = () => {
  const { addPatient, updatePatient, removePatient } = usePatients();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Open modal for adding new patient
  const handleAddNew = () => {
    setCurrentPatient(null);
    setIsFormModalOpen(true);
  };

  // Open modal for editing patient
  const handleEdit = (patient) => {
    setCurrentPatient(patient);
    setIsFormModalOpen(true);
    setIsDetailModalOpen(false); // Close detail modal if open
  };

  // Open modal for viewing patient details
  const handleView = (patient) => {
    setCurrentPatient(patient);
    setIsDetailModalOpen(true);
  };

  // Open confirmation dialog for deleting patient
  const handleDeleteClick = (id) => {
    setPatientToDelete(id);
    setIsConfirmOpen(true);
  };

  // Handle form submission (add/edit)
  const handleSubmit = (formData) => {
    if (currentPatient) {
      // Update existing patient
      updatePatient(currentPatient.id, formData);
    } else {
      // Add new patient
      addPatient(formData);
    }

    setIsFormModalOpen(false);
  };

  // Handle patient deletion
  const handleDelete = () => {
    if (patientToDelete) {
      removePatient(patientToDelete);
      setPatientToDelete(null);
    }

    setIsConfirmOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <button
          onClick={handleAddNew}
          className="btn-primary flex items-center"
        >
          <svg
            className="h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Patient
        </button>
      </div>

      <PatientList
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}>
        <PatientForm
          patient={currentPatient}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        wide
      >
        <PatientDetail
          patient={currentPatient}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={() => {
            setIsDetailModalOpen(false);
            setIsFormModalOpen(true);
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? This action cannot be undone and all associated data will be permanently deleted."
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

// Patients page with provider wrapper
const Patients = () => (
  <PatientProvider>
    <PatientsContent />
  </PatientProvider>
);

export default Patients;
