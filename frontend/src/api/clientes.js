import api from './axios.js';

export async function listarClientes() {
  const response = await api.get('/api/clientes');
  return response.data;
}

export async function buscarCliente(id) {
  const response = await api.get(`/api/clientes/${id}`);
  return response.data;
}

export async function criarCliente(payload) {
  const response = await api.post('/api/clientes', payload);
  return response.data;
}

export async function atualizarCliente(id, payload) {
  const response = await api.put(`/api/clientes/${id}`, payload);
  return response.data;
}

export async function excluirCliente(id) {
  await api.delete(`/api/clientes/${id}`);
}
