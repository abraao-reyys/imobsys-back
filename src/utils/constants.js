export const TIPO_IMOVEL = [
  'APARTAMENTO',
  'CASA',
  'COBERTURA',
  'KITNET',
  'TERRENO',
  'SALA_COMERCIAL',
  'GALPAO',
  'CHACARA'
];

export const STATUS_IMOVEL = [
  'DISPONIVEL',
  'RESERVADO',
  'EM_NEGOCIACAO',
  'VENDIDO',
  'ALUGADO',
  'INDISPONIVEL'
];

export const TIPO_PROPOSTA = ['VENDA', 'ALUGUEL'];

export const FORMA_PAGAMENTO = [
  'A_VISTA',
  'FINANCIAMENTO_BANCARIO',
  'CONSORCIO',
  'PERMUTA',
  'ENTRADA_PARCELAMENTO'
];

export const STATUS_PROPOSTA = [
  'RASCUNHO',
  'PENDENTE_ACEITACAO',
  'ACEITA',
  'RECUSADA',
  'AJUSTE_SOLICITADO',
  'EXPIRADA',
  'CANCELADA'
];

export const TERMINAL_PROPOSTA_STATUS = ['ACEITA', 'RECUSADA', 'EXPIRADA', 'CANCELADA'];
export const EDITABLE_PROPOSTA_STATUS = ['RASCUNHO', 'AJUSTE_SOLICITADO'];
export const DELETABLE_PROPOSTA_STATUS = ['RASCUNHO', 'CANCELADA', 'RECUSADA'];

export const enumLabels = {
  APARTAMENTO: 'Apartamento',
  CASA: 'Casa',
  COBERTURA: 'Cobertura',
  KITNET: 'Kitnet',
  TERRENO: 'Terreno',
  SALA_COMERCIAL: 'Sala comercial',
  GALPAO: 'Galpão',
  CHACARA: 'Chácara',
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  EM_NEGOCIACAO: 'Em negociação',
  VENDIDO: 'Vendido',
  ALUGADO: 'Alugado',
  INDISPONIVEL: 'Indisponível',
  VENDA: 'Venda',
  ALUGUEL: 'Aluguel',
  A_VISTA: 'À vista',
  FINANCIAMENTO_BANCARIO: 'Financiamento bancário',
  CONSORCIO: 'Consórcio',
  PERMUTA: 'Permuta',
  ENTRADA_PARCELAMENTO: 'Entrada + parcelamento',
  RASCUNHO: 'Rascunho',
  PENDENTE_ACEITACAO: 'Aguardando cliente',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
  AJUSTE_SOLICITADO: 'Ajuste solicitado',
  EXPIRADA: 'Expirada',
  CANCELADA: 'Cancelada'
};

export function labelFor(value) {
  return enumLabels[value] || value || 'Não informado';
}
