import type { I_CandidateWithScore } from '../types';

// Storage keys
const STORAGE_KEYS = {
  SHORTLISTED_TEAM: 'applicant_screening_shortlisted_team',
  TEAM_SIZE: 'applicant_screening_team_size',
} as const;

/**
 * Generic function to save data to localStorage with error handling
 */
const saveToStorage = <T>(key: string, data: T): boolean => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Storage: Failed to save data for key ${key}:`, error);
    return false;
  }
};

/**
 * Async function to save data to localStorage using requestIdleCallback for better performance
 */
const saveToStorageAsync = <T>(key: string, data: T): Promise<boolean> => {
  return new Promise((resolve) => {
    // Use requestIdleCallback if available, otherwise fallback to setTimeout
    const callback = () => {
      const success = saveToStorage(key, data);
      resolve(success);
    };

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(callback, { timeout: 1000 });
    } else {
      setTimeout(callback, 0);
    }
  });
};

/**
 * Generic function to load data from localStorage with error handling
 */
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    const parsedItem = JSON.parse(item) as T;
    return parsedItem;
  } catch (error) {
    console.error(`Storage: Failed to load data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove item from localStorage
 */
const removeFromStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Storage: Failed to remove key ${key}:`, error);
    return false;
  }
};

/**
 * Check if localStorage is available
 * Tests write/read operations to ensure storage works
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

// Shortlisted team functions
export const saveShortlistedTeamAsync = (team: I_CandidateWithScore[]): Promise<boolean> => {
  return saveToStorageAsync(STORAGE_KEYS.SHORTLISTED_TEAM, team);
};

export const loadShortlistedTeam = (): I_CandidateWithScore[] => {
  return loadFromStorage<I_CandidateWithScore[]>(STORAGE_KEYS.SHORTLISTED_TEAM, []);
};

export const clearShortlistedTeam = (): boolean => {
  return removeFromStorage(STORAGE_KEYS.SHORTLISTED_TEAM);
};

// Team size functions
export const saveTeamSizeAsync = (size: number): Promise<boolean> => {
  return saveToStorageAsync(STORAGE_KEYS.TEAM_SIZE, size);
};

export const loadTeamSize = (): number => {
  return loadFromStorage<number>(STORAGE_KEYS.TEAM_SIZE, 0);
};

export const clearTeamSize = (): boolean => {
  return removeFromStorage(STORAGE_KEYS.TEAM_SIZE);
};