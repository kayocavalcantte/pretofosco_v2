import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/',
});

// Lista de endpoints públicos (que não exigem token)
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/usuario/register',
  '/auth/util/hash-password'
];

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    const isPublic = PUBLIC_ENDPOINTS.some(endpoint => config.url?.includes(endpoint));
    const token = localStorage.getItem('token');

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
