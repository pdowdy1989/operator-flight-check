import { apiClient } from "./apiClient";

export const geocodeService = {
  async searchLocations(query) {
    const response = await apiClient.get("/geocode/search", {
      params: { q: query },
    });
    return response.data;
  },

  async reverseGeocode(lat, lon) {
    const response = await apiClient.get("/geocode/reverse", {
      params: { lat, lon },
    });
    return response.data;
  },
};
