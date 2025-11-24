import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  addPropertyToComparison,
  clearComparison as clearComparisonApi,
  getComparedProperties,
  removePropertyFromComparison,
} from "../services/comparisonApi";

const ComparisonContext = createContext({
  properties: [],
  loading: false,
  updatingId: null,
  error: null,
  refreshComparison: async () => {},
  addProperty: async () => {},
  removeProperty: async () => {},
  clearAll: async () => {},
});

// Helper function to get user-specific storage key
const getStorageKey = (userId) => {
  return userId ? `comparison:properties:${userId}` : "comparison:properties:guest";
};

// Helper function to clear all comparison storage keys
export const clearAllComparisonStorage = () => {
  if (typeof window === "undefined") return;
  try {
    // Clear all keys that start with "comparison:properties"
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("comparison:properties")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // ignore errors
  }
};

export const ComparisonProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [lastUserId, setLastUserId] = useState(null);

  // Load properties from localStorage for current user
  const loadFromStorage = useCallback((userId) => {
    if (typeof window === "undefined") return [];
    try {
      const storageKey = getStorageKey(userId);
      const cached = window.localStorage.getItem(storageKey);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }, []);

  // Save properties to localStorage for current user
  const saveToStorage = useCallback((userId, data) => {
    if (typeof window === "undefined") return;
    try {
      const storageKey = getStorageKey(userId);
      window.localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // ignore write errors (e.g. private mode)
    }
  }, []);

  // Clear storage for a specific user
  const clearUserStorage = useCallback((userId) => {
    if (typeof window === "undefined") return;
    try {
      const storageKey = getStorageKey(userId);
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore errors
    }
  }, []);

  // Handle user change - clear state when user logs out or switches
  useEffect(() => {
    const currentUserId = currentUser?.uid || null;
    
    // If user logged out (currentUserId is null but lastUserId was set)
    if (!currentUserId && lastUserId !== null) {
      // Clear the previous user's localStorage and state
      clearUserStorage(lastUserId);
      setProperties([]);
      setLastUserId(null);
      return;
    }
    
    // If user logged in or switched users
    if (currentUserId && currentUserId !== lastUserId) {
      // If switching users, clear previous user's localStorage from memory
      if (lastUserId !== null) {
        clearUserStorage(lastUserId);
      }
      
      // Load current user's data from localStorage first (for quick display)
      const cachedData = loadFromStorage(currentUserId);
      setProperties(cachedData);
      setLastUserId(currentUserId);
    }
  }, [currentUser, lastUserId, loadFromStorage, clearUserStorage]);

  const refreshComparison = useCallback(async () => {
    // Only fetch from backend if user is authenticated
    if (!currentUser) {
      // User not logged in - clear properties
      setProperties([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await getComparedProperties();
      if (Array.isArray(response?.data)) {
        setProperties(response.data);
        // Save to localStorage for offline access
        saveToStorage(currentUser.uid, response.data);
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 || status === 400) {
        // No properties found or less than 2 properties - clear state
        setProperties([]);
        saveToStorage(currentUser.uid, []);
      } else if (status === 401) {
        // User not authenticated - clear state
        setProperties([]);
        if (currentUser?.uid) {
          clearUserStorage(currentUser.uid);
        }
        setError(null);
      } else {
        setError(err?.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, saveToStorage, clearUserStorage]);

  // Refresh when user changes - load from backend when user logs in
  useEffect(() => {
    if (currentUser) {
      refreshComparison();
    } else {
      // User logged out - ensure state is cleared
      setProperties([]);
      setError(null);
    }
  }, [currentUser?.uid, refreshComparison]);

  const addProperty = useCallback(
    async (property) => {
      if (!property?._id) return;
      if (properties.length >= 4) {
        const limitError = new Error("You can compare up to 4 properties at once.");
        setError(limitError.message);
        throw limitError;
      }
      setUpdatingId(property._id);
      setError(null);
      try {
        // Only sync with backend if user is authenticated
        if (currentUser) {
          await addPropertyToComparison(property._id);
        }
        // Always update local state and localStorage
        setProperties((prev) => {
          const alreadyAdded = prev.some(
            (item) => (item._id || item.id) === property._id
          );
          if (alreadyAdded) {
            return prev;
          }
          const updated = [...prev, property];
          // Save to localStorage if user is authenticated
          if (currentUser?.uid) {
            saveToStorage(currentUser.uid, updated);
          }
          return updated;
        });
      } catch (err) {
        // If auth error, just use local storage (for guest users)
        if (err?.response?.status === 401) {
          setProperties((prev) => {
            const alreadyAdded = prev.some(
              (item) => (item._id || item.id) === property._id
            );
            if (alreadyAdded) {
              return prev;
            }
            const updated = [...prev, property];
            // Save to guest storage
            saveToStorage(null, updated);
            return updated;
          });
        } else {
          setError(err?.response?.data?.message || err.message);
          throw err;
        }
      } finally {
        setUpdatingId(null);
      }
    },
    [properties.length, currentUser, saveToStorage]
  );

  const removeProperty = useCallback(
    async (propertyId) => {
      if (!propertyId) return;
      setUpdatingId(propertyId);
      setError(null);
      try {
        // Only sync with backend if user is authenticated
        if (currentUser) {
          await removePropertyFromComparison(propertyId);
        }
        // Always update local state and localStorage
        setProperties((prev) => {
          const updated = prev.filter((item) => (item._id || item.id) !== propertyId);
          // Save to localStorage
          if (currentUser?.uid) {
            saveToStorage(currentUser.uid, updated);
          } else {
            saveToStorage(null, updated);
          }
          return updated;
        });
      } catch (err) {
        // If auth error, just update local state (for guest users)
        if (err?.response?.status === 401) {
          setProperties((prev) => {
            const updated = prev.filter((item) => (item._id || item.id) !== propertyId);
            saveToStorage(null, updated);
            return updated;
          });
        } else {
          setError(err?.response?.data?.message || err.message);
          throw err;
        }
      } finally {
        setUpdatingId(null);
      }
    },
    [currentUser, saveToStorage]
  );

  const clearAll = useCallback(async () => {
    setError(null);
    setUpdatingId("all");
    try {
      // Only sync with backend if user is authenticated
      if (currentUser) {
        await clearComparisonApi();
      }
    } catch (err) {
      // it's okay if backend doesn't have anything to clear or if user is not authenticated
      if (err?.response?.status && err.response.status >= 500) {
        setError(err?.response?.data?.message || err.message);
      }
    } finally {
      // Always clear local state and localStorage
      setProperties([]);
      if (currentUser?.uid) {
        clearUserStorage(currentUser.uid);
      } else {
        clearUserStorage(null);
      }
      setUpdatingId(null);
    }
  }, [currentUser, clearUserStorage]);

  const value = {
    properties,
    loading,
    updatingId,
    error,
    refreshComparison,
    addProperty,
    removeProperty,
    clearAll,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => useContext(ComparisonContext);

