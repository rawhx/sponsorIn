import { Head, Link, useForm } from '@inertiajs/react';
import { ExternalLink, Star } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/Button';
import { Field, Textarea } from '../../components/Form';
import ProfileFormFields from '../../components/ProfileFormFields';

export default function Profile({ profile }) {
  const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
    display_name: profile.display_name ?? '',
    description: profile.description ?? '',
    portfolio: profile.portfolio ?? '',
    location: profile.location ?? '',
    category: profile.category ?? '',
    public_contact: profile.public_contact ?? '',
    public_visibility: profile.public_visibility,
  });

  function submit(event) {
    event.preventDefault();
    put('/eo/profile', { preserveScroll: true });
  }

  const canViewPublic = profile.public_visibility && profile.published_event_count > 0;

  return (
    <DashboardLayout eyebrow="Penyelenggara" title="Profil publik">
      <Head title="Profil publik" />

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        <div className="min-w-0 space-y-5 rounded-[12px] border border-border bg-surface p-5">
          <ProfileFormFields data={data} setData={setData} errors={errors} nameLabel="Nama penyelenggara" />
          <Field label="Portofolio" htmlFor="portfolio" error={errors.portfolio} hint="Event dan pengalaman sebelumnya · maks. 3.000 karakter">
            <Textarea
              id="portfolio"
              rows={6}
              value={data.portfolio}
              onChange={(event) => setData('portfolio', event.target.value)}
              error={errors.portfolio}
              maxLength={3000}
              placeholder="Ceritakan event yang pernah diselenggarakan, skala, dan mitra sebelumnya."
            />
          </Field>
          <label className="flex items-start gap-3 rounded-[8px] border border-border bg-background-muted/50 p-3 text-sm text-text-secondary-strong">
            <input
              type="checkbox"
              checked={data.public_visibility}
              onChange={(event) => setData('public_visibility', event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            <span>
              <span className="font-medium text-text">Tampilkan di direktori penyelenggara</span>
              <br />
              Bila dimatikan, halaman profil publik Anda tidak dapat dibuka. Event yang terbit tetap tampil di pencarian.
            </span>
          </label>
          <div className="flex items-center gap-3">
            <Button type="submit" loading={processing}>
              Simpan profil
            </Button>
            {recentlySuccessful ? <p className="text-sm text-success-strong" role="status">Tersimpan.</p> : null}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[12px] border border-border bg-background-muted p-5">
            <h2 className="text-sm font-semibold text-text">Reputasi</h2>
            {profile.review_count > 0 ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-text">
                <Star className="h-4 w-4 text-warning-strong" aria-hidden="true" />
                <span className="font-medium tabular-nums">{Number(profile.rating_average).toFixed(1).replace('.', ',')} / 5</span>
                <span className="text-text-secondary-strong">({profile.review_count} ulasan)</span>
              </p>
            ) : (
              <p className="mt-3 text-sm text-text-secondary-strong">Belum ada ulasan.</p>
            )}
            <p className="mt-2 text-xs leading-relaxed text-text-secondary-strong">
              Rating berasal dari sponsorship yang tercatat selesai di SponsorIn. Anda tidak dapat mengubah atau menghapus ulasan, tetapi dapat melaporkannya.
            </p>
            {canViewPublic ? (
              <Link href={`/organizers/${profile.id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-strong hover:text-text">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Lihat tampilan publik
              </Link>
            ) : (
              <p className="mt-4 text-xs leading-relaxed text-text-muted">
                Halaman publik tersedia setelah ada minimal satu event terbit dan profil ditampilkan di direktori.
              </p>
            )}
          </div>
        </aside>
      </form>
    </DashboardLayout>
  );
}
