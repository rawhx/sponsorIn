import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Pagination({ paginator }) {
  if (!paginator || paginator.last_page <= 1) return null;

  const previous = paginator.links?.[0]?.url;
  const next = paginator.links?.[paginator.links.length - 1]?.url;

  return (
    <nav className="flex items-center justify-between gap-4 border-t border-slate-200 pt-5" aria-label="Navigasi halaman">
      <Link
        href={previous ?? '#'}
        preserveScroll
        aria-label="Halaman sebelumnya"
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-medium transition-colors shadow-2xs',
          previous
            ? 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            : 'pointer-events-none text-slate-400 opacity-50 bg-slate-50 border-slate-200'
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </Link>
      <p className="text-sm font-medium text-slate-600">
        Halaman <span className="text-slate-900 font-semibold">{paginator.current_page}</span> dari <span className="text-slate-900 font-semibold">{paginator.last_page}</span>
      </p>
      <Link
        href={next ?? '#'}
        preserveScroll
        aria-label="Halaman berikutnya"
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-medium transition-colors shadow-2xs',
          next
            ? 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            : 'pointer-events-none text-slate-400 opacity-50 bg-slate-50 border-slate-200'
        )}
      >
        <span className="hidden sm:inline">Berikutnya</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </nav>
  );
}
