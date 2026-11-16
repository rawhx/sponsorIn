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
  { label: 'Jelajahi Event', href: '/events' },
  { label: 'Penyelenggara', href: '/organizers' },
];

export default function PublicLayout({ children }) {
  const { auth } = usePage().props;
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigasi utama">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 no-underline transition-colors hover:text-emerald-700"
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
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 no-underline transition-colors hover:text-slate-900"
                >
                  Masuk
                </Link>
                <Link href="/register" className={buttonClasses({ size: 'sm' })}>
                  Mulai Sekarang
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 lg:hidden"
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
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-slate-200 bg-white px-5 shadow-lg lg:hidden"
            >
              <div className="py-4">
                <nav className="flex flex-col gap-1" aria-label="Navigasi seluler">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-700"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  {auth?.user ? (
                    <Link
                      href="/dashboard"
                      className={buttonClasses({ size: 'sm', className: 'flex-1' })}
                    >
                      Buka Ruang Kerja
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
      <footer className="mt-20 border-t border-slate-200 bg-slate-50/50">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto]">
          {/* Brand */}
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Platform sponsorship terstruktur yang menempatkan bukti audiens, kesepakatan tertulis, dan jejak kerja sama dalam satu tempat terpadu.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-12 text-sm">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Navigasi</p>
              <div className="space-y-2">
                <Link href="/#cara-kerja" className="block text-slate-600 transition-colors hover:text-emerald-700">
                  Cara Kerja
                </Link>
                <Link href="/#untuk-eo" className="block text-slate-600 transition-colors hover:text-emerald-700">
                  Untuk EO
                </Link>
                <Link href="/#untuk-sponsor" className="block text-slate-600 transition-colors hover:text-emerald-700">
                  Untuk Sponsor
                </Link>
                <Link href="/events" className="block text-slate-600 transition-colors hover:text-emerald-700">
                  Jelajahi Event
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Akun & Akses</p>
              <div className="space-y-2">
                <Link href="/login" className="block text-slate-600 transition-colors hover:text-emerald-700">
                  Masuk Akun
                </Link>
                <Link href="/register" className="block text-slate-600 transition-colors hover:text-emerald-700">
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200/80">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:px-8">
            <p>© {new Date().getFullYear()} SponsorIn. Hak cipta dilindungi.</p>
            <p>Platform kolaborasi sponsorship untuk brand dan penyelenggara event</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
