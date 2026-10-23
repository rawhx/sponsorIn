import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { cn } from '../lib/utils';

export default function Logo({ className, href = '/' }) {
  const { auth } = usePage().props;
  const destination = auth?.user ? '/dashboard' : href;

  return (
    <Link href={destination} className={cn('group inline-flex items-center gap-2', className)}>
      {/* Icon mark */}
      <span className="relative flex h-7 w-7 items-center justify-center rounded-[7px] border border-primary/30 bg-background-muted">
        <span className="h-3 w-3 rounded-[3px] border border-primary-strong/80" />
        <span className="absolute bottom-[5px] right-[5px] h-1.5 w-1.5 rounded-full bg-primary-strong" />
      </span>
      {/* Wordmark */}
      <span className="text-[16px] font-semibold tracking-[-0.02em] text-text">
        Sponsor<span className="text-primary-strong">In</span>
      </span>
    </Link>
  );
}
