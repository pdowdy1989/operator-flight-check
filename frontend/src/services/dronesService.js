import apiClient from './apiClient';

export const getDrones = () => apiClient.get('/drones');
export const getDrone = (id) => apiClient.get(`/drones/${id}`);
export const createDrone = (data) => apiClient.post('/drones', data);
export const updateDrone = (id, data) => apiClient.put(`/drones/${id}`, data);
export const deleteDrone = (id) => apiClient.delete(`/drones/${id}`);
