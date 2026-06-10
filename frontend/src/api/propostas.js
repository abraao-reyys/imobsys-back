import api from './axios.js';

export async function listarPropostas() {
  const response = await api.get('/api/propostas');
  return response.data;
}

export async function buscarProposta(id) {
  const response = await api.get(`/api/propostas/${id}`);
  return response.data;
}

export async function criarProposta(payload) {
  const response = await api.post('/api/propostas', payload);
  return response.data;
}

export async function atualizarProposta(id, payload) {
  const response = await api.patch(`/api/propostas/${id}`, payload);
  return response.data;
}

export async function enviarProposta(id) {
  const response = await api.post(`/api/propostas/${id}/enviar`);
  return response.data;
}

export async function cancelarProposta(id) {
  const response = await api.post(`/api/propostas/${id}/cancelar`);
  return response.data;
}

export async function excluirProposta(id) {
  await api.delete(`/api/propostas/${id}`);
}

export async function buscarPropostaPublica(id) {
  const response = await api.get(`/api/propostas/publico/${id}`, { skipAuth: true });
  return response.data;
}

export async function aceitarPropostaPublica(id) {
  const response = await api.post(`/api/propostas/publico/${id}/aceitar`, null, { skipAuth: true });
  return response.data;
}

export async function recusarPropostaPublica(id) {
  const response = await api.post(`/api/propostas/publico/${id}/recusar`, null, { skipAuth: true });
  return response.data;
}

export async function solicitarAjustePublico(id, observacao) {
  const response = await api.post(
    `/api/propostas/publico/${id}/solicitar-ajuste`,
    { observacao },
    { skipAuth: true }
  );
  return response.data;
}
