import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/Button';
import ProfileFormFields from '../../components/ProfileFormFields';

export default function Organization({ profile, preferences }) {
  const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
    display_name: profile.display_name ?? '',
    description: profile.description ?? '',
    location: profile.location ?? '',
    category: profile.category ?? '',
    public_contact: profile.public_contact ?? '',
    public_visibility: profile.public_visibility,
    proposal_preference: profile.proposal_preference,
  });

  function submit(event) {
    event.preventDefault();
    put('/sponsor/organizations', { preserveScroll: true });
  }

  return (
    <DashboardLayout eyebrow="Sponsor" title="Profil usaha">
      <Head title="Profil usaha" />

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        <div className="min-w-0 space-y-6">
          <div className="space-y-5 rounded-[12px] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text">Profil bisnis</h2>
            <ProfileFormFields data={data} setData={setData} errors={errors} nameLabel="Nama tampilan usaha" />
            <p className="text-xs leading-relaxed text-text-secondary-strong">
              Nama legal terdaftar: <span className="font-medium text-text">{profile.legal_name}</span>. Nama legal mengikuti dokumen verifikasi dan tidak dapat diubah di sini.
            </p>
          </div>

          <fieldset className="rounded-[12px] border border-border bg-surface p-5">
            <legend className="px-1 text-sm font-semibold text-text">Status menerima proposal</legend>
            <div className="mt-3 space-y-2.5">
              {preferences.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-[8px] border p-3 text-sm ${data.proposal_preference === option.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-hover'}`}
                >
                  <input
                    type="radio"
                    name="proposal_preference"
                    value={option.value}
                    checked={data.proposal_preference === option.value}
                    onChange={() => setData('proposal_preference', option.value)}
                    className="mt-0.5 h-4 w-4"
                  />
                  <span>
                    <span className="font-medium text-text">{option.label}</span>
                    <br />
                    <span className="text-xs text-text-secondary-strong">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.proposal_preference ? <p className="mt-2 text-xs text-danger-strong">{errors.proposal_preference}</p> : null}

            <label className="mt-4 flex items-start gap-3 rounded-[8px] border border-border bg-background-muted/50 p-3 text-sm text-text-secondary-strong">
              <input
                type="checkbox"
                checked={data.public_visibility}
                onChange={(event) => setData('public_visibility', event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border"
              />
              <span>
                <span className="font-medium text-text">Tampilkan profil bisnis kepada EO</span>
                <br />
                Bila dimatikan, EO tidak dapat menemukan atau mengirim proposal kepada Anda, apa pun status di atas.
              </span>
            </label>
          </fieldset>

          <div className="flex items-center gap-3">
            <Button type="submit" loading={processing}>
              Simpan perubahan
            </Button>
            {recentlySuccessful ? <p className="text-sm text-success-strong" role="status">Tersimpan.</p> : null}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[12px] border border-border bg-background-muted p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary-strong" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-text">Privasi data verifikasi</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary-strong">
              NIB, NPWP, dokumen, dan catatan review tidak pernah tampil di profil publik atau kepada EO. Hanya informasi pada formulir ini yang dapat dilihat pihak lain.
            </p>
          </div>
        </aside>
      </form>
    </DashboardLayout>
  );
}
