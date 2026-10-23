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
      eyebrow="Kotak masuk"
      title="Notifikasi"
      actions={
        unreadCount > 0 ? (
          <Button variant="outline" onClick={markAll} disabled={processing}>
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Tandai semua dibaca
          </Button>
        ) : null
      }
    >
      <Head title="Notifikasi" />

      {notifications.data.length > 0 ? (
        <>
          <div className="divide-y divide-border border-y border-border">
            {notifications.data.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => open(notification)}
                className={cn(
                  'group flex w-full items-start gap-4 px-1 py-4 text-left transition-colors hover:bg-hover',
                  notification.read ? '' : 'bg-primary/[0.03]'
                )}
              >
                <span className={cn('mt-0.5 shrink-0', notification.read ? 'text-text-muted' : 'text-primary-strong')}>
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-4">
                    <span className={cn('text-sm', notification.read ? 'text-text-secondary-strong' : 'font-medium text-text')}>
                      {notification.title}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-text-muted">{formatDateTime(notification.created_at)}</span>
                  </span>
                  {notification.body ? (
                    <span className="mt-1 block text-sm leading-relaxed text-text-secondary-strong">{notification.body}</span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-5">
            <Pagination paginator={notifications} />
          </div>
        </>
      ) : (
        <EmptyState
          illustration="bell"
          title="Belum ada notifikasi"
          description="Pembaruan penting seputar verifikasi, moderasi event, dan proposal akan muncul di sini."
        />
      )}
    </DashboardLayout>
  );
}
