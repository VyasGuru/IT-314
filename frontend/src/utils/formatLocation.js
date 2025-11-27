/**
 * Formats a location object into a readable string
 * @param {Object|string} location - Location object or string
 * @returns {string} Formatted location string
 */
export const formatLocation = (location) => {
  // If location is already a string, return it
  if (typeof location === 'string') {
    return location;
  }
  
  // If location is not an object, return empty string
  if (!location || typeof location !== 'object') {
    return 'Location not available';
  }
  
  // Build location string from object properties
  const parts = [];
  
  if (location.street) parts.push(location.street);
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.zipCode) parts.push(location.zipCode);
  
  // If we have parts, join them; otherwise try common properties
  if (parts.length > 0) {
    return parts.join(', ');
  }
  
  // Fallback: return city and state if available
  if (location.city && location.state) {
    return `${location.city}, ${location.state}`;
  }
  
  if (location.city) {
    return location.city;
  }
  
  return 'Location not available';
};

