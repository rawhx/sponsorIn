import { Field, Input, Textarea } from './Form';

/** Kolom profil yang sama untuk EO dan sponsor (nama tampilan, deskripsi, lokasi, kategori, kontak publik). */
export default function ProfileFormFields({ data, setData, errors, nameLabel = 'Nama tampilan' }) {
  return (
    <>
      <Field label={nameLabel} htmlFor="display_name" required error={errors.display_name}>
        <Input id="display_name" value={data.display_name} onChange={(event) => setData('display_name', event.target.value)} error={errors.display_name} maxLength={160} required />
      </Field>
      <Field label="Deskripsi" htmlFor="description" error={errors.description} hint="Maks. 2.000 karakter">
        <Textarea id="description" rows={5} value={data.description ?? ''} onChange={(event) => setData('description', event.target.value)} error={errors.description} maxLength={2000} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Lokasi" htmlFor="location" error={errors.location}>
          <Input id="location" value={data.location ?? ''} onChange={(event) => setData('location', event.target.value)} error={errors.location} maxLength={160} placeholder="mis. Bandung, Jawa Barat" />
        </Field>
        <Field label="Kategori" htmlFor="category" error={errors.category}>
          <Input id="category" value={data.category ?? ''} onChange={(event) => setData('category', event.target.value)} error={errors.category} maxLength={80} placeholder="mis. Musik, Teknologi, F&B" />
        </Field>
      </div>
      <Field label="Kontak publik" htmlFor="public_contact" error={errors.public_contact} hint="Tampil di profil publik">
        <Input id="public_contact" value={data.public_contact ?? ''} onChange={(event) => setData('public_contact', event.target.value)} error={errors.public_contact} maxLength={255} placeholder="Email atau nomor yang boleh dilihat publik" />
      </Field>
    </>
  );
}
