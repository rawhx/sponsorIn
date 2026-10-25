import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { BadgeCheck, Bell, Bookmark, CalendarDays, Compass, FileText, Handshake, LayoutDashboard, LogOut, Menu, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import FlashMessages from '../components/FlashMessages';
import ConfirmDialog from '../components/ConfirmDialog';
import Logo from '../components/Logo';

const roleLabels = {
  sponsor: 'Sponsor',
  eo: 'Event organizer',
  admin: 'Admin',
  verifier: 'Verifier',
};

function navigationFor(role) {
  const notifications = { label: 'Notifikasi', href: '/notifications', icon: Bell };
  if (role === 'sponsor') {
    return [
      { label: 'Ringkasan', href: '/sponsor/dashboard', icon: LayoutDashboard },
      { label: 'Verifikasi usaha', href: '/sponsor/verification', icon: BadgeCheck },
      { label: 'Shortlist', href: '/sponsor/shortlist', icon: Bookmark },
      { label: 'Proposal', href: '/sponsor/proposals', icon: FileText },
      { label: 'Kerja Sama', href: '/sponsor/sponsorships', icon: Handshake },
      { label: 'Jelajahi peluang', href: '/events', icon: Compass },
      notifications,
    ];
  }
  if (role === 'eo') {
    return [
      { label: 'Ringkasan', href: '/eo/dashboard', icon: LayoutDashboard },
      { label: 'Event saya', href: '/eo/events', icon: CalendarDays },
      { label: 'Proposal', href: '/eo/proposals', icon: FileText },
      { label: 'Kerja Sama', href: '/eo/sponsorships', icon: Handshake },
      { label: 'Peluang publik', href: '/events', icon: Compass },
      notifications,
    ];
  }
  return [
    { label: 'Ringkasan', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Verifikasi sponsor', href: '/admin/verifications', icon: BadgeCheck },
    { label: 'Moderasi event', href: '/admin/events', icon: CalendarDays },
    { label: 'Sponsorship', href: '/admin/sponsorships', icon: Handshake },
    { label: 'Moderasi ulasan', href: '/admin/reviews', icon: Star },
    notifications,
  ];
}

/* ── Sidebar content ── */
function Sidebar({ navigation, auth, role, unreadCount, onClose }) {
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-5 py-5">
        <Logo />
      </div>

      {/* Nav */}
      <nav className="mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 pb-2" aria-label="Navigasi ruang kerja">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            typeof window !== 'undefined' && window.location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group relative flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] transition-colors duration-150',
                active
                  ? 'bg-hover font-medium text-text'
                  : 'text-text-secondary-strong hover:bg-hover hover:text-text'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <span
                className={cn(
                  'absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-primary-strong transition-opacity duration-150',
                  active ? 'opacity-100' : 'opacity-0'
                )}
                aria-hidden="true"
              />
              <Icon
                className={cn('h-4 w-4 shrink-0 transition-colors', active ? 'text-primary-strong' : 'text-text-muted group-hover:text-text-secondary-strong')}
                aria-hidden="true"
              />
              <span className="flex-1">{item.label}</span>
              {item.href === '/notifications' && unreadCount > 0 ? (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-strong px-1.5 text-[11px] font-medium tabular-nums text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="space-y-0.5 border-t border-border p-3">
        <div className="rounded-[8px] px-3 py-2.5">
          <p className="truncate text-[13px] font-medium text-text">{auth.user.name}</p>
          <p className="mt-0.5 text-[11px] text-text-muted">{roleLabels[role]}</p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2 text-[13px] text-text-secondary-strong transition-colors hover:bg-danger/10 hover:text-danger-strong"
        >
          <LogOut className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
          Keluar
        </button>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Keluar dari SponsorIn?"
        description="Anda akan keluar dari sesi ini dan perlu masuk kembali untuk melanjutkan."
        confirmLabel="Ya, keluar"
        onConfirm={() => {
          setConfirmLogout(false);
          onClose?.();
          router.post('/logout');
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}

/* ── Main layout ── */
export default function DashboardLayout({ title, eyebrow, children, actions }) {
  const { auth, unreadNotifications } = usePage().props;
  const [open, setOpen] = useState(false);
  const role = auth.user.role;
  const navigation = navigationFor(role);
  const unreadCount = unreadNotifications ?? 0;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1440px]">

        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[228px] shrink-0 border-r border-border bg-background lg:block">
          <Sidebar navigation={navigation} auth={auth} role={role} unreadCount={unreadCount} onClose={() => {}} />
        </aside>

        {/* Content column */}
        <div className="min-w-0 flex-1">

          {/* Mobile topbar */}
          <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-sm sm:px-5 lg:hidden">
            <Logo />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-border text-text-secondary transition-colors hover:bg-hover hover:text-text"
              onClick={() => setOpen(true)}
              aria-label="Buka navigasi"
              aria-expanded={open}
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
          </header>

          {/* Mobile drawer */}
          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-0 z-40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <button
                  type="button"
                  className="absolute inset-0 bg-text/20 backdrop-blur-[2px]"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup navigasi"
                />
                <motion.div
                  className="absolute inset-y-0 left-0 w-[272px] border-r border-border bg-background shadow-[0_20px_60px_-30px_rgba(52,59,50,0.5)]"
                  initial={{ x: -24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -24, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    type="button"
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-border text-text-secondary hover:bg-hover"
                    onClick={() => setOpen(false)}
                    aria-label="Tutup navigasi"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Sidebar
                    navigation={navigation}
                    auth={auth}
                    role={role}
                    unreadCount={unreadCount}
                    onClose={() => setOpen(false)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main content */}
          <main className="px-4 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
            <motion.div
              className="mx-auto w-full max-w-5xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Flash messages */}
              <div className="mb-6">
                <FlashMessages />
              </div>

              {/* Page header */}
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  {eyebrow && (
                    <p className="mb-2 text-[11px] font-semibold tracking-[0.1em] text-text-muted uppercase">
                      {eyebrow}
                    </p>
                  )}
                  <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-tight tracking-[-0.025em] text-text">
                    {title}
                  </h1>
                </div>
                {actions && (
                  <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
                )}
              </div>

              {children}
            </motion.div>
          </main>
        </div>

      </div>
    </div>
  );
}
