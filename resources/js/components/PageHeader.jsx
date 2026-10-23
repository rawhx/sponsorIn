import { cn } from '../lib/utils';

export default function PageHeader({ eyebrow, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="mb-2 text-xs font-medium tracking-[0.08em] text-text-muted">{eyebrow}</p> : null}
        <h1 className="text-[clamp(1.6rem,3vw,2.15rem)] font-semibold leading-tight tracking-[-0.025em] text-text">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-relaxed text-text-secondary-strong">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
