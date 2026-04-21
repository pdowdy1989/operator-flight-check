import apiClient from './apiClient';

const createCheckoutSession = (invoiceId) => apiClient.post(`/payments/checkout-session/${invoiceId}`).then(r => r.data);

export default { createCheckoutSession };
