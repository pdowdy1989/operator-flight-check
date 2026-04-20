import apiClient from './apiClient';

export const getClients = () => apiClient.get('/clients');
export const getClient = (id) => apiClient.get(`/clients/${id}`);
export const createClient = (data) => apiClient.post('/clients', data);
export const updateClient = (id, data) => apiClient.put(`/clients/${id}`, data);
export const deleteClient = (id) => apiClient.delete(`/clients/${id}`);
