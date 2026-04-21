import apiClient from './apiClient';

const getActiveCatalog = () => apiClient.get('/service-catalog/active').then(r => r.data);

export default { getActiveCatalog };
