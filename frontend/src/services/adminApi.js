import api from "./api";

export const verifyListing = async (listingId) => {
  const response = await api.patch(`/admin/listings/${listingId}/verify`);
  return response.data;
};
