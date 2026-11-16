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
      eyebrow={organization?.name ?? 'Akun Brand Sponsor'}
      title="Dashboard Sponsor"
      description="Kelola peluang sponsorship yang masuk, status verifikasi legalitas, dan riwayat kemitraan."
    >
      <Head title="Dashboard Sponsor" />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Proposal Masuk</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">{stats.proposal_incoming ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Total penawaran dari EO</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Proposal Aktif</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">{stats.proposal_active ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Dalam peninjauan & negosiasi</p>
        </section>
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
          <p className="text-xs font-bold tracking-wider text-emerald-800 uppercase">Kerja Sama Berjalan</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-950 tabular-nums">{stats.sponsorship_active ?? 0}</p>
          <p className="mt-1 text-xs text-emerald-700 font-medium">Kontrak kemitraan aktif</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Total Selesai</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">{stats.sponsorship_total ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Arsip riwayat kerja sama</p>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Verification Status Card */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Verifikasi Identitas Usaha</p>
              <h2 className="mt-0.5 text-base font-bold text-slate-900">Hak Akses Fitur Kemitraan</h2>
            </div>
            <StatusBadge status={status} />
          </div>
          <div className="p-6">
            {needsVerification ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-slate-600">
                  {status === 'draft' && 'Lengkapi profil data badan usaha dan lampirkan dokumen pendukung untuk mengaktifkan seluruh fitur proposal.'}
                  {status === 'submitted' && 'Pengajuan verifikasi Anda telah berhasil dikirimkan dan saat ini sedang menunggu antrean peninjauan admin.'}
                  {status === 'under_review' && 'Dokumen legalitas usaha Anda sedang diverifikasi secara seksama oleh tim verifier.'}
                  {status === 'needs_information' && 'Admin memerlukan informasi tambahan. Periksa catatan verifikasi di bawah ini, perbarui data, lalu kirim ulang.'}
                  {status === 'rejected' && 'Pengajuan verifikasi belum disetujui. Silakan periksa alasan penolakan dan perbaiki berkas usaha Anda.'}
                </p>
                {verification.decision_reason_public ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                    <p className="font-bold uppercase tracking-wider text-amber-800">Catatan Review dari Tim Verifier</p>
                    <p className="mt-1 leading-relaxed text-sm">{verification.decision_reason_public}</p>
                  </div>
                ) : null}
                <div className="pt-2">
                  <Link href="/sponsor/verification" className={buttonClasses()}>
                    {status === 'draft' ? 'Lengkapi Berkas Sekarang' : 'Buka Halaman Verifikasi'}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-slate-600">
                  Identitas legalitas usaha telah diverifikasi dan disetujui. Anda memiliki akses penuh untuk menjelajahi katalog proposal, membuka obrolan negosiasi, dan mengelola kontrak sponsorship.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <Link href="/sponsor/proposals" className={buttonClasses({ size: 'sm', variant: 'outline' })}>
                    <FileText className="h-4 w-4" />Daftar Proposal
                  </Link>
                  <Link href="/sponsor/sponsorships" className={buttonClasses({ size: 'sm', variant: 'outline' })}>
                    <Handshake className="h-4 w-4" />Manajemen Kerja Sama
                  </Link>
                </div>
              </div>
            )}
            <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-4 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-400 uppercase tracking-wider">Tanggal Pengajuan</dt>
                <dd className="mt-1 font-medium text-slate-700">{verification.submitted_at ? formatDate(verification.submitted_at, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum diajukan'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-400 uppercase tracking-wider">Tanggal Ditinjau</dt>
                <dd className="mt-1 font-medium text-slate-700">{verification.reviewed_at ? formatDate(verification.reviewed_at, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum ditinjau'}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Business Profile Panel */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Profil Badan Usaha</p>
            <h2 className="mt-0.5 text-base font-bold text-slate-900">{organization?.name ?? 'Belum diisi'}</h2>
          </div>
          <dl className="divide-y divide-slate-100 p-6 space-y-3.5">
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lokasi Kantor</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">{organization?.location ?? 'Belum diisi'}</dd>
            </div>
            <div className="pt-3.5">
              <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preferensi Penerimaan Proposal</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {proposalPreferenceLabels[organization?.proposal_preference] ?? 'Menerima proposal'}
              </dd>
            </div>
            <div className="pt-3.5">
              <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Fitur Sponsorship</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-semibold">
                {canUseFeatures ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    Fitur Aktif & Siap Kolaborasi
                  </span>
                ) : (
                  <span className="text-amber-700">Menunggu Persetujuan Verifikasi</span>
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Guide / Trust Highlights */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900">Standar Transparansi Ekosistem SponsorIn</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <FileCheck2 className="h-4 w-4" />
              <span>Kerahasiaan Berkas Legal</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Dokumen identitas usaha NIB & NPWP disimpan secara terenkripsi dan hanya digunakan untuk validasi kepatuhan internal.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <BadgeCheck className="h-4 w-4" />
              <span>Status Transparan</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Setiap keputusan moderasi dan verifikasi menyertakan catatan tertulis resmi yang dapat ditinjau oleh pihak terkait.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <Search className="h-4 w-4" />
              <span>Katalog Terkurasi</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Event yang terbit telah menyertakan data sumber audiens yang jelas sehingga keputusan kemitraan brand Anda lebih terukur.
            </p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
