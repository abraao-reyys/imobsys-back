export function extractFieldErrors(error) {
  const fieldErrors = error?.response?.data?.fieldErrors;
  if (!Array.isArray(fieldErrors)) return {};

  return fieldErrors.reduce((acc, item) => {
    if (item?.field) acc[item.field] = item.message || 'Campo inválido.';
    return acc;
  }, {});
}

export function getApiErrorMessage(error) {
  const data = error?.response?.data;

  if (data?.error || data?.message) {
    return [data.error, data.message].filter(Boolean).join(': ');
  }

  if (error?.message) return error.message;

  return 'Não foi possível concluir a operação.';
}
