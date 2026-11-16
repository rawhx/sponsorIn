import { Head, Link } from '@inertiajs/react';
import { FilePlus2, Star, Calendar, ArrowRight, Handshake } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { formatDate } from '../../lib/utils';

export default function EoDashboard({ organization, counts = {}, upcomingEvents = [] }) {
  const statusRows = [
    { label: 'Total Proposal', value: counts.proposals_total ?? 0, description: 'Semua proposal yang dibuat' },
    { label: 'Proposal Terbit', value: counts.proposals_published ?? 0, description: 'Dapat dilihat publik & sponsor' },
    { label: 'Draf Proposal', value: counts.proposals_draft ?? 0, description: 'Belum dipublikasikan' },
    { label: 'Peminat (Sponsor)', value: counts.proposals_interest ?? 0, description: 'Sponsor yang merespons proposal' },
  ];

  return (
    <DashboardLayout
      eyebrow={organization?.name ?? 'Akun EO'}
      title="Dashboard Penyelenggara"
      description="Kelola ringkasan proposal, status publikasi event, dan respons sponsor."
      actions={
        <Link href="/eo/events/create" className={buttonClasses()}>
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          Buat Event Baru
        </Link>
      }
    >
      <Head title="Dashboard EO" />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* Proposal Summary Card */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Ringkasan Proposal</p>
            <h2 className="mt-1 text-base font-bold text-slate-900">Performa Proposal & Peminat</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {statusRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{row.label}</p>
                  <p className="text-xs text-slate-500">{row.description}</p>
                </div>
                <p className="text-xl font-bold tabular-nums text-slate-900">{row.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 bg-emerald-50/50 px-5 py-3 text-xs font-semibold text-emerald-800">
            <span className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-emerald-600" />
              Kerja Sama Aktif Berjalan:
            </span>
            <span className="text-sm font-bold tabular-nums">{counts.sponsorships_active ?? 0} Kontrak</span>
          </div>
        </section>

        {/* Organization Profile Summary */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Profil Organisasi</p>
            <h2 className="mt-1 text-base font-bold text-slate-900">{organization.name}</h2>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm leading-relaxed text-slate-600">
              {organization.description || 'Tambahkan deskripsi organisasi di menu profil agar brand sponsor memahami fokus dan rekam jejak event Anda.'}
            </p>
            <div className="border-t border-slate-100 pt-3 text-xs">
              <p className="font-semibold text-slate-400 uppercase tracking-wider">Lokasi Domisili</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{organization.location || 'Belum diisi'}</p>
            </div>
            <div className="flex items-start gap-2.5 border-t border-slate-100 pt-3">
              <Star className="mt-0.5 h-4 w-4 text-amber-500 fill-amber-400 shrink-0" aria-hidden="true" />
              {organization.review_count > 0 ? (
                <p className="text-sm text-slate-700">
                  <span className="font-bold tabular-nums text-slate-900">{Number(organization.rating_average).toFixed(1)} / 5</span>{' '}
                  dari {organization.review_count} ulasan kemitraan selesai.
                </p>
              ) : (
                <p className="text-xs leading-relaxed text-slate-500">
                  Belum ada ulasan. Rating dihitung dari feedback sponsor setelah sponsorship selesai.
                </p>
              )}
            </div>
            <div className="border-t border-slate-100 pt-3">
              <Link href="/eo/profile" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1">
                Kelola profil organisasi
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Upcoming Events */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900">Event Mendatang</h2>
          <p className="text-xs text-slate-400 font-medium">{upcomingEvents.length} event terdaftar</p>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden divide-y divide-slate-100">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="grid gap-2 p-4 sm:grid-cols-[160px_1fr_auto] sm:items-center sm:gap-6 hover:bg-slate-50 transition-colors">
                <p className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  {formatDate(event.date_start)}
                </p>
                <div>
                  <Link
                    href={`/eo/events/${event.id}`}
                    className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                  >
                    {event.title}
                  </Link>
                  <p className="text-xs text-slate-500">{event.location}</p>
                </div>
                <div className="sm:self-center">
                  <StatusBadge status={event.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-4"
            illustration="calendar"
            title="Belum ada event mendatang"
            description="Event yang Anda buat akan muncul di sini. Mulai dengan membuat event pertama Anda, lengkapi berkas audiens, lalu ajukan untuk moderasi."
            action={<Link href="/eo/events/create" className={buttonClasses()}>Buat Event Sekarang</Link>}
          />
        )}
      </section>
    </DashboardLayout>
  );
}
