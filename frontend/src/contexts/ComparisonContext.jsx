import { createContext, useCallback, useContext, useEffect, useState } from "react";
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

const STORAGE_KEY = "comparison:properties";

const usePersistedState = (initialValue) => {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const cached = window.localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const updateState = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore write errors (e.g. private mode)
        }
      }
      return next;
    });
  }, []);

  return [state, updateState];
};

export const ComparisonProvider = ({ children }) => {
  const [properties, setProperties] = usePersistedState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const refreshComparison = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getComparedProperties();
      if (Array.isArray(response?.data)) {
        setProperties(response.data);
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setProperties([]);
      } else if (status !== 400) {
        setError(err?.response?.data?.message || err.message);
      }
      // keep cached selections when backend requires at least 2 properties (400)
    } finally {
      setLoading(false);
    }
  }, [setProperties]);

  useEffect(() => {
    refreshComparison();
  }, [refreshComparison]);

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
        await addPropertyToComparison(property._id);
        setProperties((prev) => {
          const alreadyAdded = prev.some(
            (item) => (item._id || item.id) === property._id
          );
          if (alreadyAdded) {
            return prev;
          }
          return [...prev, property];
        });
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
        throw err;
      } finally {
        setUpdatingId(null);
      }
    },
    [properties.length, setProperties]
  );

  const removeProperty = useCallback(
    async (propertyId) => {
      if (!propertyId) return;
      setUpdatingId(propertyId);
      setError(null);
      try {
        await removePropertyFromComparison(propertyId);
        setProperties((prev) =>
          prev.filter((item) => (item._id || item.id) !== propertyId)
        );
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
        throw err;
      } finally {
        setUpdatingId(null);
      }
    },
    [setProperties]
  );

  const clearAll = useCallback(async () => {
    setError(null);
    setUpdatingId("all");
    try {
      await clearComparisonApi();
    } catch (err) {
      // it's okay if backend doesn't have anything to clear
      if (err?.response?.status && err.response.status >= 500) {
        setError(err?.response?.data?.message || err.message);
      }
    } finally {
      setProperties([]);
      setUpdatingId(null);
    }
  }, [setProperties]);

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

