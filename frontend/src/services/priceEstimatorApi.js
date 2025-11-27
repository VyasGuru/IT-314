import api from "./api";

/**
 * Price Estimator API service
 * Handles price estimation-related API calls
 */

// Estimate property price by listing ID
export const estimatePrice = async (listingId) => {
  const response = await api.get(`/estimator/estimate-price/${listingId}`);
  return response.data;
};

