import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import Button from '../Button';
import StatusBadge from '../StatusBadge';
import { Textarea } from '../Form';
import { formatDate, statusLabel, cn } from '../../lib/utils';

function formatDateTime(value) {
  if (!value) return '—';
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ProposalStatusPanel({ proposal, transitions, basePath, statuses }) {
  const [showReason, setShowReason] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({ status: '', reason: '' });

  if (transitions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900">Status Proposal</h2>
        <div className="mt-3">
          <StatusBadge status={proposal.status} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Tidak ada tindakan lanjutan yang tersedia untuk peran Anda pada status ini.
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <h2 className="text-sm font-bold text-slate-900">Kelola Status Proposal</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Status saat ini: <span className="font-semibold text-slate-800">{statusLabel(proposal.status)}</span>
      </p>
      <div className="mt-4 space-y-2.5">
        {transitions.map((status) => (
          <div key={status}>
            <Button
              variant={['accepted', 'negotiation', 'under_review'].includes(status) ? 'primary' : status === 'rejected' ? 'destructive' : 'outline'}
              className="w-full text-xs sm:text-sm"
              disabled={processing}
              onClick={(event) => submit(event, status)}
            >
              {actionLabel(status)}
            </Button>
            {(status === 'rejected' || status === 'withdrawn' || status === 'more_information_requested') && showReason && data.status === status ? (
              <div className="mt-2.5 space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-200">
                <Textarea
                  rows={3}
                  value={data.reason}
                  onChange={(event) => setData('reason', event.target.value)}
                  placeholder={status === 'rejected' ? 'Alasan penolakan proposal...' : status === 'withdrawn' ? 'Alasan penarikan proposal...' : 'Rincian informasi tambahan yang dibutuhkan...'}
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
                  {processing ? 'Mengirim…' : 'Kirim Catatan'}
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {errors.status ? <p className="mt-3 text-xs font-medium text-rose-600">{errors.status}</p> : null}
    </div>
  );
}

function actionLabel(status) {
  return {
    under_review: 'Tandai Sedang Ditinjau',
    more_information_requested: 'Minta Informasi Tambahan',
    negotiation: 'Lanjutkan ke Negosiasi',
    accepted: 'Setujui Proposal',
    rejected: 'Tolak Proposal',
    withdrawn: 'Tarik Proposal',
  }[status] ?? statusLabel(status);
}

export function ProposalThread({ proposal, basePath }) {
  const { data, setData, post, processing, errors, reset } = useForm({ body: '' });

  function submit(event) {
    event.preventDefault();
    if (!data.body.trim()) return;
    post(`${basePath}/${proposal.id}/messages`, {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <MessageSquare className="h-4.5 w-4.5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Diskusi & Negosiasi Proposal</h2>
          <p className="text-xs text-slate-500">Hanya pihak yang terlibat langsung yang dapat membaca dan membalas.</p>
        </div>
      </div>

      <div className="max-h-[460px] overflow-y-auto p-5 space-y-4 bg-slate-50/30">
        {proposal.messages.length > 0 ? (
          proposal.messages.map((message) => {
            const mine = message.sender_user_id === proposal.viewerUserId;
            return (
              <div
                key={message.id}
                className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-xs font-semibold text-slate-700">
                    {mine ? 'Anda' : message.sender_name}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {formatDateTime(message.created_at)}
                  </span>
                </div>
                <div
                  className={cn(
                    'max-w-md rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-2xs whitespace-pre-line',
                    mine
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  )}
                >
                  {message.body}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">Belum ada percakapan. Tuliskan pesan untuk memulai negosiasi.</p>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-slate-100 bg-white p-4 space-y-3">
        <Textarea
          rows={3}
          value={data.body}
          onChange={(event) => setData('body', event.target.value)}
          placeholder="Tulis pesan negosiasi atau pertanyaan seputar proposal..."
          error={errors.body}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={processing || !data.body.trim()}>
            <Send className="h-3.5 w-3.5" />
            {processing ? 'Mengirim…' : 'Kirim Pesan'}
          </Button>
        </div>
      </form>
    </section>
  );
}

export function ProposalHeader({ proposal, counterpartRoleLabel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{counterpartRoleLabel}</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{proposal.direction === 'incoming' ? proposal.sender : proposal.recipient}</p>
        </div>
        <StatusBadge status={proposal.status} />
      </div>
      <dl className="mt-4 grid gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs font-medium text-slate-400">Event Terkait</dt>
          <dd className="mt-1 font-semibold text-slate-900 truncate">
            <Link href={`/events/${proposal.event.slug}`} className="hover:text-emerald-700 transition-colors">
              {proposal.event.title}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-400">Paket Dukungan</dt>
          <dd className="mt-1 font-medium text-slate-700">{proposal.package?.name ?? 'Tanpa paket khusus'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-400">Masa Berlaku</dt>
          <dd className="mt-1 font-medium text-slate-700">{proposal.valid_until ? formatDate(proposal.valid_until) : 'Tidak ada batas'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-400">Pembaruan Terakhir</dt>
          <dd className="mt-1 font-medium text-slate-700 tabular-nums">{formatDateTime(proposal.last_status_at)}</dd>
        </div>
      </dl>
    </div>
  );
}
