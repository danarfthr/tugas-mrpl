import { useState, useEffect, useCallback } from 'react';

/**
 * Synchronizes state with localStorage.
 * Handles SSR safety, JSON serialization, and quota errors.
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if key doesn't exist
 * @returns {[*, Function, Function]} [value, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      console.warn(`useLocalStorage: failed to parse "${key}", returning initial value`);
      return initialValue;
    }
  });

  /**
   * Set a new value and sync to localStorage.
   * @param {*} newValue - Value to store
   */
  const setValue = useCallback((newValue) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(storedValue) : newValue;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (storageError) {
      if (storageError.name === 'QuotaExceededError') {
        console.error(`useLocalStorage: quota exceeded for key "${key}"`);
      } else {
        console.error(`useLocalStorage: failed to set "${key}"`, storageError);
      }
    }
  }, [key, storedValue]);

  /**
   * Remove the key from localStorage.
   */
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (storageError) {
      console.error(`useLocalStorage: failed to remove "${key}"`, storageError);
    }
  }, [key, initialValue]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch {
          console.warn(`useLocalStorage: storage event parse failed for "${key}"`);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
