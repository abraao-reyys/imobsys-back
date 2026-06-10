export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'Não informado';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value));
}

export function formatDate(value) {
  if (!value) return 'Não informado';

  const dateValue = String(value).includes('T') ? value : `${value}T00:00:00`;
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return 'Não informado';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  return Number(value);
}

export function toIntegerOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  return Number.parseInt(value, 10);
}

export function compactPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, value === '' ? null : value])
  );
}
