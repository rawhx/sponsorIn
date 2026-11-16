import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Logo({ className, href = '/' }) {
  const { auth } = usePage().props;
  const destination = auth?.user ? '/dashboard' : href;

  return (
    <Link href={destination} className={cn('group inline-flex items-center gap-2.5', className)}>
      {/* Icon mark */}
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 shadow-xs transition-colors group-hover:border-emerald-500/30 group-hover:bg-emerald-500/15">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      </span>
      {/* Wordmark */}
      <span className="text-[17px] font-bold tracking-tight text-slate-900">
        Sponsor<span className="text-emerald-600">In</span>
      </span>
    </Link>
  );
}
