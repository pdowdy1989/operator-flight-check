import apiClient from './apiClient';

const getAgreementByJob = (jobId) => apiClient.get(`/agreements/by-job/${jobId}`).then(r => r.data);
const downloadAgreementPdf = (id) => apiClient.get(`/agreements/${id}/pdf`, { responseType: 'blob' }).then(r => r.data);

export default { getAgreementByJob, downloadAgreementPdf };
