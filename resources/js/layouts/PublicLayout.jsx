import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Logo from '../components/Logo';
import { buttonClasses } from '../components/Button';

const navItems = [
  { label: 'Cara Kerja', href: '/#cara-kerja' },
  { label: 'Untuk EO', href: '/#untuk-eo' },
  { label: 'Untuk Sponsor', href: '/#untuk-sponsor' },
  { label: 'Event', href: '/events' },
];

export default function PublicLayout({ children }) {
  const { auth } = usePage().props;
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigasi utama">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-text-secondary no-underline hover:text-text"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden items-center gap-3 lg:flex">
            {auth?.user ? (
              <Link href="/dashboard" className={buttonClasses({ size: 'sm' })}>
                Ruang Kerja
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-text-secondary no-underline hover:text-text"
                >
                  Masuk
                </Link>
                <Link href="/register" className={buttonClasses({ size: 'sm' })}>
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-border text-text-secondary transition-colors hover:bg-hover hover:text-text lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-surface px-5 lg:hidden"
          >
            <div className="py-4">
            <nav className="flex flex-col gap-0.5" aria-label="Navigasi seluler">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-[8px] px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-hover hover:text-text"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex items-center gap-2.5 border-t border-border pt-4">
            {auth?.user ? (
              <Link
                href="/dashboard"
                className={buttonClasses({ size: 'sm', className: 'flex-1' })}
              >
                Ruang Kerja
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonClasses({ size: 'sm', variant: 'outline', className: 'flex-1' })}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className={buttonClasses({ size: 'sm', className: 'flex-1' })}
                >
                  Daftar
                </Link>
              </>
            )}
            </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main ── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer className="mt-24 border-t border-border">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto]">
          {/* Brand */}
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Ruang kerja sponsorship yang menempatkan bukti, persetujuan, dan jejak kerja sama di depan.
            </p>
          </div>

          {/* Links */}
            <div className="flex gap-12 text-sm">
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-[0.08em] text-text-muted uppercase">Navigasi</p>
                <div className="space-y-2">
                  <Link href="/#cara-kerja" className="block text-text-secondary transition-colors hover:text-text">
                    Cara Kerja
                  </Link>
                  <Link href="/#untuk-eo" className="block text-text-secondary transition-colors hover:text-text">
                    Untuk EO
                  </Link>
                  <Link href="/#untuk-sponsor" className="block text-text-secondary transition-colors hover:text-text">
                    Untuk Sponsor
                  </Link>
                  <Link href="/events" className="block text-text-secondary transition-colors hover:text-text">
                    Event
                  </Link>
                </div>
              </div>
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-[0.07em] text-text-muted uppercase">Akun</p>
              <div className="space-y-2">
                <Link href="/login" className="block text-text-secondary transition-colors hover:text-text">
                  Masuk
                </Link>
                <Link href="/register" className="block text-text-secondary transition-colors hover:text-text">
                  Daftar
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 text-xs text-text-muted sm:px-8">
            <p>SponsorIn</p>
            <p>Platform kolaborasi sponsorship untuk brand dan penyelenggara event</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
