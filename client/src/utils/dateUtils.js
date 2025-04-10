import {
  format,
  parseISO,
  isValid,
  differenceInMinutes,
  addDays,
  addWeeks,
  addMonths,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isBefore,
  isAfter,
  isWithinInterval,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from "date-fns";

/**
 * Format a date to a string
 * @param {Date|string} date - Date to format
 * @param {string} formatString - Format string
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, formatString = "yyyy-MM-dd") => {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return isValid(parsedDate) ? format(parsedDate, formatString) : "";
};

/**
 * Format a time string
 * @param {string} timeString - Time string in HH:mm format
 * @returns {string} - Formatted time string (e.g., "09:00 AM")
 */
export const formatTime = (timeString) => {
  if (!timeString) return "";

  // Create a date object with the time string
  const date = parseISO(`2000-01-01T${timeString}`);
  return isValid(date) ? format(date, "hh:mm a") : "";
};

/**
 * Format a date and time
 * @param {Date|string} date - Date to format
 * @param {string} time - Time string in HH:mm format
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date, time) => {
  if (!date || !time) return "";

  const dateString = typeof date === "string" ? date : formatDate(date);
  const parsedDate = parseISO(`${dateString}T${time}`);
  return isValid(parsedDate) ? format(parsedDate, "yyyy-MM-dd hh:mm a") : "";
};

/**
 * Calculate time difference in minutes
 * @param {Date|string} startDate - Start date/time
 * @param {Date|string} endDate - End date/time
 * @returns {number} - Difference in minutes
 */
export const getTimeDifferenceInMinutes = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) return 0;

  return differenceInMinutes(end, start);
};

/**
 * Get date ranges
 * @param {Date} date - Reference date
 * @returns {Object} - Object containing date ranges
 */
export const getDateRanges = (date = new Date()) => {
  const today = startOfDay(date);

  return {
    today: {
      start: startOfDay(today),
      end: endOfDay(today),
    },
    yesterday: {
      start: startOfDay(addDays(today, -1)),
      end: endOfDay(addDays(today, -1)),
    },
    thisWeek: {
      start: startOfWeek(today),
      end: endOfWeek(today),
    },
    lastWeek: {
      start: startOfWeek(addWeeks(today, -1)),
      end: endOfWeek(addWeeks(today, -1)),
    },
    thisMonth: {
      start: startOfMonth(today),
      end: endOfMonth(today),
    },
    lastMonth: {
      start: startOfMonth(addMonths(today, -1)),
      end: endOfMonth(addMonths(today, -1)),
    },
  };
};

/**
 * Check if a date is within a range
 * @param {Date|string} date - Date to check
 * @param {Date|string} startDate - Start date of range
 * @param {Date|string} endDate - End date of range
 * @returns {boolean} - True if date is within range
 */
export const isDateWithinRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;

  const checkDate = typeof date === "string" ? parseISO(date) : date;
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

  if (!isValid(checkDate) || !isValid(start) || !isValid(end)) return false;

  return isWithinInterval(checkDate, { start, end });
};

/**
 * Get an array of dates within a interval
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {string} interval - Interval type ('day', 'week', 'month')
 * @returns {Array} - Array of dates
 */
export const getDatesInRange = (startDate, endDate, interval = "day") => {
  if (!startDate || !endDate) return [];

  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) return [];

  const dateRange = { start, end };

  switch (interval) {
    case "day":
      return eachDayOfInterval(dateRange);
    case "week":
      return eachWeekOfInterval(dateRange);
    case "month":
      return eachMonthOfInterval(dateRange);
    default:
      return eachDayOfInterval(dateRange);
  }
};

/**
 * Compare two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} - -1 if date1 is before date2, 1 if date1 is after date2, 0 if equal
 */
export const compareDates = (date1, date2) => {
  if (!date1 || !date2) return 0;

  const first = typeof date1 === "string" ? parseISO(date1) : date1;
  const second = typeof date2 === "string" ? parseISO(date2) : date2;

  if (!isValid(first) || !isValid(second)) return 0;

  if (isBefore(first, second)) return -1;
  if (isAfter(first, second)) return 1;
  return 0;
};
