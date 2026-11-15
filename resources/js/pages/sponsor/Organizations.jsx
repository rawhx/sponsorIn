import { Head, Link } from '@inertiajs/react';
import { FileText, LayoutDashboard, ShieldCheck, Star } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { Field, Input, Select, Textarea } from '../../components/Form';
import { legalFormLabels, proposalPreferenceLabels, evidenceTypeLabels, supportTypeLabels } from '../../lib/utils';

export default function SponsorOrganizations({
  organization,
  verification,
  legalForms,
  preferences,
  saved,
}) {
  return (
    <DashboardLayout
      eyebrow="Profil sponsor"
      title="Profil organisasi"
      actions={
        <Link href="/sponsor/dashboard" className={buttonClasses({ variant: 'outline' })}>
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Ringkasan
        </Link>
      }
    >
      <Head title="Profil organisasi" />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:gap-10">
        <div>
          {saved ? (
            <div className="rounded-[10px] border border-success/25 bg-success/10 px-4 py-3">
              <p className="text-sm text-success-strong">Profil berhasil disimpan.</p>
            </div>
          ) : null}

          <section className="rounded-[12px] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text">Identitas brand</h2>
            <dl className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-[160px_1fr]">
              <div>
                <dt className="text-xs text-text-muted">Nama badan usaha</dt>
                <dd className="mt-0.5 text-sm font-medium text-text">{organization.legal_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Nama tampilan</dt>
                <dd className="mt-0.5 text-sm text-text-secondary-strong">{organization.display_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Kategori</dt>
                <dd className="mt-0.5 text-sm text-text-secondary-strong">{organization.category ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Lokasi</dt>
                <dd className="mt-0.5 text-sm text-text-secondary-strong">{organization.location ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Email publik</dt>
                <dd className="mt-0.5 text-sm text-text-secondary-strong">{organization.public_contact ?? '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="mt-5 rounded-[12px] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text">Deskripsi</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary-strong">
              {organization.description ?? 'Belum ada deskripsi. Tambahkan dan ambil alasan sponsor di antara peluang yang tersedia.'}
            </p>
          </section>

          {verification.status !== 'approved' ? (
            <section className="mt-5 rounded-[12px] border border-warning/30 bg-warning/10 px-5 py-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-warning-strong" aria-hidden="true" />
                <div>
                  <h2 className="text-sm font-semibold text-text">Persetujuan verifikasi</h2>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary-strong">
                    {verification.status === 'draft'
                      ? 'Lengkapi data usaha sebelum fitur sponsor aktif.'
                      : verification.status === 'submitted'
                      ? 'Menunggu pemeriksaan admin.'
                      : `Status: ${verification.status.replace(/_/g, ' ')}.`}
                  </p>
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <aside>
          <div className="rounded-[12px] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text">Atur profil publik</h2>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary-strong">
              Pilih yang boleh dilihat orang luar. Data sensitif tetap tampil hanya setelah verifikasi.
            </p>

            <form method="post" action="/sponsor/organizations" className="mt-4 space-y-5">
              <div className="space-y-1.5">
                <Field
                  label="Nama badan usaha"
                  htmlFor="legal_name"
                  required
                  hint="Digunakan pada profil publik dan dalam kerja sama."
                >
                  <Input id="legal_name" name="legal_name" defaultValue={organization.legal_name} />
                </Field>
              </div>

              <div className="space-y-1.5">
                <Field
                  label="Nama tampilan"
                  htmlFor="display_name"
                  required
                  hint="Pilih nama yang ingin ditampilkan orang lain."
                >
                  <Input id="display_name" name="display_name" defaultValue={organization.display_name} />
                </Field>
              </div>

              <div className="space-y-1.5">
                <Field
                  label="Deskripsi"
                  htmlFor="description"
                  hint="Bisa lebih dari 1 baris, ditampilkan pada profil publik."
                >
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={organization.description}
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Field label="Kategori" htmlFor="category">
                    <Input id="category" name="category" defaultValue={organization.category} />
                  </Field>
                </div>
                <div className="space-y-1.5">
                  <Field label="Lokasi" htmlFor="location">
                    <Input id="location" name="location" defaultValue={organization.location} />
                  </Field>
                </div>
              </div>

              <div className="space-y-1.5">
                <Field
                  label="Email kontak publik"
                  htmlFor="public_contact"
                  hint="Hanya publik; buat akun khusus jika ingin email terverifikasi."
                >
                  <Input id="public_contact" name="public_contact" defaultValue={organization.public_contact} />
                </Field>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="public_visibility" className="flex items-center gap-2 text-sm font-medium text-text">
                  <input
                    id="public_visibility"
                    name="public_visibility"
                    type="checkbox"
                    checked={Boolean(organization.public_visibility)}
                    onChange={(event) => document.getElementById('public_visibility').value = event.target.checked}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  Tampilkan profil ini di direktori publik
                </label>
              </div>

              <div className="space-y-1.5">
                <Field label="Preferensi menerima proposal" htmlFor="proposal_preference" required>
                  <Select id="proposal_preference" name="proposal_preference" defaultValue={organization.proposal_preference}>
                    <option value="">Pilih preferensi</option>
                    {preferences.map((pref) => (
                      <option key={pref.value} value={pref.value}>{pref.label}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="flex flex-col gap-3 pt-3">
                <button
                  type="submit"
                  className={buttonClasses({ size: 'lg' })}
                >
                  Simpan profil
                </button>
                <Link href="/sponsor/dashboard" className={buttonClasses({ variant: 'outline' })}>
                  Batal
                </Link>
              </div>
            </form>
          </div>

          <div className="rounded-[12px] border border-border bg-background-muted p-5">
            <h2 className="text-sm font-semibold text-text">Status verifikasi</h2>
            <dl className="mt-3 divide-y divide-border">
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-text-secondary-strong">Status</span>
                <StatusBadge status={verification.status} />
              </div>
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-text-secondary-strong">Diajukan</span>
                <span className="tabular-nums text-text">{verification.submitted_at ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-text-secondary-strong">Ditinjau</span>
                <span className="tabular-nums text-text">{verification.reviewed_at ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-text-secondary-strong">Alasan publik</span>
                <dd className="truncate text-text">{verification.decision_reason_public ?? '—'}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
