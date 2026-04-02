import { apiClient } from "./apiClient";

export const clientPortalService = {
  getPortal(token) {
    return apiClient.get(`/client-portal/${token}`).then((response) => response.data);
  },
  getStatus(token) {
    return apiClient.get(`/client-portal/${token}/status`).then((response) => response.data);
  },
  getDeliverables(token) {
    return apiClient.get(`/client-portal/${token}/deliverables`).then((response) => response.data);
  },
  pay(token, payload) {
    return apiClient.post(`/client-portal/${token}/pay`, payload).then((response) => response.data);
  },
};
