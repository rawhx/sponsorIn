import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Pagination({ paginator }) {
  if (!paginator || paginator.last_page <= 1) return null;

  const previous = paginator.links?.[0]?.url;
  const next = paginator.links?.[paginator.links.length - 1]?.url;

  return (
    <nav className="flex items-center justify-between gap-4 border-t border-border pt-4" aria-label="Navigasi halaman">
      <Link
        href={previous ?? '#'}
        preserveScroll
        aria-label="Halaman sebelumnya"
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-border px-3 text-sm',
          previous ? 'bg-surface text-text hover:bg-hover' : 'pointer-events-none text-text-muted opacity-60'
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </Link>
      <p className="text-sm text-text-secondary-strong">
        Halaman {paginator.current_page} dari {paginator.last_page}
      </p>
      <Link
        href={next ?? '#'}
        preserveScroll
        aria-label="Halaman berikutnya"
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-border px-3 text-sm',
          next ? 'bg-surface text-text hover:bg-hover' : 'pointer-events-none text-text-muted opacity-60'
        )}
      >
        <span className="hidden sm:inline">Berikutnya</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </nav>
  );
}
