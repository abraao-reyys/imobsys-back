import api from './axios.js';

export async function login({ email, senha }) {
  const response = await api.post('/api/auth/login', { email, senha }, { skipAuth: true });
  return response.data;
}
