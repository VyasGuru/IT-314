import api from "./api";

/**
 * Property Comparison API service
 * Handles property comparison-related API calls
 */

// Add property to comparison
export const addPropertyToComparison = async (propertyId) => {
  const response = await api.post("/comparison", {
    propertyId,
  });
  return response.data;
};

// Get compared properties for current user
export const getComparedProperties = async () => {
  const response = await api.get("/comparison");
  return response.data;
};

// Remove property from comparison
export const removePropertyFromComparison = async (propertyId) => {
  const response = await api.delete(`/comparison/${propertyId}`);
  return response.data;
};

// Clear all comparisons
export const clearComparison = async () => {
  const response = await api.delete("/comparison");
  return response.data;
};

