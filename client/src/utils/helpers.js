/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

/**
 * Format a date to YYYY-MM-DD
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} - Formatted date
 */
export const formatDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split("T")[0];
};

/**
 * Format a date for display (MM/DD/YYYY)
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} - Formatted date
 */
export const formatDateForDisplay = (date) => {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const year = d.getFullYear();

  return `${month}/${day}/${year}`;
};

/**
 * Format a time for display (HH:MM AM/PM)
 * @param {string} time - Time string in 24-hour format (HH:MM)
 * @returns {string} - Formatted time
 */
export const formatTimeForDisplay = (time) => {
  if (!time) return "";

  const [hour, minute] = time.split(":");
  const hourNum = parseInt(hour, 10);

  if (isNaN(hourNum) || !minute) return time;

  const period = hourNum >= 12 ? "PM" : "AM";
  const hour12 = hourNum % 12 || 12;

  return `${hour12}:${minute} ${period}`;
};

/**
 * Format date and time for display
 * @param {Date|string} date - Date object or ISO string
 * @param {string} time - Time string (HH:MM)
 * @returns {string} - Formatted date and time
 */
export const formatDateTimeForDisplay = (date, time) => {
  const formattedDate = formatDateForDisplay(date);
  const formattedTime = formatTimeForDisplay(time);

  return formattedDate && formattedTime
    ? `${formattedDate} at ${formattedTime}`
    : formattedDate || formattedTime || "";
};

/**
 * Get current date as ISO string (YYYY-MM-DD)
 * @returns {string} - Current date
 */
export const getCurrentDate = () => {
  return formatDate(new Date());
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if the date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate < today;
};

/**
 * Sort array of objects by a date field
 * @param {Array} array - Array to sort
 * @param {string} dateField - Field containing the date
 * @param {boolean} ascending - Sort in ascending order
 * @returns {Array} - Sorted array
 */
export const sortByDate = (array, dateField, ascending = true) => {
  return [...array].sort((a, b) => {
    // Handle potential undefined values
    const dateValueA = a && a[dateField] ? a[dateField] : null;
    const dateValueB = b && b[dateField] ? b[dateField] : null;

    // If one value is null, sort it to the end
    if (dateValueA === null && dateValueB === null) return 0;
    if (dateValueA === null) return ascending ? 1 : -1;
    if (dateValueB === null) return ascending ? -1 : 1;

    const dateA = new Date(dateValueA);
    const dateB = new Date(dateValueB);

    // Handle invalid dates
    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
    if (isNaN(dateA.getTime())) return ascending ? 1 : -1;
    if (isNaN(dateB.getTime())) return ascending ? -1 : 1;

    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Deep clone an object or array
 * @param {Object|Array} obj - Object to clone
 * @returns {Object|Array} - Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Calculate age from date of birth
 * @param {Date|string} dob - Date of birth
 * @returns {number} - Age in years
 */
export const calculateAge = (dob) => {
  if (!dob) return null;

  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};
