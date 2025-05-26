import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8080", // ou substitua pela sua URL ex: http://localhost:8080
});

// Interceptor: adiciona o token JWT a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
