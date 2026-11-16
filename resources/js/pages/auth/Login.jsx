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
      title="Masuk ke Akun Anda"
      description="Lanjutkan pengelolaan peluang, verifikasi usaha, atau proposal sponsorship."
      features={loginFeatures}
      asideTitle="Setiap keputusan punya jejak yang bisa ditelusuri."
      asideBody="SponsorIn menyatukan data event, sumber angka audiens, dan riwayat kerja sama agar kedua pihak membaca hal yang sama."
    >
      <Head title="Masuk Akun" />
      <FlashMessages />

      {status ? (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <p>{status}</p>
        </div>
      ) : null}

      <form onSubmit={submit} className="space-y-5">
        <Field label="Alamat Email" htmlFor="email" error={errors.email} required>
          <Input
            id="email"
            type="email"
            icon={Mail}
            autoComplete="email"
            autoFocus
            value={data.email}
            onChange={(event) => setData('email', event.target.value)}
            error={errors.email}
            placeholder="nama@perusahaan.com"
          />
        </Field>

        <Field label="Kata Sandi" htmlFor="password" error={errors.password} required>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={data.password}
            onChange={(event) => setData('password', event.target.value)}
            error={errors.password}
            placeholder="Masukkan kata sandi..."
          />
        </Field>

        <div className="flex items-center justify-between gap-4 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-xs sm:text-sm text-slate-600 select-none">
            <input
              type="checkbox"
              checked={data.remember}
              onChange={(event) => setData('remember', event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 accent-emerald-600 cursor-pointer"
            />
            Ingat saya di perangkat ini
          </label>
          <Link
            href="/forgot-password"
            className="text-xs sm:text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
          >
            Lupa kata sandi?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full mt-2" loading={processing}>
          {!processing ? <LogIn className="h-4 w-4" aria-hidden="true" /> : null}
          Masuk ke Ruang Kerja
        </Button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs sm:text-sm text-slate-500">
        Belum memiliki akun SponsorIn?{' '}
        <Link
          href="/register"
          className="inline-flex items-center gap-1 font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
        >
          Daftar sekarang
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </AuthLayout>
  );
}
