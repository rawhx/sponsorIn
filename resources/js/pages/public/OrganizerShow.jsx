import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Building2, CalendarDays, MapPin, Star } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { EvidenceTag } from '../../components/StatusBadge';
import { formatDateRange } from '../../lib/utils';

export default function OrganizerShow({ organizer, events }) {
  return (
    <PublicLayout>
      <Head title={`${organizer.name} · Profil Penyelenggara`} />
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <Link href="/organizers" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Semua Penyelenggara Event
        </Link>

        <div className="mt-6 grid gap-8 border-b border-slate-200 pb-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          <div>
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 font-bold">
                <Building2 className="h-7 w-7" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                  {organizer.name}
                </h1>
                {organizer.location ? (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    {organizer.location}
                  </p>
                ) : null}
              </div>
            </div>
            {organizer.description ? (
              <p className="mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">{organizer.description}</p>
            ) : null}
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Informasi Organisasi</h2>
            <dl className="mt-4 space-y-3.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Event Aktif</dt>
                <dd className="font-bold tabular-nums text-slate-900">{organizer.event_count} Event</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                <dt className="text-slate-500">Status Validasi</dt>
                <dd>
                  {organizer.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                      Terverifikasi
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500">Belum diverifikasi</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                <dt className="text-slate-500">Reputasi</dt>
                <dd>
                  {organizer.review_count > 0 ? (
                    <span className="inline-flex items-center gap-1 font-bold tabular-nums text-slate-900">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden="true" />
                      {Number(organizer.rating_average).toFixed(1)} / 5 ({organizer.review_count})
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Belum ada ulasan</span>
                  )}
                </dd>
              </div>
              {organizer.public_contact ? (
                <div className="border-t border-slate-100 pt-3">
                  <dt className="text-xs font-medium text-slate-400">Kontak Narahubung</dt>
                  <dd className="mt-1 break-words font-medium text-slate-800">{organizer.public_contact}</dd>
                </div>
              ) : null}
            </dl>
          </aside>
        </div>

        <div className="mt-10">
          <div className="flex items-baseline justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Event yang Sedang Membuka Peluang</h2>
            <p className="text-xs text-slate-400 font-medium">{events.length} event terbit</p>
          </div>

          <div className="mt-6 space-y-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md"
              >
                <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                  <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-4">
                    <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">{event.category}</p>
                    <p className="flex items-center gap-1.5 text-xs font-medium tabular-nums text-slate-600">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      {formatDateRange(event.date_start, event.date_end)}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {event.location}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {event.title}
                    </h3>
                    {event.audience_summary ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{event.audience_summary}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <EvidenceTag>{event.evidence_count} Bukti Audiens</EvidenceTag>
                      <EvidenceTag>{event.package_count} Paket Sponsor</EvidenceTag>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
