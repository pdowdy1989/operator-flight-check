import { apiClient } from "./apiClient";

export const invoicesService = {
  getAll({ page = 0, size = 20 } = {}) {
    return apiClient.get(`/invoices?page=${page}&size=${size}`).then((response) => response.data);
  },
  create(payload) {
    return apiClient.post("/invoices", payload).then((response) => response.data);
  },
  update(id, payload) {
    return apiClient.put(`/invoices/${id}`, payload).then((response) => response.data);
  },
  updateStatus(id, status) {
    return apiClient.patch(`/invoices/${id}/status`, { status }).then((response) => response.data);
  },
  remove(id) {
    return apiClient.delete(`/invoices/${id}`);
  },
};
