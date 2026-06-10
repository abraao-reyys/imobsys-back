export default function LoadingState({ label = 'Carregando...' }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-white">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      <span className="ml-3 text-sm font-medium text-slate-600">{label}</span>
    </div>
  );
}
