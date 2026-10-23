import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Button from '../Button';
import StatusBadge from '../StatusBadge';
import { Textarea } from '../Form';
import { formatDate, statusLabel } from '../../lib/utils';

function formatDateTime(value) {
  if (!value) return '—';
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ProposalStatusPanel({ proposal, transitions, basePath, statuses }) {
  const [showReason, setShowReason] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({ status: '', reason: '' });

  if (transitions.length === 0) {
    return (
      <div className="rounded-[12px] border border-border bg-background-muted p-5">
        <h2 className="text-sm font-semibold text-text">Status proposal</h2>
        <div className="mt-3">
          <StatusBadge status={proposal.status} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-text-secondary-strong">
          Tidak ada tindakan yang tersedia untuk Anda pada status ini.
        </p>
      </div>
    );
  }

  function submit(event, status) {
    event.preventDefault();
    if (status === 'rejected' || status === 'withdrawn' || status === 'more_information_requested') {
      if (!showReason) {
        setShowReason(true);
        setData('status', status);
        return;
      }
    }
    setData('status', status);
    post(`${basePath}/${proposal.id}/transition`, { preserveScroll: true, onSuccess: () => reset() });
  }

  return (
    <div className="rounded-[12px] border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-text">Kelola proposal</h2>
      <p className="mt-1.5 text-xs leading-relaxed text-text-secondary-strong">
        Status saat ini: <span className="font-medium text-text">{statusLabel(proposal.status)}</span>.
      </p>
      <div className="mt-4 space-y-3">
        {transitions.map((status) => (
          <div key={status}>
            <Button
              variant={['accepted', 'negotiation', 'under_review'].includes(status) ? 'primary' : status === 'rejected' ? 'destructive' : 'outline'}
              className="w-full"
              disabled={processing}
              onClick={(event) => submit(event, status)}
            >
              {actionLabel(status)}
            </Button>
            {(status === 'rejected' || status === 'withdrawn' || status === 'more_information_requested') && showReason && data.status === status ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  rows={3}
                  value={data.reason}
                  onChange={(event) => setData('reason', event.target.value)}
                  placeholder={status === 'rejected' ? 'Alasan singkat penolakan.' : status === 'withdrawn' ? 'Alasan menarik proposal.' : 'Informasi apa yang dibutuhkan.'}
                  error={errors.reason}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={processing}
                  onClick={(event) => {
                    event.preventDefault();
                    post(`${basePath}/${proposal.id}/transition`, { preserveScroll: true, onSuccess: () => { reset(); setShowReason(false); } });
                  }}
                >
                  {processing ? 'Mengirim…' : 'Kirim dengan catatan'}
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {errors.status ? <p className="mt-3 text-xs text-danger-strong">{errors.status}</p> : null}
    </div>
  );
}

function actionLabel(status) {
  return {
    under_review: 'Tandai sedang ditinjau',
    more_information_requested: 'Minta informasi tambahan',
    negotiation: 'Masuk negosiasi',
    accepted: 'Terima proposal',
    rejected: 'Tolak proposal',
    withdrawn: 'Tarik proposal',
  }[status] ?? statusLabel(status);
}

export function ProposalThread({ proposal, basePath }) {
  const { data, setData, post, processing, errors, reset } = useForm({ body: '' });

  function submit(event) {
    event.preventDefault();
    post(`${basePath}/${proposal.id}/messages`, {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  }

  return (
    <section className="rounded-[12px] border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-text">Percakapan</h2>
        <p className="mt-1 text-xs text-text-secondary-strong">Hanya pihak proposal yang dapat melihat dan mengirim pesan.</p>
      </div>

      {proposal.messages.length > 0 ? (
        <div className="divide-y divide-border">
          {proposal.messages.map((message) => {
            const mine = message.sender_user_id === proposal.viewerUserId;
            return (
              <div key={message.id} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm font-medium text-text">{message.sender_name}</p>
                  <p className="text-xs tabular-nums text-text-muted">{formatDateTime(message.created_at)}</p>
                </div>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-text-secondary-strong">{message.body}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-5 py-6 text-sm text-text-secondary-strong">Belum ada pesan. Mulai percakapan untuk membahas rincian kerja sama.</p>
      )}

      <form onSubmit={submit} className="space-y-3 border-t border-border px-5 py-4">
        <Textarea
          rows={3}
          value={data.body}
          onChange={(event) => setData('body', event.target.value)}
          placeholder="Tulis pesan…"
          error={errors.body}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={processing}>{processing ? 'Mengirim…' : 'Kirim pesan'}</Button>
        </div>
      </form>
    </section>
  );
}

export function ProposalHeader({ proposal, counterpartRoleLabel }) {
  return (
    <div className="rounded-[12px] border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-text-muted">{counterpartRoleLabel}</p>
          <p className="mt-0.5 text-sm font-medium text-text">{proposal.direction === 'incoming' ? proposal.sender : proposal.recipient}</p>
        </div>
        <StatusBadge status={proposal.status} />
      </div>
      <dl className="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-text-muted">Event</dt>
          <dd className="mt-0.5 text-text">
            <Link href={`/events/${proposal.event.slug}`} className="hover:text-primary-strong">{proposal.event.title}</Link>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Paket</dt>
          <dd className="mt-0.5 text-text-secondary-strong">{proposal.package?.name ?? 'Tanpa paket tertentu'}</dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Berlaku sampai</dt>
          <dd className="mt-0.5 text-text-secondary-strong">{proposal.valid_until ? formatDate(proposal.valid_until) : 'Tidak ditentukan'}</dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Pembaruan terakhir</dt>
          <dd className="mt-0.5 text-text-secondary-strong">{formatDateTime(proposal.last_status_at)}</dd>
        </div>
      </dl>
    </div>
  );
}
