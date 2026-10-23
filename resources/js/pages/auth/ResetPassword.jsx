import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, CheckCircle2, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/Button';
import { Field, Input, PasswordInput } from '../../components/Form';

const resetFeatures = [
  {
    icon: ShieldCheck,
    text: 'Pembaruan kata sandi langsung memperkuat proteksi akun sponsorship Anda.',
  },
  {
    icon: Lock,
    text: 'Gunakan kombinasi minimal 10 karakter untuk memastikan keamanan optimal.',
  },
  {
    icon: KeyRound,
    text: 'Setelah kata sandi diperbarui, Anda dapat langsung masuk ke ruang kerja.',
  },
];

export default function ResetPassword({ token, email }) {
  const { data, setData, post, processing, errors } = useForm({
    token,
    email: email ?? '',
    password: '',
    password_confirmation: '',
  });

  function submit(event) {
    event.preventDefault();
    post('/reset-password');
  }

  return (
    <AuthLayout
      title="Buat kata sandi baru"
      description="Gunakan kata sandi baru minimal 10 karakter. Setelah tersimpan, Anda akan dapat masuk kembali ke akun."
      features={resetFeatures}
      asideTitle="Perbarui kredensial untuk melanjutkan kerja sama."
      asideBody="Kombinasi kata sandi yang kuat menjaga integritas dokumen sponsorship, profil audiens, dan riwayat komunikasi brand Anda."
    >
      <Head title="Reset Kata Sandi" />

      <form onSubmit={submit} className="space-y-4 sm:space-y-5">
        <Field label="Alamat email" htmlFor="email" error={errors.email} required>
          <Input
            id="email"
            type="email"
            icon={Mail}
            autoComplete="email"
            value={data.email}
            onChange={(event) => setData('email', event.target.value)}
            error={errors.email}
            placeholder="nama@perusahaan.id"
          />
        </Field>

        <Field
          label="Kata sandi baru"
          htmlFor="password"
          error={errors.password}
          hint="Minimal 10 karakter"
          required
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            autoFocus
            value={data.password}
            onChange={(event) => setData('password', event.target.value)}
            error={errors.password}
            placeholder="Ketik kata sandi baru"
          />
        </Field>

        <Field
          label="Ulangi kata sandi baru"
          htmlFor="password_confirmation"
          error={errors.password_confirmation}
          required
        >
          <PasswordInput
            id="password_confirmation"
            autoComplete="new-password"
            value={data.password_confirmation}
            onChange={(event) => setData('password_confirmation', event.target.value)}
            error={errors.password_confirmation}
            placeholder="Ketik ulang kata sandi baru"
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          className="w-full flex items-center justify-center gap-2"
          disabled={processing}
        >
          {processing ? (
            'Menyimpan kata sandi…'
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Simpan Kata Sandi Baru</span>
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 border-t border-border pt-5 text-center text-sm text-text-secondary-strong">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium text-primary-strong underline decoration-primary/30 underline-offset-4 transition-colors hover:text-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Kembali ke halaman masuk
        </Link>
      </div>
    </AuthLayout>
  );
}
