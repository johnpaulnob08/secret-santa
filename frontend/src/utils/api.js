import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.error || err.response?.data?.details?.join(', ') || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Groups
export const groupsApi = {
  getAll: (adminEmail) => api.get(`/groups/admin/${encodeURIComponent(adminEmail)}`),
  getOne: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`)
};

// Shuffle
export const shuffleApi = {
  generate: (groupId) => api.post(`/shuffle/${groupId}`)
};

// Email
export const emailApi = {
  sendAll: (groupId) => api.post(`/email/send/${groupId}`)
};

export default api;