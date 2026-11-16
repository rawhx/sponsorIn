import { useState } from 'react';
import { ChevronDown, Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

const base =
  'app-input w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm sm:text-[15px] text-slate-800 placeholder:text-slate-400 transition-all duration-150 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs';

export function Input({ className, error, icon: Icon, rightElement, ...props }) {
  if (Icon || rightElement) {
    return (
      <div className="relative flex items-center">
        {Icon ? (
          <span className="pointer-events-none absolute left-3.5 text-slate-400">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
        <input
          className={cn(
            base,
            'h-10 sm:h-11',
            Icon && 'pl-10',
            rightElement && 'pr-11',
            error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/20',
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
      className={cn(
        base,
        'h-10 sm:h-11',
        error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/20',
        className
      )}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
}

const numberFormatter = new Intl.NumberFormat('id-ID');

export function CurrencyInput({ value = '', onChange, className, ...props }) {
  const digits = String(value ?? '').replace(/\D/g, '');
  const display = digits ? numberFormatter.format(Number(digits)) : '';

  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400"
        aria-hidden="true"
      >
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className={cn(base, 'h-10 sm:h-11 pl-10', className)}
        value={display}
        onChange={(event) => onChange?.(event.target.value.replace(/\D/g, ''))}
        {...props}
      />
    </div>
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
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
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
        className={cn(
          base,
          'h-10 sm:h-11 cursor-pointer appearance-none pr-10',
          error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/20',
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </div>
  );
}

export function Textarea({ className, error, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(
        base,
        'py-2.5 sm:py-3 leading-relaxed',
        error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/20',
        className
      )}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
}

export function Field({ label, htmlFor, hint, error, required, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="app-field-label flex items-baseline justify-between gap-3 text-sm font-medium text-slate-700">
        <span>
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </span>
        {hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
      </label>
      {children}
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
