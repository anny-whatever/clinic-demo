/**
 * Generate a unique ID with a prefix
 * @param {string} prefix - Prefix for the ID
 * @returns {string} - Unique ID
 */
export const generateId = (prefix = "") => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}${timestamp}-${random}`;
};

/**
 * Generate a unique entity ID with a prefix
 * @param {string} prefix - Entity type prefix (e.g., "user", "patient")
 * @returns {string} - Unique ID with format "{prefix}_{random}"
 */
export const generateEntityId = (prefix = "") => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return `${prefix ? prefix + "_" : ""}${timestamp}${random}`;
};

/**
 * Generate a unique numeric ID
 * @returns {number} - Unique numeric ID
 */
export const generateNumericId = () => {
  return Date.now() + Math.floor(Math.random() * 10000);
};

/**
 * Generate a sequential ID with a given prefix and current count
 * @param {string} prefix - Entity type prefix
 * @param {number} count - Current counter value
 * @returns {string} - ID with format "{prefix}{paddedCount}"
 */
export const generateSequentialId = (prefix, count) => {
  const paddedCount = String(count).padStart(4, "0");
  return `${prefix}${paddedCount}`;
};

/**
 * Generate a UUID (v4)
 * @returns {string} - UUID v4 string
 */
export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
