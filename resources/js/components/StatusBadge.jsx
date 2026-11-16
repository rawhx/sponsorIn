import { cn, statusLabel, statusTone } from '../lib/utils';

const tones = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  success: 'border-emerald-200/80 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200/80 bg-amber-50 text-amber-700',
  danger: 'border-rose-200/80 bg-rose-50 text-rose-700',
  info: 'border-sky-200/80 bg-sky-50 text-sky-700',
  primary: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

const dotColors = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  primary: 'bg-emerald-600',
};

export default function StatusBadge({ status, label, tone, className }) {
  const currentTone = tone ?? statusTone(status) ?? 'neutral';

  return (
    <span
      className={cn(
        'app-status-badge inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5',
        tones[currentTone] ?? tones.neutral,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[currentTone] ?? dotColors.neutral)} aria-hidden="true" />
      {label ?? statusLabel(status)}
    </span>
  );
}

export function EvidenceTag({ children, tone = 'neutral', className }) {
  return (
    <span
      className={cn(
        'app-evidence-tag inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium leading-5 shadow-2xs',
        tones[tone] ?? tones.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
