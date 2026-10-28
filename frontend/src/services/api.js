import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Auto-inject JWT Bearer Token if present in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('onestop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
