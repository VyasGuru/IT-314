import api from "./api";

/**
 * Property API service
 * Handles all property-related API calls
 */

// Get filtered properties
export const getProperties = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Search term
  if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
  if (filters.search) params.append("search", filters.search);
  
  // Property type
  if (filters.propertyType) params.append("propertyType", filters.propertyType);
  
  // Price range (frontend format like "0-100k")
  if (filters.priceRange) params.append("priceRange", filters.priceRange);
  
  // Individual price filters (alternative to priceRange)
  if (filters.minPrice) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
  
  // Bedrooms (supports "5+" format)
  if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);
  
  // Bathrooms (supports "4+" format)
  if (filters.bathrooms) params.append("bathrooms", filters.bathrooms);
  
  // Location
  if (filters.location) params.append("location", filters.location);
  if (filters.city) params.append("city", filters.city);
  if (filters.state) params.append("state", filters.state);
  
  // Size filters
  if (filters.minSize) params.append("minSize", filters.minSize);
  if (filters.maxSize) params.append("maxSize", filters.maxSize);
  
  // Year built
  if (filters.year_built) params.append("year_built", filters.year_built);
  
  // Amenities (array of strings)
  if (filters.amenities && filters.amenities.length > 0) {
    // Map frontend amenity names to backend keys
    const amenityMap = {
      "Swimming Pool": "swimmingPool",
      "Gym": "gym",
      "Parking": "parking",
      "Balcony": "balcony",
      "Garden": "garden",
      "Security": "security",
      "Elevator": "lift",
      "Air Conditioning": "airConditioning",
      "Fireplace": "fireplace",
      "Garage": "garage",
      "WiFi": "wifi",
      "Power Backup": "powerBackup",
      "Clubhouse": "clubhouse",
      "Play Area": "playArea",
      "Furnished": "furnished",
    };
    
    const backendAmenities = filters.amenities.map(amenity => 
      amenityMap[amenity] || amenity.toLowerCase().replace(/\s+/g, '')
    );
    params.append("amenities", backendAmenities.join(","));
  }
  
  // Sorting
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  
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

// Get listing by property ID
export const getListingByPropertyId = async (propertyId) => {
  const response = await api.get(`/properties/listings/by-property/${propertyId}`);
  return response.data;
};
