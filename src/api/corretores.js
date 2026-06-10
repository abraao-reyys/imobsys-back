import api from './axios.js';

export async function criarCorretor(payload) {
  const response = await api.post('/api/corretores', payload, { skipAuth: true });
  return response.data;
}

export async function listarCorretores() {
  const response = await api.get('/api/corretores');
  return response.data;
}
