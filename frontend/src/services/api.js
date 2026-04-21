import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: adiciona token JWT em todas as requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: trata erros de resposta (sem hard redirect)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não faz redirect automático — deixa o AuthContext cuidar disso
    return Promise.reject(error);
  }
);

export default api;
