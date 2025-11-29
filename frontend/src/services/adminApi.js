import api from "./api";

export const verifyListing = async (listingId) => {
  const response = await api.patch(`/admin/${listingId}/verify`);
  return response.data;
};
