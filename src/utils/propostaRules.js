import {
  DELETABLE_PROPOSTA_STATUS,
  EDITABLE_PROPOSTA_STATUS,
  TERMINAL_PROPOSTA_STATUS
} from './constants.js';
import { API_BASE_URL } from '../api/axios.js';

export function isPropostaEditable(status) {
  return EDITABLE_PROPOSTA_STATUS.includes(status);
}

export function isPropostaTerminal(status) {
  return TERMINAL_PROPOSTA_STATUS.includes(status);
}

export function canSendProposta(status) {
  return EDITABLE_PROPOSTA_STATUS.includes(status);
}

export function canCancelProposta(status) {
  return !TERMINAL_PROPOSTA_STATUS.includes(status);
}

export function canDeleteProposta(status) {
  return DELETABLE_PROPOSTA_STATUS.includes(status);
}

export function publicProposalApiLink(id) {
  return `${API_BASE_URL}/api/propostas/publico/${id}`;
}
