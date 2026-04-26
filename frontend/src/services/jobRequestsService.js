import apiClient from './apiClient';

const submitRequest = (payload) => apiClient.post('/job-requests', payload).then(r => r.data);
const getMyRequests = () => apiClient.get('/job-requests').then(r => r.data);
const getAllRequests = () => apiClient.get('/job-requests/all').then(r => r.data);
const getRequest = (id) => apiClient.get(`/job-requests/${id}`).then(r => r.data);
const decide = (id, decision, decisionNotes = '') =>
  apiClient.post(`/job-requests/${id}/decide`, { decision, decisionNotes }).then(r => r.data);
const cancelRequest = (id) => apiClient.post(`/job-requests/${id}/cancel`).then(r => r.data);

export default { submitRequest, getMyRequests, getAllRequests, getRequest, decide, cancelRequest };
