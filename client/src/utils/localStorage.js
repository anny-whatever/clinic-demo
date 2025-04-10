/**
 * Constants for localStorage keys
 */
export const STORAGE_KEYS = {
  CURRENT_USER: "CLINIC_CURRENT_USER",
  USERS: "CLINIC_USERS",
  PATIENTS: "CLINIC_PATIENTS",
  APPOINTMENTS: "CLINIC_APPOINTMENTS",
  MEDICINES: "CLINIC_MEDICINES",
  PRESCRIPTIONS: "CLINIC_PRESCRIPTIONS",
  PRESCRIPTION_TEMPLATES: "CLINIC_PRESCRIPTION_TEMPLATES",
  MEDICAL_RECORDS: "CLINIC_MEDICAL_RECORDS",
};

/**
 * Set an item in localStorage with the given key
 * @param {string} key - The key to store the value under
 * @param {any} value - The value to store (will be stringified)
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error);
  }
};

/**
 * Get an item from localStorage by key
 * @param {string} key - The key to retrieve
 * @param {any} defaultValue - Default value to return if key doesn't exist
 * @returns {any} The parsed value or defaultValue if not found
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Remove an item from localStorage by key
 * @param {string} key - The key to remove
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

/**
 * Clear all items from localStorage
 */
export const clearAll = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};

/**
 * Get the current logged-in user
 * @returns {Object|null} The current user or null if not logged in
 */
export const getCurrentUser = () => {
  return getItem(STORAGE_KEYS.CURRENT_USER);
};

/**
 * Set the current logged-in user
 * @param {Object} user - The user object to store
 */
export const setCurrentUser = (user) => {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
};

/**
 * Remove the current logged-in user (logout)
 */
export const removeCurrentUser = () => {
  removeItem(STORAGE_KEYS.CURRENT_USER);
};

/**
 * Check if a user is logged in
 * @returns {boolean} True if a user is logged in
 */
export const isLoggedIn = () => {
  return !!getCurrentUser();
};

/**
 * Get all users from localStorage
 * @returns {Array} Array of user objects
 */
export const getUsers = () => {
  return getItem(STORAGE_KEYS.USERS, []);
};

/**
 * Get all patients from localStorage
 * @returns {Array} Array of patient objects
 */
export const getPatients = () => {
  return getItem(STORAGE_KEYS.PATIENTS, []);
};

/**
 * Get all appointments from localStorage
 * @returns {Array} Array of appointment objects
 */
export const getAppointments = () => {
  return getItem(STORAGE_KEYS.APPOINTMENTS, []);
};

/**
 * Get all medicines from localStorage
 * @returns {Array} Array of medicine objects
 */
export const getMedicines = () => {
  return getItem(STORAGE_KEYS.MEDICINES, []);
};

/**
 * Get all prescriptions from localStorage
 * @returns {Array} Array of prescription objects
 */
export const getPrescriptions = () => {
  return getItem(STORAGE_KEYS.PRESCRIPTIONS, []);
};

/**
 * Get all medical records from localStorage
 * @returns {Array} Array of medical record objects
 */
export const getMedicalRecords = () => {
  return getItem(STORAGE_KEYS.MEDICAL_RECORDS, []);
};

/**
 * Save an array of items to localStorage
 * @param {string} key - The storage key to use
 * @param {Array} items - The array of items to save
 */
export const saveItems = (key, items) => {
  setItem(key, items);
};

/**
 * Add a new item to an array in localStorage
 * @param {string} key - The storage key for the array
 * @param {Object} item - The item to add
 * @returns {Object} The added item
 */
export const addItem = (key, item) => {
  const items = getItem(key, []);
  items.push(item);
  setItem(key, items);
  return item;
};

/**
 * Update an item in an array in localStorage
 * @param {string} key - The storage key for the array
 * @param {string} itemId - The ID of the item to update
 * @param {Object} updatedItem - The updated item data
 * @returns {Object|null} The updated item or null if not found
 */
export const updateItem = (key, itemId, updatedItem) => {
  const items = getItem(key, []);
  const index = items.findIndex((item) => item.id === itemId);

  if (index !== -1) {
    items[index] = { ...items[index], ...updatedItem };
    setItem(key, items);
    return items[index];
  }

  return null;
};

/**
 * Delete an item from an array in localStorage
 * @param {string} key - The storage key for the array
 * @param {string} itemId - The ID of the item to delete
 * @returns {boolean} True if the item was deleted
 */
export const deleteItem = (key, itemId) => {
  const items = getItem(key, []);
  const filteredItems = items.filter((item) => item.id !== itemId);

  if (filteredItems.length < items.length) {
    setItem(key, filteredItems);
    return true;
  }

  return false;
};

/**
 * Get all entities of a specific type from localStorage
 * @param {string} storageKey - The storage key for the entity type
 * @returns {Array} Array of entity objects
 */
export const getEntities = (storageKey) => {
  return getItem(storageKey, []);
};

/**
 * Get an entity by ID
 * @param {string} storageKey - The storage key for the entity type
 * @param {string} id - The ID of the entity to retrieve
 * @returns {Object|null} The entity or null if not found
 */
export const getEntityById = (storageKey, id) => {
  const entities = getEntities(storageKey);
  return entities.find((entity) => entity.id === id) || null;
};

/**
 * Add a new entity
 * @param {string} storageKey - The storage key for the entity type
 * @param {Object} entity - The entity to add
 * @returns {Object} The added entity
 */
export const addEntity = (storageKey, entity) => {
  return addItem(storageKey, entity);
};

/**
 * Update an entity
 * @param {string} storageKey - The storage key for the entity type
 * @param {string} id - The ID of the entity to update
 * @param {Object} updates - The updated entity data
 * @returns {Object|null} The updated entity or null if not found
 */
export const updateEntity = (storageKey, id, updates) => {
  return updateItem(storageKey, id, updates);
};

/**
 * Remove an entity
 * @param {string} storageKey - The storage key for the entity type
 * @param {string} id - The ID of the entity to remove
 * @returns {boolean} True if the entity was removed
 */
export const removeEntity = (storageKey, id) => {
  return deleteItem(storageKey, id);
};
