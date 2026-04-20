import apiClient from './apiClient';

export const uploadDocument = (formData) =>
  apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getJobDocuments = (jobId) => apiClient.get(`/documents/job/${jobId}`);
export const getJobDeliverables = (jobId) => apiClient.get(`/documents/job/${jobId}/deliverables`);
export const getMissionDocuments = (missionId) => apiClient.get(`/documents/mission/${missionId}`);
export const downloadDocument = (id) =>
  apiClient.get(`/documents/${id}/download`, { responseType: 'blob' });
export const toggleDeliverable = (id, isDeliverable) =>
  apiClient.patch(`/documents/${id}/deliverable`, { isDeliverable });
export const deleteDocument = (id) => apiClient.delete(`/documents/${id}`);
