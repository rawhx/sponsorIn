import { Link, usePage } from '@inertiajs/react';
import { motion } from 'motion/react';
import { ArrowLeft, FileCheck2, ShieldCheck, Handshake } from 'lucide-react';
import Logo from '../components/Logo';

const defaultFeatures = [
  {
    icon: FileCheck2,
    text: 'Metrik audiens membawa label sumber dan periode yang dapat diverifikasi secara transparan.',
  },
  {
    icon: ShieldCheck,
    text: 'Pemeriksaan identitas usaha internal untuk menjaga keamanan ekosistem sponsorship.',
  },
  {
    icon: Handshake,
    text: 'Kesepakatan dan hak sponsorship tercatat rapi sebelum kerja sama resmi dimulai.',
  },
];

export default function AuthLayout({
  title,
  description,
  children,
  asideTitle,
  asideBody,
  features = defaultFeatures,
  badge = 'Ruang Kerja Sponsorship',
  maxWidth = 'max-w-[480px]',
}) {
  const { auth } = usePage().props;

  return (
    <div className="auth-shell min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <div className="grid min-h-screen w-full lg:grid-cols-12">
        {/* ── Aside ── */}
        <aside className="relative hidden border-r border-slate-200 bg-white lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:px-10 lg:py-12 xl:col-span-5 xl:px-14">
          <div className="flex items-center">
            <Logo />
          </div>

          <div className="my-10 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
                {badge}
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 xl:text-4xl">
                {asideTitle ?? 'Keputusan yang baik dimulai dari berkas yang jelas.'}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {asideBody ??
                  'SponsorIn menyusun informasi event, sumber data audiens, dan riwayat kerja sama dalam satu tempat yang transparan dan dapat diperiksa.'}
              </p>
            </motion.div>

            <motion.ol
              className="mt-10 divide-y divide-slate-100 border-y border-slate-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              {features.map((feature, index) => {
                const text = typeof feature === 'string' ? feature : feature.text;

                return (
                  <li key={index} className="flex gap-4 py-4">
                    <span className="w-5 shrink-0 pt-0.5 text-xs font-bold tabular-nums text-emerald-700">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {text}
                    </p>
                  </li>
                );
              })}
            </motion.ol>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Kembali ke beranda
            </Link>
            <span className="text-xs text-slate-400">
              © {new Date().getFullYear()} SponsorIn
            </span>
          </div>
        </aside>

        {/* ── Form ── */}
        <main className="flex flex-col px-5 py-6 sm:px-8 lg:col-span-7 lg:justify-center lg:px-12 lg:py-12 xl:px-20">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5 lg:hidden">
            <Logo />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Beranda
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-8 sm:py-12 lg:py-0">
            <div className={`w-full ${maxWidth}`}>
              <motion.div
                className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {title}
                  </h1>
                  {description ? (
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {description}
                    </p>
                  ) : null}
                </div>

                {children}
              </motion.div>

              {!auth?.user ? (
                <div className="mt-5 flex items-start gap-2.5 px-2 text-xs leading-relaxed text-slate-500">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  <p>
                    Data verifikasi dilindungi enkripsi dan hanya dipakai untuk validasi internal
                    SponsorIn, tidak dipublikasikan ke profil publik.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-auto pt-6 text-center lg:hidden">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} SponsorIn · Platform Kolaborasi Sponsorship
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
