import { Link } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

const variants = {
  primary: 'bg-primary-strong text-white hover:bg-[#52614a] active:bg-[#47543f] border-primary-strong',
  secondary: 'bg-background-muted text-text hover:bg-hover border-background-muted',
  outline: 'bg-surface text-text hover:bg-hover border-border',
  ghost: 'bg-transparent text-text-secondary-strong hover:bg-hover hover:text-text border-transparent',
  destructive: 'bg-danger-strong text-white hover:bg-[#7c4141] active:bg-[#6d3939] border-danger-strong',
  'destructive-outline': 'bg-surface text-danger-strong hover:bg-danger/10 border-danger/40',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-[15px]',
};

export function buttonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-[10px] border font-medium',
    'transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out',
    'active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0',
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
