import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://promtova.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Smart JWT token attachment
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken');
  
  // Choose token based on endpoint
  let token = userToken;
  
  // Use admin token for admin routes, prompt management, and admin request actions
  const isAdminRoute = config.url.includes('/admin') 
    || config.url.includes('/prompts/stats')
    || config.url.includes('/fulfill')
    || (config.url.includes('/requests') && ['delete', 'put'].includes(config.method.toLowerCase()));
    
  const isPromptManagement = config.url.includes('/prompts') && ['post', 'put', 'delete'].includes(config.method.toLowerCase());
  
  if (isAdminRoute || isPromptManagement) {
    token = adminToken;
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling - clear stale tokens automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isConfigAdmin = error.config.url.includes('/admin') 
        || error.config.url.includes('/prompts/stats')
        || error.config.url.includes('/fulfill');

      if (isConfigAdmin) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminId');
      } else {
        localStorage.removeItem('userToken');
      }
    }
    return Promise.reject(error);
  }
);

// Public prompt routes
export const fetchPrompts = (params = {}) => api.get('/prompts', { params });
export const fetchFeedPrompts = (params = {}) => api.get('/prompts/feed', { params });
export const searchPrompts = (q, params = {}) => api.get('/prompts/search', { params: { q, ...params } });
export const fetchPromptById = (id) => api.get(`/prompts/${id}`);
export const uploadPrompt = (formData) => api.post('/prompts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updatePrompt = (id, data) => api.put(`/prompts/${id}`, data);
export const deletePrompt = (id) => api.delete(`/prompts/${id}`);
export const fetchAnalytics = () => api.get('/prompts/stats');

// Admin auth routes
export const adminLogin = (adminId, password) => api.post('/admin/login', { adminId, password });
export const getAdminProfile = () => api.get('/admin/profile');
export const updateAdminCredentials = (data) => api.put('/admin/credentials', data);
export const fetchAllUsers = () => api.get('/admin/users');
export const deleteUserAccount = (id) => api.delete(`/admin/users/${id}`);

// User auth routes
export const userRegister = (data) => api.post('/auth/register', data);
export const userLogin = (email, password) => api.post('/auth/login', { email, password });
export const getUserProfile = () => api.get('/user/profile');
export const updateUserProfile = (userData) => api.put('/user/profile', userData);
export const toggleLike = (id) => api.post(`/user/like/${id}`);
export const toggleSave = (id) => api.post(`/user/save/${id}`);
export const fetchSavedPrompts = () => api.get('/user/saved');

// Request routes
export const createRequest = (formData) => api.post('/requests', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const fetchRequests = (params = {}) => api.get('/requests', { params });
export const fetchRequestById = (id) => api.get(`/requests/${id}`);
export const updateRequest = (id, data) => api.put(`/requests/${id}`, data);
export const deleteRequest = (id) => api.delete(`/requests/${id}`);
export const likeRequest = (id) => api.post(`/requests/${id}/like`);
export const commentRequest = (id, text) => api.post(`/requests/${id}/comment`, { text });
export const fulfillRequest = (id, promptId) => api.post(`/requests/${id}/fulfill`, { promptId });

export default api;

