import { apiClient } from "./apiClient";

export const spotChecksService = {
  async list() {
    const response = await apiClient.get("/spot-checks");
    return response.data;
  },

  async create(payload) {
    const response = await apiClient.post("/spot-checks", payload);
    return response.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/spot-checks/${id}`);
    return response.data;
  },
};
