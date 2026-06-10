import { cn } from '../utils/cn.js';
import { labelFor } from '../utils/constants.js';

const badgeClasses = {
  RASCUNHO: 'bg-slate-100 text-slate-700 border-slate-200',
  PENDENTE_ACEITACAO: 'bg-amber-100 text-amber-800 border-amber-200',
  ACEITA: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  RECUSADA: 'bg-red-100 text-red-800 border-red-200',
  AJUSTE_SOLICITADO: 'bg-orange-100 text-orange-800 border-orange-200',
  EXPIRADA: 'bg-purple-100 text-purple-800 border-purple-200',
  CANCELADA: 'bg-red-900 text-red-50 border-red-900',
  DISPONIVEL: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  RESERVADO: 'bg-sky-100 text-sky-800 border-sky-200',
  EM_NEGOCIACAO: 'bg-amber-100 text-amber-800 border-amber-200',
  VENDIDO: 'bg-slate-900 text-white border-slate-900',
  ALUGADO: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  INDISPONIVEL: 'bg-slate-200 text-slate-700 border-slate-300'
};

export default function Badge({ value, className }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        badgeClasses[value] || 'bg-slate-100 text-slate-700 border-slate-200',
        className
      )}
    >
      {labelFor(value)}
    </span>
  );
}
