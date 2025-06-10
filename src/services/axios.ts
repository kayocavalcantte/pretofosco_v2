import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Criação da instância do Axios
const api = axios.create({
  baseURL: 'http://localhost:8080/',
});

// Endpoints públicos que não exigem token
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/usuario/register',
  '/auth/util/hash-password'
];

// Função para verificar se o token expirou
function isTokenExpired(token: string): boolean {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    const currentTime = Date.now() / 1000; // em segundos
    return decoded.exp < currentTime;
  } catch (err) {
    return true; // Se não conseguir decodificar, trata como expirado
  }
}

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    const isPublic = PUBLIC_ENDPOINTS.some(endpoint => config.url?.includes(endpoint));
    const token = localStorage.getItem('token');

    if (token && !isPublic) {
      if (isTokenExpired(token)) {
        console.warn('Token expirado. Redirecionando para login...');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Token expirado'));
      }

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
      console.warn('Token inválido ou expirado pelo backend.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
