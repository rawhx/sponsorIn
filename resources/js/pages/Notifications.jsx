import { Head, router, useForm } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { cn, formatDate } from '../lib/utils';

function formatDateTime(value) {
  if (!value) return '—';
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Notifications({ notifications, unreadCount }) {
  const { post, processing } = useForm({});

  function open(notification) {
    router.post(`/notifications/${notification.id}/read`);
  }

  function markAll() {
    post('/notifications/read-all', { preserveScroll: true });
  }

  return (
    <DashboardLayout
      eyebrow="Pusat Pemberitahuan"
      title="Notifikasi"
      actions={
        unreadCount > 0 ? (
          <Button variant="outline" size="sm" onClick={markAll} disabled={processing}>
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Tandai Semua Dibaca
          </Button>
        ) : null
      }
    >
      <Head title="Pusat Notifikasi" />

      {notifications.data.length > 0 ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100">
            {notifications.data.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => open(notification)}
                className={cn(
                  'group flex w-full items-start gap-4 p-4 sm:p-5 text-left transition-colors hover:bg-slate-50 cursor-pointer',
                  notification.read ? 'bg-white opacity-85' : 'bg-emerald-50/30'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                    notification.read ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-700'
                  )}
                >
                  <Bell className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-4">
                    <span className={cn('text-sm', notification.read ? 'font-medium text-slate-700' : 'font-bold text-slate-900')}>
                      {notification.title}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-slate-400">{formatDateTime(notification.created_at)}</span>
                  </span>
                  {notification.body ? (
                    <span className="mt-1 block text-xs sm:text-sm leading-relaxed text-slate-600">{notification.body}</span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
          <Pagination paginator={notifications} />
        </div>
      ) : (
        <EmptyState
          illustration="bell"
          title="Belum ada notifikasi"
          description="Pembaruan penting seputar verifikasi legalitas, moderasi event, dan status proposal akan muncul di sini."
        />
      )}
    </DashboardLayout>
  );
}
