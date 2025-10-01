import axios from 'axios';

// Minimal API client used across the app
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL as string | undefined,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export default api;


