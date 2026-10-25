import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Bookmark, BookmarkCheck, Building2, CalendarDays, MapPin, Send, Users } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '../../layouts/PublicLayout';
import StatusBadge, { EvidenceTag } from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
import { Field, Select, Textarea } from '../../components/Form';
import {
  evidenceTypeLabels,
  formatCurrency,
  formatDateRange,
  formatNumber,
  supportTypeLabels,
} from '../../lib/utils';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function EventShow({ event }) {
  const { auth } = usePage().props;
  const organizer = event.organizer;
  const canShortlist = auth?.user?.role === 'sponsor' && auth?.is_sponsor_active;
  const [showProposal, setShowProposal] = useState(false);

  function toggleShortlist() {
    if (event.shortlisted) {
      router.delete(`/sponsor/events/${event.id}/shortlist`, { preserveScroll: true });
    } else {
      router.post(`/sponsor/events/${event.id}/shortlist`, {}, { preserveScroll: true });
    }
  }

  return (
    <DashboardLayout auth={auth} title="Peluang sponsorship" description="Detail peluang sponsorship yang tersedia" className="bg-background">
      <Head title={event.title} />
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <Link href="/events" className="inline-flex items-center gap-2 text-sm text-text-secondary-strong hover:text-text">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Semua peluang
        </Link>

        <div className="mt-7 border-b border-border pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <EvidenceTag tone="primary">{event.category}</EvidenceTag>
            {event.format ? <EvidenceTag>{event.format}</EvidenceTag> : null}
            <EvidenceTag>{event.evidence.length} bukti audiens</EvidenceTag>
          </div>
          <h1 className="mt-4 max-w-4xl text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-text">
            {event.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 text-sm text-text-secondary-strong">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-text-muted" aria-hidden="true" />
              {formatDateRange(event.date_start, event.date_end)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-text-muted" aria-hidden="true" />
              {event.location}
            </span>
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-text-muted" aria-hidden="true" />
              {organizer.name}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="text-sm font-semibold text-text">Tentang event</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-text-secondary-strong">{event.description}</p>
            </section>

            <section>
              <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
                <h2 className="text-sm font-semibold text-text">Audiens</h2>
                <p className="text-xs text-text-muted">Setiap angka disertai sumber</p>
              </div>
              {event.audience_profile ? (
                <p className="mt-4 text-sm leading-relaxed text-text-secondary-strong">{event.audience_profile}</p>
              ) : null}
              {event.capacity_estimate ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-text-secondary-strong">
                  <Users className="h-4 w-4 text-text-muted" aria-hidden="true" />
                  Estimasi kapasitas: <span className="font-medium tabular-nums text-text">{formatNumber(event.capacity_estimate)} orang</span>
                </p>
              ) : null}

              {event.evidence.length > 0 ? (
                <div className="mt-5 overflow-hidden rounded-[12px] border border-border">
                  <div className="divide-y divide-border">
                    {event.evidence.map((item) => (
                      <div key={item.id} className="grid gap-2 px-4 py-4 sm:grid-cols-[120px_1fr_auto] sm:items-start sm:gap-4">
                        <div>
                          <p className="text-xs font-medium text-text">{evidenceTypeLabels[item.type] ?? item.type}</p>
                          {item.period ? <p className="mt-0.5 text-[11px] text-text-muted">{item.period}</p> : null}
                        </div>
                        <div>
                          <p className="text-lg font-semibold tabular-nums leading-tight text-text">
                            {formatNumber(item.value)} <span className="text-sm font-normal text-text-secondary-strong">{item.unit}</span>
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-text-secondary-strong">
                            Sumber: {item.source || 'Tidak disebutkan'}
                          </p>
                          {item.note ? <p className="mt-1 text-xs leading-relaxed text-text-muted">{item.note}</p> : null}
                        </div>
                        <div className="sm:pt-1">
                          <StatusBadge status={item.verification_status} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border bg-background-muted px-4 py-3">
                    <p className="text-xs leading-relaxed text-text-secondary-strong">
                      Label status mengikuti pemeriksaan data oleh admin. Proyeksi bukan jumlah kehadiran aktual.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-[10px] border border-dashed border-border px-4 py-4 text-sm text-text-secondary-strong">
                  EO belum menambahkan bukti audiens untuk event ini.
                </p>
              )}
            </section>

            <section>
              <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
                <h2 className="text-sm font-semibold text-text">Paket sponsorship</h2>
                <p className="text-xs text-text-muted">{event.packages.length} paket</p>
              </div>
              {event.packages.length > 0 ? (
                <div className="divide-y divide-border">
                  {event.packages.map((pkg) => {
                    const benefits = Array.isArray(pkg.benefits) ? pkg.benefits : [];
                    const deliverables = Array.isArray(pkg.deliverables) ? pkg.deliverables : [];

                    return (
                      <div key={pkg.id} className="py-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-[16px] font-semibold text-text">{pkg.name}</h3>
                              <StatusBadge status={pkg.availability_status} />
                            </div>
                            <p className="mt-1 text-xs text-text-secondary-strong">{supportTypeLabels[pkg.support_type] ?? pkg.support_type}</p>
                          </div>
                          <p className="text-sm font-medium tabular-nums text-text">
                            {pkg.support_type === 'cash' ? formatCurrency(pkg.price_amount, pkg.currency) : 'Dukungan non-tunai'}
                          </p>
                        </div>
                        <div className="mt-4 grid gap-5 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-medium text-text-muted">BENEFIT</p>
                            {benefits.length > 0 ? (
                              <ul className="mt-2 space-y-1.5">
                                {benefits.map((benefit, index) => (
                                  <li key={index} className="text-sm leading-relaxed text-text-secondary-strong">{benefit}</li>
                                ))}
                              </ul>
                            ) : <p className="mt-2 text-sm text-text-secondary-strong">Tidak dirinci.</p>}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-text-muted">DELIVERABLE</p>
                            {deliverables.length > 0 ? (
                              <ul className="mt-2 space-y-1.5">
                                {deliverables.map((deliverable, index) => (
                                  <li key={index} className="text-sm leading-relaxed text-text-secondary-strong">{deliverable}</li>
                                ))}
                              </ul>
                            ) : <p className="mt-2 text-sm text-text-secondary-strong">Tidak dirinci.</p>}
                          </div>
                        </div>
                        {pkg.notes ? <p className="mt-3 text-xs leading-relaxed text-text-muted">{pkg.notes}</p> : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 rounded-[10px] border border-dashed border-border px-4 py-4 text-sm text-text-secondary-strong">
                  Belum ada paket sponsorship yang dicantumkan.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[12px] border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold text-text">Tentang organizer</h2>
              <div className="mt-3 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-border bg-background-muted">
                  <Building2 className="h-5 w-5 text-primary-strong" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <Link href={`/organizers/${organizer.id}`} className="text-sm font-medium text-text hover:text-primary-strong">
                    {organizer.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-text-secondary-strong">{organizer.location ?? 'Lokasi belum diisi'}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs">
                {organizer.verified ? (
                  <>
                    <BadgeCheck className="h-4 w-4 text-success-strong" aria-hidden="true" />
                    <span className="text-success-strong">Identitas EO terverifikasi</span>
                  </>
                ) : (
                  <span className="text-text-secondary-strong">Profil EO belum terverifikasi</span>
                )}
              </div>
              {organizer.description ? (
                <p className="mt-3 text-sm leading-relaxed text-text-secondary-strong">{organizer.description}</p>
              ) : null}
              <div className="mt-4 border-t border-border pt-3">
                {organizer.review_count > 0 ? (
                  <p className="text-sm text-text-secondary-strong">
                    <span className="font-medium tabular-nums text-text">{Number(organizer.rating_average).toFixed(1)} / 5</span>{' '}
                    dari {organizer.review_count} ulasan kerja sama selesai.
                  </p>
                ) : (
                  <p className="text-xs leading-relaxed text-text-secondary-strong">
                    Belum ada ulasan. Ulasan hanya dapat ditulis setelah sponsorship tercatat selesai.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[12px] border border-border bg-background-muted p-5">
              <h2 className="text-sm font-semibold text-text">Ketertarikan</h2>
              {canShortlist ? (
                <>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary-strong">
                    {event.shortlisted
                      ? 'Event ini ada di shortlist Anda. Kelola di ruang kerja sponsor.'
                      : 'Simpan event ini sebagai shortlist untuk dibandingkan sebelum menghubungi EO.'}
                  </p>
                  <button
                    type="button"
                    onClick={toggleShortlist}
                    className={buttonClasses({
                      variant: event.shortlisted ? 'destructive-outline' : 'primary',
                      className: 'mt-4 w-full',
                    })}
                  >
                    {event.shortlisted ? (
                      <>
                        <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                        Hapus dari shortlist
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" aria-hidden="true" />
                        Simpan ke shortlist
                      </>
                    )}
                  </button>
                  <Link href="/sponsor/shortlist" className="mt-2 block text-center text-xs text-text-secondary-strong hover:text-text">
                    Lihat shortlist saya
                  </Link>

                  <div className="mt-4 border-t border-border pt-4">
                    {showProposal ? (
                      <SendProposalForm event={event} onCancel={() => setShowProposal(false)} />
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed text-text-secondary-strong">
                          Kirim minat/penawaran ke EO dengan menjelaskan dukungan yang Anda tawarkan.
                        </p>
                        <Button variant="outline" className="mt-3 w-full" onClick={() => setShowProposal(true)}>
                          <Send className="h-4 w-4" aria-hidden="true" />
                          Kirim minat
                        </Button>
                      </>
                    )}
                  </div>
                </>
              ) : auth?.user ? (
                <p className="mt-2 text-sm leading-relaxed text-text-secondary-strong">
                  {auth.user.role === 'sponsor'
                    ? 'Fitur shortlist aktif setelah verifikasi usaha disetujui.'
                    : 'Shortlist tersedia untuk akun sponsor yang sudah terverifikasi.'}
                </p>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-text-secondary-strong">
                  Masuk sebagai sponsor untuk menyimpan shortlist dan mengirim minat pada peluang ini.
                </p>
              )}
              <div className="mt-4 space-y-2">
                {auth?.user ? (
                  <Link href="/dashboard" className={buttonClasses({ variant: canShortlist ? 'ghost' : 'primary', className: 'w-full' })}>Buka ruang kerja</Link>
                ) : (
                  <>
                    <Link href="/login" className={buttonClasses({ className: 'w-full' })}>Masuk sebagai sponsor</Link>
                    <Link href="/register?role=sponsor" className={buttonClasses({ variant: 'outline', className: 'w-full' })}>
                      Daftar sponsor
                    </Link>
                  </>
                )}
              </div>
              <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-text-muted">
                SponsorIn tidak memproses pembayaran. Kesepakatan dan pembayaran dilakukan di luar platform sesuai ringkasan yang disetujui kedua pihak.
              </p>
            </div>

            {event.support_needs ? (
              <div className="rounded-[12px] border border-border p-5">
                <h2 className="text-xs font-medium text-text-muted">KEBUTUHAN DUKUNGAN</h2>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary-strong">{event.support_needs}</p>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

function SendProposalForm({ event, onCancel }) {
  const { data, setData, post, processing, errors } = useForm({
    package_id: '',
    requested_support: '',
    deliverables: '',
  });

  function submit(event_) {
    event_.preventDefault();
    post(`/sponsor/events/${event.id}/proposals`, { preserveScroll: true });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Paket (opsional)" htmlFor="proposal-package" error={errors.package_id}>
        <Select id="proposal-package" value={data.package_id} onChange={(event_) => setData('package_id', event_.target.value)}>
          <option value="">Tanpa paket tertentu</option>
          {event.packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
          ))}
        </Select>
      </Field>
      <Field label="Dukungan yang ditawarkan" htmlFor="proposal-support" required error={errors.requested_support}>
        <Textarea id="proposal-support" rows={3} value={data.requested_support} onChange={(event_) => setData('requested_support', event_.target.value)} placeholder="Bentuk dukungan yang Anda tawarkan." />
      </Field>
      <Field label="Deliverable yang diharapkan" htmlFor="proposal-deliverables" error={errors.deliverables}>
        <Textarea id="proposal-deliverables" rows={3} value={data.deliverables} onChange={(event_) => setData('deliverables', event_.target.value)} placeholder="Apa yang Anda harapkan dari EO." />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={processing}>{processing ? 'Mengirim…' : 'Kirim minat'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
      </div>
    </form>
  );
}
