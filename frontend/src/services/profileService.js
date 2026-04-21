import apiClient from './apiClient';

const getMyProfile = () => apiClient.get('/profile/me').then(r => r.data);
const updateMyProfile = (payload) => apiClient.put('/profile/me', payload).then(r => r.data);

export default { getMyProfile, updateMyProfile };
