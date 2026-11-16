import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Bookmark, BookmarkCheck, Building2, CalendarDays, MapPin, Send, Users, CheckCircle2 } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import StatusBadge, { EvidenceTag } from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
import {
  evidenceTypeLabels,
  formatCurrency,
  formatDateRange,
  formatEvidencePeriod,
  formatNumber,
  supportTypeLabels,
} from '../../lib/utils';

export default function EventShow({ event }) {
  const { auth } = usePage().props;
  const organizer = event.organizer;
  const canShortlist = auth?.user?.role === 'sponsor' && auth?.is_sponsor_active;
  const { post: sendInterest, processing: sendingInterest } = useForm({
    requested_support: 'Saya tertarik dengan event ini.',
  });

  function toggleShortlist() {
    if (event.shortlisted) {
      router.delete(`/sponsor/events/${event.id}/shortlist`, { preserveScroll: true });
    } else {
      router.post(`/sponsor/events/${event.id}/shortlist`, {}, { preserveScroll: true });
    }
  }

  return (
    <PublicLayout>
      <Head title={event.title} />
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <Link href="/events" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke semua event
        </Link>

        {/* Hero title area */}
        <div className="mt-6 border-b border-slate-200 pb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              {event.category}
            </span>
            {event.format ? <EvidenceTag>{event.format}</EvidenceTag> : null}
            <EvidenceTag>{event.evidence.length} Bukti Audiens</EvidenceTag>
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {event.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 font-medium">
              <CalendarDays className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {formatDateRange(event.date_start, event.date_end)}
            </span>
            <span className="inline-flex items-center gap-2 font-medium">
              <MapPin className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {event.location}
            </span>
            <span className="inline-flex items-center gap-2 font-medium">
              <Building2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {organizer.name}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <div className="min-w-0 space-y-10">
            {/* Description */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900">Deskripsi Event</h2>
              <p className="mt-3 whitespace-pre-line text-sm sm:text-[15px] leading-relaxed text-slate-700 font-normal">
                {event.description}
              </p>
            </section>

            {/* Audience & Evidence */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Profil & Bukti Audiens</h2>
                  <p className="text-xs text-slate-500">Seluruh klaim metrik wajib menyertakan sumber yang dapat diverifikasi</p>
                </div>
              </div>
              {event.audience_profile ? (
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{event.audience_profile}</p>
              ) : null}
              {event.capacity_estimate ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                  <Users className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  Estimasi Kapasitas Pengunjung: <span className="font-bold tabular-nums text-slate-900">{formatNumber(event.capacity_estimate)} orang</span>
                </div>
              ) : null}

              {event.evidence.length > 0 ? (
                <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                  <div className="divide-y divide-slate-100">
                    {event.evidence.map((item) => (
                      <div key={item.id} className="grid gap-3 p-4 sm:grid-cols-[140px_1fr_auto] sm:items-start sm:gap-4">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{evidenceTypeLabels[item.type] ?? item.type}</p>
                          {item.period_start || item.period ? (
                            <p className="mt-0.5 text-[11px] font-medium text-slate-500">{formatEvidencePeriod(item)}</p>
                          ) : null}
                        </div>
                        <div>
                          <p className="text-lg font-bold tabular-nums leading-tight text-slate-900">
                            {formatNumber(item.value)} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Sumber:</span> {item.source || 'Tidak disebutkan'}
                          </p>
                          {item.note ? <p className="mt-0.5 text-xs text-slate-500 italic">{item.note}</p> : null}
                        </div>
                        <div className="sm:pt-0.5">
                          <StatusBadge status={item.verification_status} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
                    Label status diperiksa secara obyektif oleh verifier internal platform.
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
                  Penyelenggara belum melampirkan berkas bukti audiens khusus.
                </div>
              )}
            </section>

            {/* Sponsorship Packages */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">Paket Sponsorship Tersedia</h2>
                <span className="text-xs font-semibold text-slate-500">{event.packages.length} Paket</span>
              </div>
              {event.packages.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {event.packages.map((pkg) => {
                    const benefits = Array.isArray(pkg.benefits) ? pkg.benefits : [];
                    const deliverables = Array.isArray(pkg.deliverables) ? pkg.deliverables : [];

                    return (
                      <div key={pkg.id} className="py-6 first:pt-4 last:pb-2">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                              <StatusBadge status={pkg.availability_status} />
                            </div>
                            <p className="mt-0.5 text-xs font-medium text-slate-500">{supportTypeLabels[pkg.support_type] ?? pkg.support_type}</p>
                          </div>
                          <p className="text-lg font-extrabold tabular-nums text-emerald-700">
                            {pkg.support_type === 'cash' ? formatCurrency(pkg.price_amount, pkg.currency) : 'Bentuk In-Kind / Non-Tunai'}
                          </p>
                        </div>
                        <div className="mt-4 grid gap-5 sm:grid-cols-2">
                          <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100">
                            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Benefit Sponsor</p>
                            {benefits.length > 0 ? (
                              <ul className="mt-2 space-y-1.5">
                                {benefits.map((benefit, index) => (
                                  <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : <p className="mt-2 text-xs text-slate-500">Belum ada rincian khusus.</p>}
                          </div>
                          <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100">
                            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Deliverables (Kewajiban Timbal Balik)</p>
                            {deliverables.length > 0 ? (
                              <ul className="mt-2 space-y-1.5">
                                {deliverables.map((deliverable, index) => (
                                  <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                    <span>{deliverable}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : <p className="mt-2 text-xs text-slate-500">Belum ada rincian khusus.</p>}
                          </div>
                        </div>
                        {pkg.notes ? <p className="mt-3 text-xs text-slate-500 italic">{pkg.notes}</p> : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
                  Belum ada paket sponsorship resmi yang dicantumkan.
                </div>
              )}
            </section>
          </div>

          {/* Sticky Aside */}
          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            {/* Organizer Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Tentang Penyelenggara</h2>
              <div className="mt-3 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <Link href={`/organizers/${organizer.id}`} className="text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors">
                    {organizer.name}
                  </Link>
                  <p className="text-xs text-slate-500">{organizer.location ?? 'Lokasi belum diisi'}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs">
                {organizer.verified ? (
                  <>
                    <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    <span className="font-semibold text-emerald-700">Identitas EO Terverifikasi</span>
                  </>
                ) : (
                  <span className="text-slate-500">Profil EO belum terverifikasi</span>
                )}
              </div>
              {organizer.description ? (
                <p className="mt-3 text-xs leading-relaxed text-slate-600">{organizer.description}</p>
              ) : null}
              {organizer.review_count > 0 ? (
                <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  ⭐ <span className="font-bold text-slate-900">{Number(organizer.rating_average).toFixed(1)} / 5</span> dari {organizer.review_count} ulasan kemitraan selesai.
                </div>
              ) : null}
            </div>

            {/* Interest & Shortlist Action */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900">Aksi Kerja Sama</h2>
              {canShortlist ? (
                <>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {event.shortlisted
                      ? 'Event ini tersimpan di shortlist Anda. Anda dapat mengelolanya atau menghapusnya kapan saja.'
                      : 'Simpan event ini ke daftar shortlist untuk membandingkannya dengan peluang lain.'}
                  </p>
                  <button
                    type="button"
                    onClick={toggleShortlist}
                    className={buttonClasses({
                      variant: event.shortlisted ? 'destructive-outline' : 'outline',
                      className: 'mt-3 w-full',
                    })}
                  >
                    {event.shortlisted ? (
                      <>
                        <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                        Hapus dari Shortlist
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" aria-hidden="true" />
                        Simpan ke Shortlist
                      </>
                    )}
                  </button>

                  <div className="mt-4 border-t border-emerald-100 pt-4">
                    <p className="text-xs leading-relaxed text-slate-600">
                      Sampaikan minat Anda untuk langsung membuka jalur obrolan dan negosiasi dengan EO.
                    </p>
                    <Button
                      type="button"
                      className="mt-3 w-full"
                      disabled={sendingInterest}
                      onClick={() => sendInterest(`/sponsor/events/${event.id}/proposals`, { preserveScroll: true })}
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                      {sendingInterest ? 'Mengirim Minat…' : 'Kirim Minat Kerja Sama'}
                    </Button>
                  </div>
                </>
              ) : auth?.user ? (
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {auth.user.role === 'sponsor'
                    ? 'Akses pengajuan minat aktif segera setelah verifikasi profil usaha Anda disetujui admin.'
                    : 'Fitur shortlist dan pengajuan minat khusus untuk akun brand sponsor terverifikasi.'}
                </p>
              ) : (
                <div className="space-y-3 mt-3">
                  <p className="text-xs leading-relaxed text-slate-600">
                    Masuk atau daftarkan brand Anda untuk menyimpan ke shortlist dan mengajukan minat kerja sama pada event ini.
                  </p>
                  <Link href="/login" className={buttonClasses({ className: 'w-full' })}>
                    Masuk Akun Sponsor
                  </Link>
                  <Link href="/register?role=sponsor" className={buttonClasses({ variant: 'outline', className: 'w-full' })}>
                    Daftar Akun Baru
                  </Link>
                </div>
              )}
            </div>

            {event.support_needs ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Kebutuhan Dukungan Utama</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">{event.support_needs}</p>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
