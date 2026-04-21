import apiClient from './apiClient';

const submitRequest = (payload) => apiClient.post('/job-requests', payload).then(r => r.data);
const getMyRequests = () => apiClient.get('/job-requests').then(r => r.data);
const getRequest = (id) => apiClient.get(`/job-requests/${id}`).then(r => r.data);
const cancelRequest = (id) => apiClient.post(`/job-requests/${id}/cancel`).then(r => r.data);

export default { submitRequest, getMyRequests, getRequest, cancelRequest };
