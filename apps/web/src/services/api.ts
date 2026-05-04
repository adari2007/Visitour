import axios from 'axios';

const configuredApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const API_BASE_URL = (configuredApiUrl || '/api').replace(/\/+$/, '');

if (!configuredApiUrl && typeof window !== 'undefined') {
  console.warn('VITE_API_URL is not set. Falling back to /api.');
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (email: string, password: string, firstName?: string, lastName?: string) =>
    apiClient.post('/auth/register', { email, password, firstName, lastName }),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
};

// Itineraries API
export const itinerariesAPI = {
  getAll: () => apiClient.get('/itineraries'),
  getPublic: () => apiClient.get('/itineraries/public/all'),
  getById: (id: string) => apiClient.get(`/itineraries/${id}`),
  create: (data: any) => apiClient.post('/itineraries', data),
  update: (id: string, data: any) => apiClient.put(`/itineraries/${id}`, data),
  updatePublicStatus: (id: string, isPublic: boolean) =>
    apiClient.put(`/itineraries/${id}`, { isPublic }),
  delete: (id: string) => apiClient.delete(`/itineraries/${id}`),
};

export const sharesAPI = {
  list: (itineraryId: string) => apiClient.get(`/itineraries/${itineraryId}/shares`),
  create: (itineraryId: string, data: { email: string; access: 'view' | 'edit' }) =>
    apiClient.post(`/itineraries/${itineraryId}/shares`, data),
  update: (itineraryId: string, shareId: string, data: { access: 'view' | 'edit' }) =>
    apiClient.patch(`/itineraries/${itineraryId}/shares/${shareId}`, data),
  remove: (itineraryId: string, shareId: string) =>
    apiClient.delete(`/itineraries/${itineraryId}/shares/${shareId}`),
};

// Entries API
export const entriesAPI = {
  getByItinerary: (itineraryId: string) =>
    apiClient.get(`/entries/itinerary/${itineraryId}`),
  create: (itineraryId: string, data: any) =>
    apiClient.post(`/entries/itinerary/${itineraryId}`, data),
  update: (id: string, data: any) => apiClient.put(`/entries/${id}`, data),
  delete: (id: string) => apiClient.delete(`/entries/${id}`),
};

export default apiClient;

