import { useState } from 'react';
import { ChevronDown, Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

const base =
  'w-full rounded-[8px] border border-border bg-surface px-3.5 text-[15px] text-text placeholder:text-text-muted transition-colors duration-150 focus:border-primary-strong focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-background-muted';

export function Input({ className, error, icon: Icon, rightElement, ...props }) {
  if (Icon || rightElement) {
    return (
      <div className="relative flex items-center">
        {Icon ? (
          <span className="pointer-events-none absolute left-3.5 text-text-muted">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
        <input
          className={cn(
            base,
            'h-11',
            Icon && 'pl-10',
            rightElement && 'pr-11',
            error && 'border-danger-strong focus:border-danger-strong focus:ring-danger/20',
            className
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {rightElement ? (
          <div className="absolute right-2.5 flex items-center">{rightElement}</div>
        ) : null}
      </div>
    );
  }

  return (
    <input
      className={cn(base, 'h-11', error && 'border-danger-strong focus:border-danger-strong focus:ring-danger/20', className)}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
}

export function PasswordInput({ className, error, icon: Icon = Lock, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      type={visible ? 'text' : 'password'}
      icon={Icon}
      error={error}
      className={className}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-pressed={visible}
          aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          className="rounded-[6px] p-1 text-text-muted hover:bg-hover hover:text-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      }
      {...props}
    />
  );
}

export function Select({ className, error, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(base, 'h-11 cursor-pointer appearance-none pr-10', error && 'border-danger-strong', className)}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        aria-hidden="true"
      />
    </div>
  );
}

export function Textarea({ className, error, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(base, 'py-3 leading-relaxed', error && 'border-danger-strong focus:border-danger-strong focus:ring-danger/20', className)}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
}

export function Field({ label, htmlFor, hint, error, required, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-3 text-sm font-medium text-text">
        <span>
          {label}
          {required ? <span className="ml-1 text-danger-strong">*</span> : null}
        </span>
        {hint ? <span className="text-xs font-normal text-text-secondary-strong">{hint}</span> : null}
      </label>
      {children}
      {error ? <p className="text-xs text-danger-strong">{error}</p> : null}
    </div>
  );
}
