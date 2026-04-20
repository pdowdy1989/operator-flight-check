import apiClient from './apiClient';

export const getReport = (jobId) => apiClient.get(`/inspection-reports/job/${jobId}`);
export const saveReport = (jobId, data) => apiClient.post(`/inspection-reports/job/${jobId}`, data);
export const submitReport = (jobId) => apiClient.patch(`/inspection-reports/job/${jobId}/submit`);
export const reviewReport = (jobId, data) =>
  apiClient.patch(`/inspection-reports/job/${jobId}/review`, data);
