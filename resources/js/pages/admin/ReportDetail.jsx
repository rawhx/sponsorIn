import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, Select, Textarea } from '../../components/Form';
import { formatDate, reportTargetLabels } from '../../lib/utils';

function formatDateTime(value) {
  if (!value) return '—';
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminReportDetail({ report, auditLogs }) {
  const { data, setData, put, processing, errors } = useForm({
    status: report.status === 'open' ? 'in_review' : 'resolved',
    resolution: '',
    suspend_account: false,
  });
  const [confirming, setConfirming] = useState(false);
  const target = report.target;
  const needsResolution = ['resolved', 'dismissed'].includes(data.status);
  const willSuspend = data.suspend_account && data.status === 'resolved';

  function persist() {
    put(`/admin/reports/${report.id}`, { preserveScroll: true });
  }

  function submit(event) {
    event.preventDefault();
    if (willSuspend) {
      setConfirming(true);
      return;
    }
    persist();
  }

  return (
    <DashboardLayout
      eyebrow="Moderasi"
      title={`Laporan ${reportTargetLabels[report.target_type].toLowerCase()}`}
      actions={
        <Link href="/admin/reports" className="inline-flex items-center gap-1.5 text-sm text-text-secondary-strong hover:text-text">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke laporan
        </Link>
      }
    >
      <Head title="Detail laporan" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="min-w-0 space-y-6">
          <section className="rounded-[12px] border border-border bg-surface">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="text-sm font-medium text-text">{report.reason}</p>
                <p className="mt-1 text-xs text-text-secondary-strong">
                  Dilaporkan oleh {report.reporter} · {formatDateTime(report.created_at)}
                </p>
              </div>
              <StatusBadge status={report.status} />
            </div>
            <div className="space-y-5 px-5 py-5">
              <div>
                <h2 className="text-sm font-semibold text-text">Konteks dari pelapor</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary-strong">{report.details || 'Pelapor tidak menambahkan konteks.'}</p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text">Target laporan</h2>
                {target ? (
                  <div className="mt-2 rounded-[8px] border border-border bg-background-muted px-4 py-3">
                    <p className="text-xs text-text-muted">{target.kind}</p>
                    <p className="mt-0.5 text-sm font-medium text-text">{target.title}</p>
                    <p className="mt-1 text-xs text-text-secondary-strong">{target.subtitle}</p>
                    {target.excerpt ? <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary-strong">“{target.excerpt}”</p> : null}
                    {target.url ? (
                      <Link href={target.url} className="mt-3 inline-block text-sm font-medium text-primary-strong hover:text-text">
                        {target.action_label}
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-text-secondary-strong">Target laporan sudah tidak tersedia.</p>
                )}
              </div>
              {report.resolution ? (
                <div>
                  <h2 className="text-sm font-semibold text-text">Hasil tindak lanjut</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary-strong">{report.resolution}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {report.assigned_admin ? `Oleh ${report.assigned_admin} · ` : ''}
                    {formatDateTime(report.resolved_at)}
                  </p>
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
          {report.is_final ? (
            <div className="rounded-[12px] border border-border bg-background-muted p-5">
              <h2 className="text-sm font-semibold text-text">Tindak lanjut</h2>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary-strong">Laporan ini sudah ditutup dan tidak dapat diubah.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-[12px] border border-border bg-surface">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-text">Tindak lanjut</h2>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary-strong">
                  Tindakan terhadap konten dilakukan di halaman moderasi terkait; catat hasilnya di sini.
                </p>
              </div>
              <div className="space-y-5 px-5 py-5">
                <Field label="Status" htmlFor="status" error={errors.status} required>
                  <Select id="status" value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status}>
                    {report.status === 'open' ? <option value="in_review">Mulai tinjau</option> : null}
                    <option value="resolved">Selesai ditangani</option>
                    <option value="dismissed">Tolak laporan</option>
                  </Select>
                </Field>
                <Field
                  label="Catatan hasil"
                  htmlFor="resolution"
                  error={errors.resolution}
                  hint={needsResolution ? 'Wajib' : 'Opsional'}
                  required={needsResolution}
                >
                  <Textarea id="resolution" rows={4} value={data.resolution} onChange={(event) => setData('resolution', event.target.value)} error={errors.resolution} />
                </Field>
                {target?.can_suspend && data.status === 'resolved' ? (
                  <label className="flex items-start gap-2 text-sm text-text-secondary-strong">
                    <input
                      type="checkbox"
                      checked={data.suspend_account}
                      onChange={(event) => setData('suspend_account', event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border"
                    />
                    <span>Tangguhkan akun yang dilaporkan (akses ditutup, tercatat di audit log)</span>
                  </label>
                ) : null}
                <Button type="submit" className="w-full" variant={willSuspend ? 'destructive' : 'primary'} loading={processing}>
                  Simpan tindak lanjut
                </Button>
              </div>
            </form>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Tangguhkan akun ini?"
        description="Pengguna tidak dapat lagi mengakses ruang kerjanya. Tindakan ini tercatat pada audit log."
        confirmLabel="Ya, tangguhkan"
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
