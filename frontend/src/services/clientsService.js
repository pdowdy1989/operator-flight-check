import { apiClient } from "./apiClient";

export const clientsService = {
  getAll() {
    return apiClient.get("/clients").then((response) => response.data);
  },
  search(query) {
    return apiClient.get(`/clients/search?q=${encodeURIComponent(query)}`).then((response) => response.data);
  },
  create(payload) {
    return apiClient.post("/clients", payload).then((response) => response.data);
  },
  update(id, payload) {
    return apiClient.put(`/clients/${id}`, payload).then((response) => response.data);
  },
  remove(id) {
    return apiClient.delete(`/clients/${id}`);
  },
};
