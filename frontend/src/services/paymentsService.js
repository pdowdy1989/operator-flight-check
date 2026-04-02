import { apiClient } from "./apiClient";

export const paymentsService = {
  getByInvoice(invoiceId) {
    return apiClient.get(`/payments/invoice/${invoiceId}`).then((response) => response.data);
  },
  create(payload) {
    return apiClient.post("/payments", payload).then((response) => response.data);
  },
};
