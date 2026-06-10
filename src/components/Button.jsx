import { cn } from '../utils/cn.js';

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 border-brand-600',
  secondary: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-red-600',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border-transparent',
  warning: 'bg-amber-500 text-slate-950 hover:bg-amber-600 border-amber-500'
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  icon: 'h-9 w-9 p-0'
};

export default function Button({
  children,
  className,
  icon: Icon,
  type = 'button',
  variant = 'primary',
  size = 'md',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md border font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
