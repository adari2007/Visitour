import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
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
  getById: (id: string) => apiClient.get(`/itineraries/${id}`),
  create: (data: any) => apiClient.post('/itineraries', data),
  update: (id: string, data: any) => apiClient.put(`/itineraries/${id}`, data),
  delete: (id: string) => apiClient.delete(`/itineraries/${id}`),
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

