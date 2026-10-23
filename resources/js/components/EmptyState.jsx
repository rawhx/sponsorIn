import { cn } from '../lib/utils';
import Illustration from './Illustrations';

export default function EmptyState({ title, description, action, illustration = 'document', className }) {
  return (
    <div className={cn('rounded-[12px] border border-dashed border-border bg-background-muted/40 px-6 py-12 text-center', className)}>
      <div className="mx-auto flex justify-center">
        <Illustration name={illustration} className="h-24 w-32" />
      </div>
      <p className="mt-4 text-[15px] font-medium text-text">{title}</p>
      {description ? <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-text-secondary-strong">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
