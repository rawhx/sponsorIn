import { Link } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

const variants = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 border-emerald-600 shadow-xs hover:shadow',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border-slate-200/80',
  outline: 'bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 border-slate-300 shadow-xs',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border-rose-600 shadow-xs hover:shadow',
  'destructive-outline': 'bg-white text-rose-600 hover:bg-rose-50 border-rose-200 active:bg-rose-100',
};

const sizes = {
  sm: 'h-8 px-3 text-xs sm:text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm sm:text-base',
};

export function buttonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'app-button inline-flex items-center justify-center gap-2 rounded-lg border font-medium cursor-pointer select-none',
    'transition-all duration-150 ease-out',
    'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none',
    variants[variant],
    sizes[size],
    className
  );
}

export function Spinner({ className }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-hidden="true" />;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading = false,
  disabled,
  ...props
}) {
  return (
    <button className={buttonClasses({ variant, size, className })} disabled={disabled || loading} {...props}>
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  method,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <Link
      href={href}
      method={method}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {children}
    </Link>
  );
}
