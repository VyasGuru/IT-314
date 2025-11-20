import api from "./api";

/**
 * Saved Listing API service
 * Handles all saved listing-related API calls
 */

// Save a listing
export const saveListing = async (listingId) => {
  const response = await api.post("/saved-listings", {
    listingId,
  });
  return response.data;
};

// Remove a saved listing
export const removeSavedListing = async (listingId) => {
  const response = await api.delete(`/saved-listings/${listingId}`);
  return response.data;
};

// Get all saved listings for current user
export const getSavedListings = async () => {
  const response = await api.get("/saved-listings");
  return response.data;
};

