import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { MailCheck, RefreshCw, LogOut, ArrowLeft, ShieldCheck, Clock, Mail } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/Button';
import FlashMessages from '../../components/FlashMessages';

const verifyFeatures = [
  {
    icon: MailCheck,
    text: 'Memastikan Anda menerima update proposal, revisi berkas, dan jadwal event penting.',
  },
  {
    icon: ShieldCheck,
    text: 'Mencegah akun spam untuk menjaga keaslian data audiens dan profil penyelenggara.',
  },
  {
    icon: Clock,
    text: 'Tautan verifikasi di email Anda aktif selama 60 menit untuk alasan keamanan.',
  },
];

export default function VerifyEmail({ status }) {
  const { auth } = usePage().props;
  const { post, processing } = useForm();

  function resend(event) {
    event.preventDefault();
    post('/email/verification-notification');
  }

  return (
    <AuthLayout
      title="Verifikasi email Anda"
      description="Satu langkah lagi sebelum ruang kerja terbuka. Buka email yang kami kirimkan untuk mengonfirmasi akun Anda."
      features={verifyFeatures}
      asideTitle="Satu langkah sebelum ruang kerja terbuka."
      asideBody="Verifikasi email memastikan pengingat kerja sama, keputusan kurasi, dan pemberitahuan penting sampai ke pihak yang tepat."
    >
      <Head title="Verifikasi Email" />
      <FlashMessages />

      {status ? (
        <div className="mb-5 flex items-start gap-2.5 rounded-[10px] border border-success/30 bg-success/10 px-3.5 py-3 text-sm text-success-strong">
          <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-strong" aria-hidden="true" />
          <p>{status}</p>
        </div>
      ) : null}

      <div className="rounded-[12px] border border-border bg-background-muted/40 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-border bg-surface text-primary-strong shadow-2xs">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Tautan dikirim ke alamat:
            </p>
            <p className="mt-1 break-all text-sm font-semibold text-text">
              {auth?.user?.email || 'email-anda@perusahaan.id'}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-border/80 pt-3.5">
          <p className="text-xs leading-relaxed text-text-secondary">
            Belum menerima email? Periksa folder spam atau promosi. Jika masih belum masuk, klik
            tombol di bawah untuk mengirim ulang tautan verifikasi.
          </p>
        </div>
      </div>

      <form onSubmit={resend} className="mt-5">
        <Button
          type="submit"
          size="lg"
          className="w-full flex items-center justify-center gap-2"
          disabled={processing}
        >
          <RefreshCw
            className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>{processing ? 'Mengirim ulang tautan…' : 'Kirim Ulang Tautan Verifikasi'}</span>
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-sm text-text-secondary-strong">
        <Link
          href="/"
          className="inline-flex items-center gap-1 font-medium hover:text-text transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Kembali ke beranda</span>
        </Link>
        <Link
          href="/logout"
          method="post"
          as="button"
          className="inline-flex items-center gap-1 font-medium text-danger-strong hover:text-danger hover:underline transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Keluar dari akun</span>
        </Link>
      </div>
    </AuthLayout>
  );
}
