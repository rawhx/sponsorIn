import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, Globe, LayoutDashboard, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
import { Field, Input, Select, Textarea } from '../../components/Form';
import CitySelect from '../../components/CitySelect';

export default function SponsorOrganizations({
  organization,
  verification,
  legalForms,
  preferences,
  saved,
}) {
  const [location, setLocation] = useState(organization.location ?? '');

  return (
    <DashboardLayout
      eyebrow="Profil sponsor"
      title="Profil Organisasi Sponsor"
      description="Kelola identitas brand, kontak publik, dan preferensi penerimaan proposal dari event organizer."
      actions={
        <Link href="/sponsor/dashboard" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
      }
    >
      <Head title="Profil Organisasi" />

      {saved && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 px-5 py-4 text-sm text-success-strong">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Profil organisasi berhasil diperbarui.</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main Column: Configuration Form */}
        <div className="min-w-0 space-y-6">
          <form method="post" action="/sponsor/organizations" className="space-y-6">
            {/* Identity Card */}
            <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-5">
              <div className="border-b border-border/70 pb-4">
                <h2 className="text-base font-semibold text-text">Identitas Brand & Usaha</h2>
                <p className="mt-0.5 text-xs text-text-secondary">Informasi dasar yang merepresentasikan instansi Anda</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Nama badan usaha resmi"
                  htmlFor="legal_name"
                  required
                  hint="Nama resmi sesuai NIB / NPWP"
                >
                  <Input id="legal_name" name="legal_name" defaultValue={organization.legal_name} />
                </Field>

                <Field
                  label="Nama brand / tampilan"
                  htmlFor="display_name"
                  required
                  hint="Nama yang ditampilkan ke publik"
                >
                  <Input id="display_name" name="display_name" defaultValue={organization.display_name} />
                </Field>
              </div>

              <Field
                label="Deskripsi profil brand"
                htmlFor="description"
                hint="Jelaskan fokus industri, target audiens, atau misi sponsorship Anda"
              >
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={organization.description}
                  placeholder="Contoh: Kami adalah perusahaan teknologi yang mendukung event inovasi, pendidikan, dan kreativitas generasi muda…"
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Kategori industri" htmlFor="category">
                  <Input id="category" name="category" defaultValue={organization.category} placeholder="Misal: Teknologi, FMCG, Perbankan" />
                </Field>

                <Field label="Kota domisili" htmlFor="location">
                  <CitySelect id="location" name="location" value={location} onChange={(event) => setLocation(event.target.value)} />
                </Field>
              </div>
            </div>

            {/* Visibility & Preference Card */}
            <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-5">
              <div className="border-b border-border/70 pb-4">
                <h2 className="text-base font-semibold text-text">Visibilitas & Preferensi Proposal</h2>
                <p className="mt-0.5 text-xs text-text-secondary">Atur bagaimana EO menemukan dan menghubungi sponsor Anda</p>
              </div>

              <Field
                label="Email kontak publik"
                htmlFor="public_contact"
                hint="Email yang dapat dihubungi oleh EO untuk perkenalan atau pertanyaan umum"
              >
                <Input id="public_contact" name="public_contact" defaultValue={organization.public_contact} placeholder="sponsor@perusahaan.com" />
              </Field>

              <Field label="Preferensi penerimaan proposal" htmlFor="proposal_preference" required>
                <Select id="proposal_preference" name="proposal_preference" defaultValue={organization.proposal_preference}>
                  <option value="">Pilih preferensi</option>
                  {preferences.map((pref) => (
                    <option key={pref.value} value={pref.value}>{pref.label}</option>
                  ))}
                </Select>
              </Field>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4">
                <label htmlFor="public_visibility" className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    id="public_visibility"
                    name="public_visibility"
                    type="checkbox"
                    defaultChecked={Boolean(organization.public_visibility)}
                    className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500/20 accent-emerald-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-text">Tampilkan profil di direktori sponsor publik</span>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      Jika dicentang, nama brand, kategori, dan deskripsi Anda dapat dilihat oleh event organizer di katalog sponsor.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-border/60">
                <Link href="/sponsor/dashboard" className={buttonClasses({ variant: 'outline', className: 'w-full sm:w-auto' })}>
                  Batal
                </Link>
                <Button type="submit" className="w-full sm:w-auto">
                  Simpan Perubahan Profil
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Aside: Status & Info */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Verification Status Card */}
          <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Status Verifikasi</h2>
              <StatusBadge status={verification.status} />
            </div>

            <dl className="mt-4 divide-y divide-border/60 text-xs">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-text-secondary">Tanggal Pengajuan</span>
                <span className="tabular-nums font-medium text-text">{verification.submitted_at ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-text-secondary">Tanggal Ditinjau</span>
                <span className="tabular-nums font-medium text-text">{verification.reviewed_at ?? '—'}</span>
              </div>
              {verification.decision_reason_public && (
                <div className="py-2.5">
                  <span className="text-text-secondary block mb-1">Catatan Verifikasi:</span>
                  <p className="text-text leading-relaxed bg-background p-2.5 rounded-lg border border-border/50">
                    {verification.decision_reason_public}
                  </p>
                </div>
              )}
            </dl>

            <div className="mt-4 pt-3 border-t border-border/60">
              <Link href="/sponsor/verification" className={buttonClasses({ variant: 'outline', size: 'sm', className: 'w-full' })}>
                <ShieldCheck className="h-4 w-4" />
                Kelola Dokumen Legal
              </Link>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="rounded-2xl border border-border/80 bg-background/60 p-5 text-xs text-text-secondary space-y-2">
            <h3 className="font-semibold text-text flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-primary" />
              Keamanan Data Sponsor
            </h3>
            <p className="leading-relaxed">
              Nomor identitas usaha (NIB) dan NPWP Anda dienkripsi secara aman dan hanya dapat diakses oleh tim verifikasi admin berwenang.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
