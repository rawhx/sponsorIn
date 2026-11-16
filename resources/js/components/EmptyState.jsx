import { cn } from '../lib/utils';
import Illustration from './Illustrations';

export default function EmptyState({ title, description, action, illustration = 'document', className }) {
  return (
    <div className={cn('rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center shadow-2xs backdrop-blur-xs', className)}>
      <div className="mx-auto flex justify-center">
        <Illustration name={illustration} className="h-24 w-32 drop-shadow-xs" />
      </div>
      <p className="mt-4 text-base font-semibold text-slate-800">{title}</p>
      {description ? <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
