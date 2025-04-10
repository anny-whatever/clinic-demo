import { useState, useMemo } from "react";
import { usePatients } from "../../contexts/PatientContext";

const PatientList = ({ onEdit, onDelete, onView }) => {
  const { patients } = usePatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterGender, setFilterGender] = useState("");

  // Filter and sort patients
  const filteredPatients = useMemo(() => {
    return patients
      .filter((patient) => {
        // Filter by search term
        const nameMatch = patient.name
          ? patient.name.toLowerCase().includes(searchTerm.toLowerCase())
          : false;
        const emailMatch =
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          false;
        const contactMatch = patient.contact?.includes(searchTerm) || false;

        // Filter by gender
        const genderMatch = !filterGender || patient.gender === filterGender;

        return (nameMatch || emailMatch || contactMatch) && genderMatch;
      })
      .sort((a, b) => {
        // Sort by selected field
        let comparison = 0;

        if (sortBy === "name") {
          // Handle potential undefined values
          const nameA = a.name || "";
          const nameB = b.name || "";
          comparison = nameA.localeCompare(nameB);
        } else if (sortBy === "age") {
          // Handle potential undefined values
          const ageA = a.age || 0;
          const ageB = b.age || 0;
          comparison = ageA - ageB;
        } else if (sortBy === "gender") {
          // Handle potential undefined values
          const genderA = a.gender || "";
          const genderB = b.gender || "";
          comparison = genderA.localeCompare(genderB);
        }

        // Apply sort order
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [patients, searchTerm, filterGender, sortBy, sortOrder]);

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and default to ascending
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search patients by name, email or contact..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-1/4">
            <select
              className="form-input"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {filteredPatients.length}{" "}
            {filteredPatients.length === 1 ? "patient" : "patients"}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("name")}
              >
                <div className="flex items-center">
                  Name
                  {sortBy === "name" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("age")}
              >
                <div className="flex items-center">
                  Age
                  {sortBy === "age" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("gender")}
              >
                <div className="flex items-center">
                  Gender
                  {sortBy === "gender" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {patient.name || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {patient.age || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.gender === "Male"
                          ? "bg-blue-100 text-blue-800"
                          : patient.gender === "Female"
                          ? "bg-pink-100 text-pink-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {patient.gender || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {patient.contact || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {patient.email || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onView(patient)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(patient)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(patient.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No patients found. Add some patients to your system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;
