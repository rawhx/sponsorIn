import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, KeyRound, ArrowLeft, Send, ShieldCheck, MailCheck } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/Button';
import { Field, Input } from '../../components/Form';
import FlashMessages from '../../components/FlashMessages';

const forgotFeatures = [
  {
    icon: KeyRound,
    text: 'Tautan pengaturan ulang kata sandi hanya aktif dalam periode waktu terbatas.',
  },
  {
    icon: ShieldCheck,
    text: 'Dokumen verifikasi legal dan riwayat proposal Anda tetap terenkripsi dan aman.',
  },
  {
    icon: MailCheck,
    text: 'Instruksi pemulihan akun akan dikirimkan langsung ke alamat email terdaftar.',
  },
];

export default function ForgotPassword() {
  const { data, setData, post, processing, errors } = useForm({ email: '' });

  function submit(event) {
    event.preventDefault();
    post('/forgot-password');
  }

  return (
    <AuthLayout
      title="Atur Ulang Kata Sandi"
      description="Masukkan alamat email akun SponsorIn Anda. Kami akan mengirimkan tautan pemulihan kata sandi."
      features={forgotFeatures}
      asideTitle="Akses dipulihkan tanpa mengurangi keamanan data Anda."
      asideBody="Tautan pemulihan berlaku sementara dan hanya dapat digunakan satu kali. Data usaha dan arsip proposal Anda tetap terlindungi di ruang kerja."
    >
      <Head title="Lupa Kata Sandi" />
      <FlashMessages />

      <form onSubmit={submit} className="space-y-5">
        <Field label="Alamat Email Terdaftar" htmlFor="email" error={errors.email} required>
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

        <Button
          type="submit"
          size="lg"
          className="w-full flex items-center justify-center gap-2 mt-2"
          disabled={processing}
        >
          {processing ? (
            'Mengirimkan instruksi…'
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>Kirim Tautan Pemulihan</span>
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs sm:text-sm text-slate-500">
        Sudah mengingat kata sandi?{' '}
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Kembali ke halaman masuk
        </Link>
      </div>
    </AuthLayout>
  );
}
