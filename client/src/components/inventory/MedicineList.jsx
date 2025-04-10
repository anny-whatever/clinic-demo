import { useState, useMemo } from "react";
import { useMedicines } from "../../contexts/MedicineContext";
import { MEDICINE_TYPES } from "../../utils/constants";

const MedicineList = ({ onEdit, onDelete }) => {
  const { medicines, isLowStock } = useMedicines();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filter and sort medicines
  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((medicine) => {
        // Filter by search term
        const nameMatch = medicine.name
          ? medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
          : false;
        const dosageMatch = medicine.dosage
          ? medicine.dosage.toLowerCase().includes(searchTerm.toLowerCase())
          : false;

        // Filter by medicine type
        const typeMatch = !filterType || medicine.type === filterType;

        return (nameMatch || dosageMatch) && typeMatch;
      })
      .sort((a, b) => {
        // Sort by selected field
        let comparison = 0;

        if (sortBy === "name") {
          // Handle potential undefined values
          const nameA = a.name || "";
          const nameB = b.name || "";
          comparison = nameA.localeCompare(nameB);
        } else if (sortBy === "type") {
          // Handle potential undefined values
          const typeA = a.type || "";
          const typeB = b.type || "";
          comparison = typeA.localeCompare(typeB);
        } else if (sortBy === "inventory") {
          // Handle potential undefined values
          const inventoryA = a.inventory || 0;
          const inventoryB = b.inventory || 0;
          comparison = inventoryA - inventoryB;
        }

        // Apply sort order
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [medicines, searchTerm, filterType, sortBy, sortOrder, isLowStock]);

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
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search medicines..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-1/3">
            <select
              className="form-input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              {Object.values(MEDICINE_TYPES).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {filteredMedicines.length}{" "}
            {filteredMedicines.length === 1 ? "item" : "items"}
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Dosage
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("type")}
              >
                <div className="flex items-center">
                  Type
                  {sortBy === "type" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("inventory")}
              >
                <div className="flex items-center">
                  Inventory
                  {sortBy === "inventory" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
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
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {medicine.name || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {medicine.dosage || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {medicine.type || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${
                        isLowStock(medicine) ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {medicine.inventory || 0}{" "}
                      {isLowStock(medicine) && "(Low)"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(medicine)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(medicine.id)}
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
                  colSpan="5"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No medicines found. Add some medicines to your inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicineList;
