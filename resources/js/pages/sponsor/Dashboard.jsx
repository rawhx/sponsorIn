import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, FileCheck2, FileText, Handshake, Search } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { formatDate, proposalPreferenceLabels } from '../../lib/utils';


export default function SponsorDashboard({ organization, verification, canUseFeatures, stats = {} }) {
  const status = verification.status;
  const needsVerification = !canUseFeatures;

  return (
    <DashboardLayout
      eyebrow={organization?.name ?? 'Akun sponsor'}
      title="Dashboard Sponsor"
      actions={
        <Link href="/sponsor/proposals" className={buttonClasses({ variant: 'outline' })}>
          <Search className="h-4 w-4" aria-hidden="true" />
          Peluang Sponsorship
        </Link>
      }
    >
      <Head title="Dashboard Sponsor" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <section className="rounded-[12px] border border-border bg-surface p-5">
          <p className="text-xs font-medium tracking-[0.06em] text-text-muted">PROPOSAL MASUK</p>
          <p className="mt-2 text-2xl font-semibold text-text tabular-nums">{stats.proposal_incoming ?? 0}</p>
          <p className="mt-1 text-xs text-text-muted">Total proposal dari EO</p>
        </section>
        <section className="rounded-[12px] border border-border bg-surface p-5">
          <p className="text-xs font-medium tracking-[0.06em] text-text-muted">PROPOSAL AKTIF</p>
          <p className="mt-2 text-2xl font-semibold text-text tabular-nums">{stats.proposal_active ?? 0}</p>
          <p className="mt-1 text-xs text-text-muted">Dalam proses / negosiasi</p>
        </section>
        <section className="rounded-[12px] border border-border bg-surface p-5">
          <p className="text-xs font-medium tracking-[0.06em] text-text-muted">KERJA SAMA AKTIF</p>
          <p className="mt-2 text-2xl font-semibold text-text tabular-nums">{stats.sponsorship_active ?? 0}</p>
          <p className="mt-1 text-xs text-text-muted">Sedang berjalan</p>
        </section>
        <section className="rounded-[12px] border border-border bg-surface p-5">
          <p className="text-xs font-medium tracking-[0.06em] text-text-muted">TOTAL KERJA SAMA</p>
          <p className="mt-2 text-2xl font-semibold text-text tabular-nums">{stats.sponsorship_total ?? 0}</p>
          <p className="mt-1 text-xs text-text-muted">Riwayat keseluruhan</p>
        </section>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
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
                  {status === 'draft' && 'Lengkapi data usaha dan unggah dokumen pendukung untuk mengakses fitur sponsor.'}
                  {status === 'submitted' && 'Pengajuan Anda sudah dikirim dan menunggu peninjauan.'}
                  {status === 'under_review' && 'Pengajuan sedang ditinjau.'}
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
                  Verifikasi usaha telah disetujui. Anda bisa melihat proposal dari EO, merespons, negosiasi, dan mengelola kerja sama.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/sponsor/proposals" className={buttonClasses({ size: 'sm' })}><Search className="h-4 w-4" />Peluang Sponsorship</Link>
                  <Link href="/sponsor/proposals" className={buttonClasses({ size: 'sm', variant: 'outline' })}><FileText className="h-4 w-4" />Daftar Proposal</Link>
                  <Link href="/sponsor/sponsorships" className={buttonClasses({ size: 'sm', variant: 'outline' })}><Handshake className="h-4 w-4" />Manajemen Kerja Sama</Link>
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
              <Search className="h-4 w-4 text-primary-strong" aria-hidden="true" />
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
