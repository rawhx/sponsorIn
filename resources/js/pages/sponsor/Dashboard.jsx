import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Compass, FileCheck2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { formatDate, proposalPreferenceLabels } from '../../lib/utils';

export default function SponsorDashboard({ organization, verification, canUseFeatures }) {
  const status = verification.status;
  const needsVerification = !canUseFeatures;

  return (
    <DashboardLayout
      eyebrow={organization?.name ?? 'Akun sponsor'}
      title="Ringkasan sponsor"
      actions={
        <Link href="/events" className={buttonClasses({ variant: 'outline' })}>
          <Compass className="h-4 w-4" aria-hidden="true" />
          Jelajahi peluang
        </Link>
      }
    >
      <Head title="Ringkasan sponsor" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="rounded-[12px] border border-border bg-surface">
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-xs font-medium tracking-[0.06em] text-text-muted">STATUS VERIFIKASI USAHA</p>
              <h2 className="mt-1.5 text-lg font-semibold text-text">Akses fitur sponsor</h2>
            </div>
            <StatusBadge status={status} />
          </div>
          <div className="px-5 py-5">
            {needsVerification ? (
              <>
                <p className="text-sm leading-relaxed text-text-secondary-strong">
                  {status === 'draft' && 'Lengkapi data usaha dan unggah dokumen pendukung. Fitur shortlist, minat, dan proposal aktif setelah verifikasi disetujui.'}
                  {status === 'submitted' && 'Pengajuan Anda sudah dikirim dan menunggu peninjauan. Anda masih dapat menjelajahi peluang publik.'}
                  {status === 'under_review' && 'Pengajuan sedang ditinjau. Kami akan mengirim pemberitahuan setelah keputusan tersedia.'}
                  {status === 'needs_information' && 'Admin membutuhkan informasi tambahan. Periksa alasan di bawah, perbarui data, lalu kirim ulang.'}
                  {status === 'rejected' && 'Pengajuan belum disetujui. Anda dapat memperbaiki data dan mengirim ulang pengajuan.'}
                </p>
                {verification.decision_reason_public ? (
                  <div className="mt-4 rounded-[8px] border border-border bg-background-muted px-4 py-3">
                    <p className="text-xs font-medium text-text-muted">CATATAN REVIEW</p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{verification.decision_reason_public}</p>
                  </div>
                ) : null}
                <div className="mt-5">
                  <Link href="/sponsor/verification" className={buttonClasses()}>
                    {status === 'draft' ? 'Lengkapi verifikasi' : 'Buka halaman verifikasi'}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-text-secondary-strong">
                  Verifikasi usaha telah disetujui. Anda dapat menyimpan shortlist, mengirim minat, mengelola proposal, dan mencatat kerja sama.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/events" className={buttonClasses({ size: 'sm' })}>Cari event</Link>
                  <Link href="/sponsor/verification" className={buttonClasses({ size: 'sm', variant: 'outline' })}>
                    Lihat data verifikasi
                  </Link>
                </div>
              </>
            )}
            <dl className="mt-6 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-text-muted">Diajukan</dt>
                <dd className="mt-0.5 text-text-secondary-strong">{verification.submitted_at ? formatDate(verification.submitted_at, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum dikirim'}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Ditinjau</dt>
                <dd className="mt-0.5 text-text-secondary-strong">{verification.reviewed_at ? formatDate(verification.reviewed_at, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum ditinjau'}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="rounded-[12px] border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <p className="text-xs font-medium tracking-[0.06em] text-text-muted">PROFIL USAHA</p>
            <h2 className="mt-1.5 text-lg font-semibold text-text">{organization?.name ?? 'Belum diisi'}</h2>
          </div>
          <dl className="divide-y divide-border">
            <div className="px-5 py-3.5">
              <dt className="text-xs text-text-muted">Lokasi</dt>
              <dd className="mt-0.5 text-sm text-text-secondary-strong">{organization?.location ?? 'Belum diisi'}</dd>
            </div>
            <div className="px-5 py-3.5">
              <dt className="text-xs text-text-muted">Preferensi proposal</dt>
              <dd className="mt-0.5 text-sm text-text-secondary-strong">
                {proposalPreferenceLabels[organization?.proposal_preference] ?? 'Menerima proposal'}
              </dd>
            </div>
            <div className="px-5 py-3.5">
              <dt className="text-xs text-text-muted">Akses fitur</dt>
              <dd className="mt-0.5 flex items-center gap-2 text-sm text-text-secondary-strong">
                {canUseFeatures ? (
                  <>
                    <BadgeCheck className="h-4 w-4 text-success-strong" aria-hidden="true" />
                    Aktif
                  </>
                ) : (
                  'Menunggu verifikasi'
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-text">Yang membentuk berkas sponsor</h2>
        <div className="mt-3 divide-y divide-border border-y border-border">
          <div className="grid gap-2 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-primary-strong" aria-hidden="true" />
              <p className="text-sm font-medium text-text">Identitas usaha</p>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary-strong">
              Nama badan usaha, bentuk hukum, NIB, dan NPWP disimpan terenkripsi. Hanya admin dan verifier yang dapat membuka dokumen pendukung.
            </p>
          </div>
          <div className="grid gap-2 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-primary-strong" aria-hidden="true" />
              <p className="text-sm font-medium text-text">Status yang dapat dibaca</p>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary-strong">
              Draft, diajukan, sedang ditinjau, perlu informasi, disetujui, atau ditolak. Setiap keputusan menyertakan alasan yang dapat dibaca pemilik akun.
            </p>
          </div>
          <div className="grid gap-2 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary-strong" aria-hidden="true" />
              <p className="text-sm font-medium text-text">Ruang kerja terbatas</p>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary-strong">
              Selama verifikasi belum disetujui, Anda tetap dapat menjelajahi event publik namun belum dapat menyimpan shortlist atau mengirim proposal.
            </p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
