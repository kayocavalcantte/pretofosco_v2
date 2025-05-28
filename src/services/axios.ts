import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Cria a instância do axios com a URL base do backend
const api = axios.create({
  baseURL: 'http://localhost:8080', // ajuste se necessário
});

// Interceptor para adicionar token no header Authorization
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // pega o token salvo
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para lidar com respostas
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token inválido ou expirado - desloga o usuário
      localStorage.removeItem('token');
      // Redireciona para /login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
