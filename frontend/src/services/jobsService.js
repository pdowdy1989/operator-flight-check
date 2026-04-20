import apiClient from './apiClient';

export const getJobs = () => apiClient.get('/jobs');
export const getJob = (id) => apiClient.get(`/jobs/${id}`);
export const createJob = (data) => apiClient.post('/jobs', data);
export const updateJob = (id, data) => apiClient.put(`/jobs/${id}`, data);
export const updateJobStatus = (id, status) => apiClient.patch(`/jobs/${id}/status`, { status });
export const acceptJob = (id) => apiClient.patch(`/jobs/${id}/accept`);
export const deleteJob = (id) => apiClient.delete(`/jobs/${id}`);
