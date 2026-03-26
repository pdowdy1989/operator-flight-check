import { apiClient } from "./apiClient";

export const spotsService = {
  async list() {
    const response = await apiClient.get("/spots");
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/spots/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await apiClient.post("/spots", payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await apiClient.put(`/spots/${id}`, payload);
    return response.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/spots/${id}`);
    return response.data;
  },
};
