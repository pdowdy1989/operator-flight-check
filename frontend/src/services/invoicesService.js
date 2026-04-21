import apiClient from './apiClient';

export const getInvoices = () => apiClient.get('/invoices');
export const getInvoice = (id) => apiClient.get(`/invoices/${id}`);
export const getInvoiceByJob = (jobId) => apiClient.get(`/invoices/by-job/${jobId}`);
export const createInvoice = (data) => apiClient.post('/invoices', data);
export const updateInvoiceStatus = (id, status) =>
  apiClient.patch(`/invoices/${id}/status`, { status });
export const deleteInvoice = (id) => apiClient.delete(`/invoices/${id}`);
export const downloadInvoicePdf = (invoiceId) =>
  apiClient.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' }).then(r => r.data);
