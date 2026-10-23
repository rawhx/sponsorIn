import { cn, statusLabel, statusTone } from '../lib/utils';

const tones = {
  neutral: 'border-border bg-background-muted text-text-secondary-strong',
  success: 'border-success/25 bg-success/10 text-success-strong',
  warning: 'border-warning/30 bg-warning/10 text-warning-strong',
  danger: 'border-danger/25 bg-danger/10 text-danger-strong',
  info: 'border-info/25 bg-info/10 text-info-strong',
  primary: 'border-primary/25 bg-primary/10 text-primary-strong',
};

export default function StatusBadge({ status, label, tone, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-none',
        tones[tone ?? statusTone(status)],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label ?? statusLabel(status)}
    </span>
  );
}

export function EvidenceTag({ children, tone = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] border px-2 py-0.5 text-[11px] font-medium leading-5',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
