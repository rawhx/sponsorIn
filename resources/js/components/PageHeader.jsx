import { cn } from '../lib/utils';

export default function PageHeader({ eyebrow, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-1.5 text-xs font-semibold tracking-wider text-emerald-700 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-slate-600">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0 flex items-center gap-2">{action}</div> : null}
    </div>
  );
}
