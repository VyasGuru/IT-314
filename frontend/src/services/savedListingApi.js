import api from "./api";

/**
 * Saved Listing API service
 * Handles all saved listing-related API calls
 */

// Save a listing
export const saveListing = async (listingIdOrObj) => {
  // Accept either a raw id (string) or an object like { listingId: id } and normalize it
  const listingId =
    typeof listingIdOrObj === "string" || typeof listingIdOrObj === "number"
      ? listingIdOrObj
      : listingIdOrObj?.listingId ?? listingIdOrObj?._id;

  if (!listingId) {
    throw new Error("saveListing requires a listingId");
  }

  const response = await api.post("/saved-listings", {
    listingId,
  });
  return response.data;
};

// Remove a saved listing
export const removeSavedListing = async (propertyId) => {
  const response = await api.delete(`/saved-listings/${propertyId}`);
  return response.data;
};

// Get all saved listings for current user
export const getSavedListings = async () => {
  const response = await api.get("/saved-listings");
  return response.data;
};

// Get all saved listing IDs for current user
export const getSavedListingIds = async () => {
  const response = await api.get("/saved-listings/ids");
  return response.data;
};


