import api from "./api";

/**
 * Property API service
 * Handles all property-related API calls
 */

// Get filtered properties
export const getProperties = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.propertyType) params.append("propertyType", filters.propertyType);
  if (filters.minPrice) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
  if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);
  if (filters.bathrooms) params.append("bathrooms", filters.bathrooms);
  if (filters.city) params.append("city", filters.city);
  if (filters.state) params.append("state", filters.state);
  if (filters.search) params.append("search", filters.search);
  if (filters.amenities && filters.amenities.length > 0) {
    params.append("amenities", filters.amenities.join(","));
  }
  
  const queryString = params.toString();
  const url = `/properties${queryString ? `?${queryString}` : ""}`;
  
  const response = await api.get(url);
  return response.data;
};

// Get single property by ID
export const getPropertyById = async (propertyId) => {
  const response = await api.get(`/properties/${propertyId}`);
  return response.data;
};

// Create new property (requires lister role)
export const createProperty = async (propertyData, images) => {
  const formData = new FormData();
  
  // Append property data
  Object.keys(propertyData).forEach((key) => {
    if (propertyData[key] !== null && propertyData[key] !== undefined) {
      if (typeof propertyData[key] === "object") {
        formData.append(key, JSON.stringify(propertyData[key]));
      } else {
        formData.append(key, propertyData[key]);
      }
    }
  });
  
  // Append images
  if (images && images.length > 0) {
    images.forEach((image) => {
      formData.append("images", image);
    });
  }
  
  const response = await api.post("/properties/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update property details (requires lister role)
export const updatePropertyDetails = async (propertyId, updates) => {
  const response = await api.patch(`/properties/update-details/${propertyId}`, updates);
  return response.data;
};

// Update property status (requires lister role)
export const updatePropertyStatus = async (propertyId, status) => {
  const response = await api.patch(`/properties/update-status/${propertyId}`, {
    status,
  });
  return response.data;
};

// Delete property (requires lister role)
export const deleteProperty = async (propertyId) => {
  const response = await api.delete(`/properties/delete/${propertyId}`);
  return response.data;
};

