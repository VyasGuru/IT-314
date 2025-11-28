
import api from './api';

const estimatePriceService = async (listingId) => {
  try {
    const response = await api.get(`/estimate-price/${listingId}`);
    return response.data;
  } catch (error) {
    console.error('Error estimating price:', error);
    throw error;
  }
};

export { estimatePriceService };
