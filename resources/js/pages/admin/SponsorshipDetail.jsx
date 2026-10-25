import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, Select, Textarea } from '../../components/Form';
import { formatDate, formatDateRange } from '../../lib/utils';

function formatDateTime(value) {
  if (!value) return '—';
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminSponsorshipDetail({ sponsorship, auditLogs }) {
  const s = sponsorship;
  const { data, setData, post, processing, errors } = useForm({ decision: 'completed', note: '' });
  const [confirming, setConfirming] = useState(false);

  function persist() {
    post(`/admin/sponsorships/${s.id}/resolve`, { preserveScroll: true });
  }

  function submit(event) {
    event.preventDefault();
    if (data.decision === 'cancelled') {
      setConfirming(true);
      return;
    }
    persist();
  }

  return (
    <DashboardLayout
      eyebrow="Moderasi"
      title={s.event.title}
      actions={
        <Link href="/admin/sponsorships" className="inline-flex items-center gap-1.5 text-sm text-text-secondary-strong hover:text-text">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke antrean
        </Link>
      }
    >
      <Head title={s.event.title} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="min-w-0 space-y-6">
          <section className="rounded-[12px] border border-border bg-surface">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="text-sm font-medium text-text">{s.sponsor} × {s.eo}</p>
                <p className="mt-1 text-xs text-text-secondary-strong">
                  {formatDateRange(s.event.date_start, s.event.date_end)}{s.event.location ? ` · ${s.event.location}` : ''}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <div className="space-y-5 px-5 py-5">
              <div>
                <h2 className="text-sm font-semibold text-text">Ringkasan kesepakatan</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary-strong">{s.agreed_terms || 'Tidak ada ringkasan tercatat.'}</p>
              </div>
              {s.deliverables ? (
                <div>
                  <h2 className="text-sm font-semibold text-text">Deliverables</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary-strong">{s.deliverables}</p>
                </div>
              ) : null}
              {s.dispute_reason ? (
                <div>
                  <h2 className="text-sm font-semibold text-text">Alasan sengketa</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary-strong">{s.dispute_reason}</p>
                </div>
              ) : null}
              {s.admin_resolution_note ? (
                <div>
                  <h2 className="text-sm font-semibold text-text">Keputusan admin sebelumnya</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary-strong">{s.admin_resolution_note}</p>
                </div>
              ) : null}
            </div>
          </section>

          <section>
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-text">Jejak audit</h2>
            </div>
            {auditLogs.length > 0 ? (
              <div className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <div key={log.id} className="grid gap-1 py-3.5 sm:grid-cols-[1fr_170px] sm:gap-6">
                    <div>
                      <p className="text-sm font-medium text-text">{log.action}</p>
                      <p className="mt-0.5 text-xs text-text-secondary-strong">Oleh {log.actor ?? 'sistem'}</p>
                      {log.reason ? <p className="mt-1 text-xs leading-relaxed text-text-muted">{log.reason}</p> : null}
                    </div>
                    <p className="text-xs tabular-nums text-text-muted sm:text-right">{formatDateTime(log.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-sm text-text-secondary-strong">Belum ada jejak audit.</p>
            )}
          </section>
        </div>

        <aside>
          {s.can_resolve ? (
            <form onSubmit={submit} className="rounded-[12px] border border-border bg-surface">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-text">Keputusan admin</h2>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary-strong">
                  Kedua pihak akan menerima notifikasi. “Selesai” membuka ulasan bagi sponsor.
                </p>
              </div>
              <div className="space-y-5 px-5 py-5">
                <Field label="Keputusan" htmlFor="decision" error={errors.decision} required>
                  <Select id="decision" value={data.decision} onChange={(event) => setData('decision', event.target.value)} error={errors.decision}>
                    <option value="completed">Tetapkan selesai</option>
                    <option value="active">Kembalikan ke aktif (sengketa tidak terbukti)</option>
                    <option value="cancelled">Batalkan kerja sama</option>
                  </Select>
                </Field>
                <Field label="Catatan keputusan" htmlFor="note" error={errors.note} hint="Wajib; tercatat di audit log" required>
                  <Textarea id="note" rows={4} value={data.note} onChange={(event) => setData('note', event.target.value)} error={errors.note} />
                </Field>
                <Button type="submit" className="w-full" variant={data.decision === 'cancelled' ? 'destructive' : 'primary'} loading={processing}>
                  Simpan keputusan
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-[12px] border border-border bg-background-muted p-5">
              <h2 className="text-sm font-semibold text-text">Keputusan admin</h2>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary-strong">
                Sponsorship ini tidak sedang menunggu keputusan admin.
              </p>
            </div>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Batalkan kerja sama ini?"
        description="Status menjadi Dibatalkan dan ulasan tidak akan terbuka. Tindakan ini tercatat pada audit log."
        confirmLabel="Ya, batalkan"
        onConfirm={() => {
          setConfirming(false);
          persist();
        }}
        onCancel={() => setConfirming(false)}
        processing={processing}
      />
    </DashboardLayout>
  );
}
