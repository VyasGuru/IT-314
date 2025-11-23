import api from "./api";

// Submit a review
export const submitReview = async (propertyId, rating, comment) => {
  const response = await api.post("/reviews", {
    propertyId,
    rating,
    comment,
  });
  return response.data;
};

// Get all reviews
export const getPropertyReviews = async (propertyId) => {
  const response = await api.get(`/reviews/property/${propertyId}`);
  return response.data;
};

