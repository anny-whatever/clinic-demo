import { useState } from "react";
import { format, addDays, isAfter, isBefore, parseISO } from "date-fns";
import { useTimeSlot } from "../../contexts/TimeSlotContext";
import { useAuth } from "../../contexts/AuthContext";

const TimeSlotConfiguration = () => {
  const { currentUser } = useAuth();
  const { generateTimeSlots, timeSlots } = useTimeSlot();

  const [slotConfig, setSlotConfig] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: addDays(new Date(), 30).toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: "30",
    includeWeekends: false,
  });

  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // New state for search and filter
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    dateFrom: "",
    dateTo: "",
    timeFrom: "",
    timeTo: "",
    status: "all", // all, available, booked
  });
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSlotConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setSlotConfig((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePreviewSlots = () => {
    const startDateObj = new Date(slotConfig.startDate);
    const endDateObj = new Date(slotConfig.endDate);

    // Filter out weekends if not included
    const preview = [];
    let currentDate = new Date(startDateObj);
    const endDate = new Date(endDateObj);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      // Skip weekends (0 = Sunday, 6 = Saturday) if not included
      if (slotConfig.includeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
        const dateStr = format(currentDate, "yyyy-MM-dd");

        // Calculate slots for this day
        const [startHour, startMinute] = slotConfig.startTime
          .split(":")
          .map(Number);
        const [endHour, endMinute] = slotConfig.endTime.split(":").map(Number);

        let currentTime = new Date(currentDate);
        currentTime.setHours(startHour, startMinute, 0, 0);

        const endTimeObj = new Date(currentDate);
        endTimeObj.setHours(endHour, endMinute, 0, 0);

        while (currentTime < endTimeObj) {
          const slotStartTime = format(currentTime, "HH:mm");

          // Add slot duration (in minutes)
          const durationInMinutes = parseInt(slotConfig.slotDuration);
          const slotEndTime = format(
            new Date(currentTime.getTime() + durationInMinutes * 60000),
            "HH:mm"
          );

          preview.push({
            date: dateStr,
            startTime: slotStartTime,
            endTime: slotEndTime,
          });

          // Move to next slot
          currentTime = new Date(
            currentTime.getTime() + durationInMinutes * 60000
          );
        }
      }

      // Move to next day
      currentDate = addDays(currentDate, 1);
    }

    setGeneratedSlots(preview);
    setShowPreview(true);
  };

  const handleGenerateSlots = () => {
    if (!currentUser || currentUser.role !== "doctor") {
      alert("Only doctors can generate time slots");
      return;
    }

    // Generate slots
    const slots = generateTimeSlots(
      currentUser.id,
      slotConfig.startDate,
      slotConfig.endDate,
      slotConfig.startTime,
      slotConfig.endTime,
      slotConfig.slotDuration,
      slotConfig.includeWeekends
    );

    alert(`Successfully generated ${slots.length} time slots.`);
    setShowPreview(false);
  };

  // New method to handle search filter changes
  const handleFilterChange = (field, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // New method to apply filters
  const applyFilters = () => {
    // Filter doctor's time slots
    const doctorSlots = timeSlots.filter(
      (slot) => slot.doctorId === currentUser.id
    );

    let filtered = [...doctorSlots];

    // Filter by date range
    if (searchFilters.dateFrom) {
      filtered = filtered.filter(
        (slot) =>
          isAfter(parseISO(slot.date), parseISO(searchFilters.dateFrom)) ||
          slot.date === searchFilters.dateFrom
      );
    }

    if (searchFilters.dateTo) {
      filtered = filtered.filter(
        (slot) =>
          isBefore(parseISO(slot.date), parseISO(searchFilters.dateTo)) ||
          slot.date === searchFilters.dateTo
      );
    }

    // Filter by time range
    if (searchFilters.timeFrom) {
      filtered = filtered.filter(
        (slot) => slot.startTime >= searchFilters.timeFrom
      );
    }

    if (searchFilters.timeTo) {
      filtered = filtered.filter(
        (slot) => slot.endTime <= searchFilters.timeTo
      );
    }

    // Filter by status
    if (searchFilters.status !== "all") {
      if (searchFilters.status === "available") {
        filtered = filtered.filter(
          (slot) => slot.isAvailable && !slot.isBooked
        );
      } else if (searchFilters.status === "booked") {
        filtered = filtered.filter((slot) => slot.isBooked);
      } else if (searchFilters.status === "unavailable") {
        filtered = filtered.filter((slot) => !slot.isAvailable);
      }
    }

    setFilteredTimeSlots(filtered);
    setIsFiltered(true);
  };

  // New method to clear filters
  const clearFilters = () => {
    setSearchFilters({
      dateFrom: "",
      dateTo: "",
      timeFrom: "",
      timeTo: "",
      status: "all",
    });
    setIsFiltered(false);
    setFilteredTimeSlots([]);
  };

  // New method to render search results
  const renderSearchResults = () => {
    if (!isFiltered || filteredTimeSlots.length === 0) {
      return (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-500 text-sm text-center">
            {isFiltered
              ? "No time slots match your search criteria."
              : "Use the search filters above to find specific time slots."}
          </p>
        </div>
      );
    }

    // Group slots by date
    const slotsByDate = filteredTimeSlots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    }, {});

    return (
      <div className="mt-4 space-y-4">
        {Object.keys(slotsByDate).map((date) => (
          <div
            key={date}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
          >
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">
                {format(new Date(date), "EEEE, MMMM d, yyyy")}
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {slotsByDate[date].map((slot, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    slot.isBooked
                      ? "bg-red-100 text-red-800"
                      : !slot.isAvailable
                      ? "bg-gray-100 text-gray-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {slot.startTime} - {slot.endTime}
                  <span className="block text-xs mt-1">
                    {slot.isBooked
                      ? "Booked"
                      : !slot.isAvailable
                      ? "Unavailable"
                      : "Available"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render preview slots
  const renderPreview = () => {
    if (generatedSlots.length === 0) {
      return null;
    }

    // Group by date
    const slotsByDate = generatedSlots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    }, {});

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Slot Preview ({generatedSlots.length} slots)
          </h3>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
            onClick={handleGenerateSlots}
          >
            Generate Slots
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.keys(slotsByDate).map((date) => (
            <div
              key={date}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="font-medium text-gray-800">
                  {format(new Date(date), "EEEE, MMMM d, yyyy")}
                </h3>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {slotsByDate[date].map((slot, index) => (
                  <div
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-xs"
                  >
                    {slot.startTime} - {slot.endTime}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Time Slot Generator */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Generate Time Slots
        </h2>
        <p className="text-gray-600 mb-6">
          Configure your availability by generating time slots for patients to
          book.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={slotConfig.startDate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={slotConfig.endDate}
              min={slotConfig.startDate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Start Time
            </label>
            <input
              type="time"
              name="startTime"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={slotConfig.startTime}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily End Time
            </label>
            <input
              type="time"
              name="endTime"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={slotConfig.endTime}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slot Duration (minutes)
            </label>
            <select
              name="slotDuration"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={slotConfig.slotDuration}
              onChange={handleInputChange}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="includeWeekends"
                className="sr-only peer"
                checked={slotConfig.includeWeekends}
                onChange={handleSwitchChange}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-700">
                Include Weekends
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
            onClick={handlePreviewSlots}
          >
            Preview Slots
          </button>
        </div>

        {showPreview && renderPreview()}
      </div>

      {/* Search Time Slots */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Search Time Slots
          </h2>
          <button
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={searchFilters.dateFrom}
                  onChange={(e) =>
                    handleFilterChange("dateFrom", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={searchFilters.dateTo}
                  min={searchFilters.dateFrom}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Time
                </label>
                <input
                  type="time"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={searchFilters.timeFrom}
                  onChange={(e) =>
                    handleFilterChange("timeFrom", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Time
                </label>
                <input
                  type="time"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={searchFilters.timeTo}
                  onChange={(e) => handleFilterChange("timeTo", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 mr-4">
                Status:
              </label>
              <div className="space-x-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600 focus:ring-indigo-500"
                    name="status"
                    value="all"
                    checked={searchFilters.status === "all"}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  />
                  <span className="ml-2 text-sm text-gray-700">All</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600 focus:ring-indigo-500"
                    name="status"
                    value="available"
                    checked={searchFilters.status === "available"}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  />
                  <span className="ml-2 text-sm text-gray-700">Available</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600 focus:ring-indigo-500"
                    name="status"
                    value="booked"
                    checked={searchFilters.status === "booked"}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  />
                  <span className="ml-2 text-sm text-gray-700">Booked</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600 focus:ring-indigo-500"
                    name="status"
                    value="unavailable"
                    checked={searchFilters.status === "unavailable"}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Unavailable
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={clearFilters}
              >
                Clear
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={applyFilters}
              >
                Search
              </button>
            </div>
          </div>
        )}

        {renderSearchResults()}
      </div>
    </div>
  );
};

export default TimeSlotConfiguration;
