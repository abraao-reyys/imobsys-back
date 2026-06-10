import { cn } from '../utils/cn.js';

export default function FormField({ label, name, error, children, className }) {
  return (
    <label className={cn('block space-y-1.5', className)} htmlFor={name}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}

export const fieldClassName =
  'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-500';

export const textareaClassName =
  'min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-500';
