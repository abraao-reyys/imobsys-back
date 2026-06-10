import api from './axios.js';

export async function listarImoveis() {
  const response = await api.get('/api/imoveis');
  return response.data;
}

export async function buscarImovel(id) {
  const response = await api.get(`/api/imoveis/${id}`);
  return response.data;
}

export async function criarImovel(payload) {
  const response = await api.post('/api/imoveis', payload);
  return response.data;
}

export async function atualizarImovel(id, payload) {
  const response = await api.put(`/api/imoveis/${id}`, payload);
  return response.data;
}

export async function alterarStatusImovel(id, status) {
  const response = await api.patch(`/api/imoveis/${id}/status`, { status });
  return response.data;
}

export async function excluirImovel(id) {
  await api.delete(`/api/imoveis/${id}`);
}
