import apiClient from './apiClient';

export const createMission = (data) => apiClient.post('/missions', data);
export const getMissionsForJob = (jobId) => apiClient.get(`/missions/job/${jobId}`);
export const getMission = (id) => apiClient.get(`/missions/${id}`);
export const completeMission = (id, data) => apiClient.patch(`/missions/${id}/complete`, data);
export const deleteMission = (id) => apiClient.delete(`/missions/${id}`);
