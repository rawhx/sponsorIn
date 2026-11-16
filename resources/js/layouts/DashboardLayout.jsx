import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { BadgeCheck, Bell, Bookmark, CalendarDays, FileText, Handshake, LayoutDashboard, LogOut, Menu, Search, Star, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import FlashMessages from '../components/FlashMessages';
import ConfirmDialog from '../components/ConfirmDialog';
import Logo from '../components/Logo';

const roleLabels = {
  sponsor: 'Sponsor',
  eo: 'Event Organizer',
  admin: 'Administrator',
  verifier: 'Verifier',
};

function navigationFor(role) {
  const notifications = { label: 'Notifikasi', href: '/notifications', icon: Bell };
  if (role === 'sponsor') {
    return [
      { key: 'dashboard', label: 'Dashboard', href: '/sponsor/dashboard', icon: LayoutDashboard },
      { key: 'proposals-explore', label: 'Jelajahi Peluang', href: '/sponsor/proposals/explore', icon: Search },
      { key: 'shortlist', label: 'Shortlist', href: '/sponsor/shortlist', icon: Bookmark },
      {
        key: 'proposals',
        label: 'Daftar Proposal',
        href: '/sponsor/proposals',
        icon: FileText,
        excludePaths: ['/sponsor/proposals/explore'],
      },
      { key: 'sponsorships', label: 'Manajemen Kerja Sama', href: '/sponsor/sponsorships', icon: Handshake },
      notifications,
    ];
  }
  if (role === 'eo') {
    return [
      { label: 'Dashboard', href: '/eo/dashboard', icon: LayoutDashboard },
      { key: 'events-calendar', label: 'Kalender Event', href: '/eo/events/calendar', icon: CalendarDays },
      { key: 'profile', label: 'Profil Organisasi', href: '/eo/profile', icon: UserRound },
      { label: 'Sponsor Tersedia', href: '/eo/sponsors/available', icon: Search },
      { label: 'Manajemen Proposal', href: '/eo/proposals', icon: FileText },
      { label: 'Manajemen Kerja Sama', href: '/eo/sponsorships', icon: Handshake },
      notifications,
    ];
  }
  return [
    { label: 'Ringkasan', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Verifikasi Sponsor', href: '/admin/verifications', icon: BadgeCheck },
    { label: 'Moderasi Event', href: '/admin/events', icon: CalendarDays },
    { label: 'Moderasi Ulasan', href: '/admin/reviews', icon: Star },
    notifications,
  ];
}

/* ── Sidebar content ── */
function Sidebar({ navigation, auth, role, unreadCount, onClose }) {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const initials = auth?.user?.name
    ? auth.user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="workspace-sidebar flex h-full flex-col bg-white">
      {/* Brand */}
      <div className="workspace-brand flex h-16 items-center border-b border-slate-100 px-6">
        <Logo />
      </div>

      {/* Nav items */}
      <nav className="workspace-nav min-h-0 flex-1 space-y-1 overflow-y-auto p-4" aria-label="Navigasi ruang kerja">
        {navigation.map((item) => {
          const Icon = item.icon;
          const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
          const active =
            (pathname === item.href || pathname.startsWith(`${item.href}/`)) &&
            !item.excludePaths?.some((path) => pathname === path || pathname.startsWith(`${path}/`));

          return (
            <Link
              key={item.key ?? item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-emerald-50 text-emerald-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-600"
                  aria-hidden="true"
                />
              )}
              <Icon
                className={cn(
                  'h-4.5 w-4.5 shrink-0 transition-colors',
                  active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                )}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.href === '/notifications' && unreadCount > 0 ? (
                <span className="workspace-nav-badge inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-semibold tabular-nums text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User profile & logout */}
      <div className="workspace-account border-t border-slate-100 p-4">
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-slate-50 p-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-900">{auth.user.name}</p>
            <p className="truncate text-[11px] font-medium text-slate-500">{roleLabels[role]}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-rose-500" aria-hidden="true" />
          Keluar dari sesi
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
export default function DashboardLayout({ title, eyebrow, description, children, actions }) {
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
    <div className="app-shell min-h-screen bg-slate-50/60 text-slate-800">
      <div className="mx-auto flex min-h-screen w-full max-w-none">

        {/* Desktop sidebar */}
        <aside className="workspace-rail sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <Sidebar navigation={navigation} auth={auth} role={role} unreadCount={unreadCount} onClose={() => {}} />
        </aside>

        {/* Content column */}
        <div className="min-w-0 flex-1 flex flex-col min-h-screen">

          {/* Mobile topbar */}
          <header className="workspace-mobile-header sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:h-16 sm:px-6 lg:hidden">
            <Logo />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              onClick={() => setOpen(true)}
              aria-label="Buka navigasi"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" />
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
                  className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup navigasi"
                />
                <motion.div
                  className="workspace-drawer absolute inset-y-0 left-0 w-72 border-r border-slate-200 bg-white shadow-2xl"
                  initial={{ x: -28, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -28, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    type="button"
                    className="absolute right-3.5 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
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
          <main className="workspace-main flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8">
            <motion.div
              className="workspace-canvas mx-auto w-full max-w-7xl"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Flash messages */}
              <div className="mb-6">
                <FlashMessages />
              </div>

              {/* Page header */}
              {(title || eyebrow || description || actions) && (
                <div className="workspace-page-header mb-8 flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div className="workspace-page-copy min-w-0 max-w-2xl">
                    {eyebrow && (
                      <p className="mb-1.5 text-xs font-semibold tracking-wider text-emerald-700 uppercase">
                        {eyebrow}
                      </p>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 truncate">
                      {title}
                    </h1>
                    {description ? (
                      <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
                        {description}
                      </p>
                    ) : null}
                  </div>
                  {actions && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:self-end">{actions}</div>
                  )}
                </div>
              )}

              {children}
            </motion.div>
          </main>
        </div>

      </div>
    </div>
  );
}
