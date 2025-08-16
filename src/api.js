import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://server-cq7e.onrender.com'
});

export async function health() {
  return api.get('/health').then(r => r.data);
}

// Campanhas
export async function createCampaign(payload) {
  return api.post('/api/campaigns', payload).then(r => r.data);
}
export async function listCampaigns() {
  return api.get('/api/campaigns').then(r => r.data);
}
export async function cancelCampaign(id) {
  return api.post(`/api/campaigns/${id}/cancel`).then(r => r.data);
}
export async function validateFilters(payload) {
  return api.post('/api/validate-filters', payload).then(r => r.data);
}

export default api;
