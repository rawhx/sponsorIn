import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, LogIn, ArrowRight, FileCheck2, ShieldCheck, Handshake } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/Button';
import { Field, Input, PasswordInput } from '../../components/Form';
import FlashMessages from '../../components/FlashMessages';

const loginFeatures = [
  {
    icon: FileCheck2,
    text: 'Proposal, jadwal event, dan catatan audiens ada di satu tempat.',
  },
  {
    icon: ShieldCheck,
    text: 'Identitas usaha diperiksa sebelum fitur sponsor aktif.',
  },
  {
    icon: Handshake,
    text: 'Riwayat negosiasi dan kerja sama tersimpan untuk kedua pihak.',
  },
];

export default function Login({ status }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  function submit(event) {
    event.preventDefault();
    post('/login', {
      onFinish: () => reset('password'),
    });
  }

  return (
    <AuthLayout
      title="Masuk ke ruang kerja"
      description="Lanjutkan pengelolaan peluang, verifikasi usaha, atau proposal sponsorship."
      features={loginFeatures}
      asideTitle="Setiap keputusan punya jejak yang bisa ditelusuri."
      asideBody="SponsorIn menyatukan data event, sumber angka audiens, dan riwayat kerja sama agar kedua pihak membaca hal yang sama."
    >
      <Head title="Masuk" />
      <FlashMessages />

      {status ? (
        <div className="mb-5 flex items-start gap-2.5 rounded-[10px] border border-success/30 bg-success/10 px-3.5 py-3 text-sm text-success-strong">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-strong" aria-hidden="true" />
          <p>{status}</p>
        </div>
      ) : null}

      <form onSubmit={submit} className="space-y-4 sm:space-y-5">
        <Field label="Email" htmlFor="email" error={errors.email} required>
          <Input
            id="email"
            type="email"
            icon={Mail}
            autoComplete="email"
            autoFocus
            value={data.email}
            onChange={(event) => setData('email', event.target.value)}
            error={errors.email}
            placeholder="nama@perusahaan.id"
          />
        </Field>

        <Field label="Kata sandi" htmlFor="password" error={errors.password} required>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={data.password}
            onChange={(event) => setData('password', event.target.value)}
            error={errors.password}
            placeholder="Masukkan kata sandi Anda"
          />
        </Field>

        <div className="flex items-center justify-between gap-4 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary-strong select-none">
            <input
              type="checkbox"
              checked={data.remember}
              onChange={(event) => setData('remember', event.target.checked)}
              className="h-4 w-4 rounded border-border text-primary-strong focus:ring-2 focus:ring-primary/20 accent-primary-strong"
            />
            Ingat saya
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-text-secondary-strong underline decoration-border underline-offset-4 transition-colors hover:text-text"
          >
            Lupa kata sandi?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={processing}>
          {!processing ? <LogIn className="h-4 w-4" aria-hidden="true" /> : null}
          Masuk
        </Button>
      </form>

      <div className="mt-6 border-t border-border pt-5 text-center text-sm text-text-secondary-strong">
        Belum punya akun?{' '}
        <Link
          href="/register"
          className="inline-flex items-center gap-1 font-medium text-primary-strong underline decoration-primary/30 underline-offset-4 transition-colors hover:text-text"
        >
          Daftar sebagai sponsor atau EO
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </AuthLayout>
  );
}
