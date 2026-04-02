import { apiClient } from "./apiClient";

export const missionsService = {
  getAll({ page = 0, size = 20 } = {}) {
    return apiClient.get(`/missions?page=${page}&size=${size}`).then((response) => response.data);
  },
  getByClient(clientId) {
    return apiClient.get(`/missions/client/${clientId}`).then((response) => response.data);
  },
  create(payload) {
    return apiClient.post("/missions", payload).then((response) => response.data);
  },
  update(id, payload) {
    return apiClient.put(`/missions/${id}`, payload).then((response) => response.data);
  },
  remove(id) {
    return apiClient.delete(`/missions/${id}`);
  },
};
