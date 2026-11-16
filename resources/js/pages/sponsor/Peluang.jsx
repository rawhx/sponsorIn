import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Bookmark, BookmarkCheck, Building2, CalendarDays, CheckCircle2, ChevronRight, Info, MapPin, Send, Users } from 'lucide-react';
import { useState } from 'react';
import StatusBadge, { EvidenceTag } from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
import { Field, Select, Textarea } from '../../components/Form';
import {
  evidenceTypeLabels,
  formatCurrency,
  formatDateRange,
  formatEvidencePeriod,
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
    <DashboardLayout
      auth={auth}
      eyebrow="Peluang sponsorship"
      title={event.title}
      actions={
        <Link href="/sponsor/events" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft className="h-4 w-4" />
          Semua Peluang
        </Link>
      }
    >
      <Head title={event.title} />

      {/* Hero card */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <EvidenceTag tone="primary">{event.category}</EvidenceTag>
          {event.format ? <EvidenceTag>{event.format}</EvidenceTag> : null}
          <EvidenceTag tone="neutral">{event.evidence.length} bukti audiens</EvidenceTag>
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text">
          {event.title}
        </h1>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="font-medium text-text">{formatDateRange(event.date_start, event.date_end)}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-text-muted" aria-hidden="true" />
            <span>{event.location}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Building2 className="h-4 w-4 text-text-muted" aria-hidden="true" />
            <span>{organizer.name}</span>
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main Column */}
        <div className="min-w-0 space-y-8">
          {/* About Section */}
          <section className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
            <h2 className="text-base font-semibold text-text">Tentang Event</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
              {event.description}
            </p>
          </section>

          {/* Audience Metrics Section */}
          <section className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/70 pb-4">
              <div>
                <h2 className="text-base font-semibold text-text">Data Audiens Terverifikasi</h2>
                <p className="text-xs text-text-muted mt-0.5">Setiap metrik diverifikasi dengan bukti dan sumber resmi</p>
              </div>
              {event.capacity_estimate && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-background px-3 py-1.5 text-xs text-text-secondary">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span>Kapasitas: <strong className="font-semibold text-text tabular-nums">{formatNumber(event.capacity_estimate)}</strong> orang</span>
                </div>
              )}
            </div>

            {event.audience_profile && (
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">{event.audience_profile}</p>
            )}

            {event.evidence.length > 0 ? (
              <div className="mt-5 space-y-3">
                {event.evidence.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/50 p-4 transition-colors hover:bg-background"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text">{evidenceTypeLabels[item.type] ?? item.type}</span>
                        {(item.period_start || item.period) && (
                          <span className="text-[11px] text-text-muted">· {formatEvidencePeriod(item)}</span>
                        )}
                      </div>
                      <p className="mt-1 text-xl font-bold tabular-nums text-text">
                        {formatNumber(item.value)}{' '}
                        <span className="text-xs font-normal text-text-secondary">{item.unit}</span>
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Sumber: <span className="text-text">{item.source || 'Tidak disebutkan'}</span>
                      </p>
                      {item.note && <p className="mt-0.5 text-xs text-text-muted italic">{item.note}</p>}
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={item.verification_status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                EO belum melampirkan bukti data audiens untuk event ini.
              </div>
            )}
          </section>

          {/* Packages Section */}
          <section className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div>
                <h2 className="text-base font-semibold text-text">Paket Sponsorship</h2>
                <p className="text-xs text-text-muted mt-0.5">Pilihan nilai kerja sama dan timbal balik</p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {event.packages.length} Paket
              </span>
            </div>

            {event.packages.length > 0 ? (
              <div className="mt-5 space-y-4">
                {event.packages.map((pkg) => {
                  const benefits = Array.isArray(pkg.benefits) ? pkg.benefits : [];
                  const deliverables = Array.isArray(pkg.deliverables) ? pkg.deliverables : [];

                  return (
                    <div
                      key={pkg.id}
                      className="rounded-xl border border-border/70 bg-background/40 p-5 transition-all hover:border-primary/40 hover:bg-background/80"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-text">{pkg.name}</h3>
                            <StatusBadge status={pkg.availability_status} />
                          </div>
                          <p className="mt-0.5 text-xs text-text-secondary">{supportTypeLabels[pkg.support_type] ?? pkg.support_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold tabular-nums text-primary">
                            {pkg.support_type === 'cash' ? formatCurrency(pkg.price_amount, pkg.currency) : 'Dukungan Non-Tunai'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2 border-t border-border/50 pt-3">
                        <div>
                          <p className="text-[11px] font-semibold tracking-wider text-text-muted uppercase">Benefit Sponsor</p>
                          {benefits.length > 0 ? (
                            <ul className="mt-2 space-y-1.5">
                              {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start gap-2 text-xs text-text-secondary">
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1 text-xs text-text-muted">Tidak dirinci.</p>
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold tracking-wider text-text-muted uppercase">Deliverable EO</p>
                          {deliverables.length > 0 ? (
                            <ul className="mt-2 space-y-1.5">
                              {deliverables.map((deliverable, index) => (
                                <li key={index} className="flex items-start gap-2 text-xs text-text-secondary">
                                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted mt-0.5" />
                                  <span>{deliverable}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1 text-xs text-text-muted">Tidak dirinci.</p>
                          )}
                        </div>
                      </div>
                      {pkg.notes && <p className="mt-3 text-xs text-text-muted italic border-t border-border/40 pt-2">{pkg.notes}</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                Belum ada paket sponsorship yang dicantumkan.
              </div>
            )}
          </section>
        </div>

        {/* Aside Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Organizer Card */}
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Penyelenggara Event</h2>
            <div className="mt-4 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <Link href={`/organizers/${organizer.id}`} className="text-sm font-semibold text-text hover:text-primary transition-colors">
                  {organizer.name}
                </Link>
                <p className="mt-0.5 text-xs text-text-secondary">{organizer.location ?? 'Lokasi belum diisi'}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 text-xs">
              {organizer.verified ? (
                <div className="flex items-center gap-1.5 text-success">
                  <BadgeCheck className="h-4 w-4" />
                  <span className="font-medium">Identitas EO Terverifikasi</span>
                </div>
              ) : (
                <span className="text-text-muted">Profil EO belum terverifikasi</span>
              )}
            </div>

            {organizer.description && (
              <p className="mt-3 text-xs leading-relaxed text-text-secondary line-clamp-3">{organizer.description}</p>
            )}

            <div className="mt-4 border-t border-border/60 pt-3">
              {organizer.review_count > 0 ? (
                <p className="text-xs text-text-secondary">
                  Rating <strong className="font-semibold text-text tabular-nums">{Number(organizer.rating_average).toFixed(1)} / 5</strong>{' '}
                  ({organizer.review_count} ulasan selesai)
                </p>
              ) : (
                <p className="text-xs text-text-muted">Belum ada riwayat ulasan selesai.</p>
              )}
            </div>
          </div>

          {/* Engagement / Shortlist / Proposal Card */}
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Tindakan Sponsor</h2>
            {canShortlist ? (
              <div className="mt-3 space-y-4">
                <p className="text-xs leading-relaxed text-text-secondary">
                  {event.shortlisted
                    ? 'Event ini tersimpan di shortlist Anda. Anda dapat mengajukan proposal langsung atau menghapusnya.'
                    : 'Simpan ke shortlist untuk membandingkan matriks audiens sebelum menghubungi EO.'}
                </p>

                <Button
                  type="button"
                  variant={event.shortlisted ? 'destructive-outline' : 'outline'}
                  className="w-full"
                  onClick={toggleShortlist}
                >
                  {event.shortlisted ? (
                    <>
                      <BookmarkCheck className="h-4 w-4" />
                      Hapus dari Shortlist
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      Simpan ke Shortlist
                    </>
                  )}
                </Button>

                <Link href="/sponsor/shortlist" className="block text-center text-xs font-medium text-text-secondary hover:text-primary transition-colors">
                  Buka Shortlist Saya
                </Link>

                <div className="border-t border-border/60 pt-4">
                  {showProposal ? (
                    <SendProposalForm event={event} onCancel={() => setShowProposal(false)} />
                  ) : (
                    <div>
                      <p className="text-xs leading-relaxed text-text-secondary mb-3">
                        Kirim ketertarikan/penawaran kerja sama langsung kepada EO ini.
                      </p>
                      <Button className="w-full" onClick={() => setShowProposal(true)}>
                        <Send className="h-4 w-4" />
                        Kirim Minat / Proposal
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : auth?.user ? (
              <div className="mt-3 space-y-3">
                <p className="text-xs leading-relaxed text-text-secondary">
                  {auth.user.role === 'sponsor'
                    ? 'Fitur pengajuan proposal aktif setelah verifikasi usaha Anda disetujui admin.'
                    : 'Fitur shortlist dan proposal hanya tersedia untuk akun sponsor terverifikasi.'}
                </p>
                {auth.user.role === 'sponsor' && (
                  <Link href="/sponsor/verification" className={buttonClasses({ className: 'w-full', size: 'sm' })}>
                    Cek Status Verifikasi
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-xs leading-relaxed text-text-secondary">
                  Masuk sebagai sponsor untuk menyimpan shortlist dan mengirim penawaran langsung.
                </p>
                <Link href="/login" className={buttonClasses({ className: 'w-full', size: 'sm' })}>
                  Masuk sebagai Sponsor
                </Link>
                <Link href="/register?role=sponsor" className={buttonClasses({ variant: 'outline', className: 'w-full', size: 'sm' })}>
                  Daftar Akun Sponsor
                </Link>
              </div>
            )}

            <div className="mt-4 border-t border-border/60 pt-3">
              <p className="flex items-start gap-1.5 text-[11px] text-text-muted leading-relaxed">
                <Info className="h-3.5 w-3.5 shrink-0 text-text-muted mt-0.5" />
                <span>WebSponsor memfasilitasi kesepakatan dan dossier kerja sama; transaksi finansial diselesaikan di luar platform.</span>
              </p>
            </div>
          </div>

          {/* Support Needs */}
          {event.support_needs && (
            <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Kebutuhan Dukungan EO</h3>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">{event.support_needs}</p>
            </div>
          )}
        </aside>
      </div>
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
    <form onSubmit={submit} className="space-y-3.5 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <h3 className="text-xs font-semibold text-primary">Formulir Minat Penawaran</h3>
      <Field label="Pilih Paket (opsional)" htmlFor="proposal-package" error={errors.package_id}>
        <Select id="proposal-package" value={data.package_id} onChange={(event_) => setData('package_id', event_.target.value)}>
          <option value="">Tanpa paket tertentu</option>
          {event.packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
          ))}
        </Select>
      </Field>
      <Field label="Dukungan yang ditawarkan" htmlFor="proposal-support" required error={errors.requested_support}>
        <Textarea
          id="proposal-support"
          rows={3}
          value={data.requested_support}
          onChange={(event_) => setData('requested_support', event_.target.value)}
          placeholder="Bentuk dukungan tunai/natura yang Anda tawarkan…"
        />
      </Field>
      <Field label="Deliverable yang diharapkan" htmlFor="proposal-deliverables" error={errors.deliverables}>
        <Textarea
          id="proposal-deliverables"
          rows={3}
          value={data.deliverables}
          onChange={(event_) => setData('deliverables', event_.target.value)}
          placeholder="Branding, booth, penempatan logo, atau aktivasi yang diharapkan…"
        />
      </Field>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" className="flex-1" loading={processing}>
          Kirim Minat
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  );
}
