import { Link, usePage } from '@inertiajs/react';
import { motion } from 'motion/react';
import { ArrowLeft, FileCheck2, ShieldCheck, Handshake } from 'lucide-react';
import Logo from '../components/Logo';

const defaultFeatures = [
  {
    icon: FileCheck2,
    text: 'Metrik audiens membawa label sumber dan periode yang dapat diverifikasi.',
  },
  {
    icon: ShieldCheck,
    text: 'Pemeriksaan identitas usaha internal untuk menjaga keamanan ekosistem.',
  },
  {
    icon: Handshake,
    text: 'Kesepakatan dan hak sponsorship tercatat sebelum kerja sama dimulai.',
  },
];

export default function AuthLayout({
  title,
  description,
  children,
  asideTitle,
  asideBody,
  features = defaultFeatures,
  badge = 'Ruang kerja sponsorship',
  maxWidth = 'max-w-[480px]',
}) {
  const { auth } = usePage().props;

  return (
    <div className="min-h-screen bg-background text-text antialiased selection:bg-primary-soft selection:text-text">
      <div className="grid min-h-screen w-full lg:grid-cols-12">
        {/* ── Aside ── */}
        <aside className="relative hidden border-r border-border bg-background-muted lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:px-10 lg:py-12 xl:col-span-5 xl:px-14">
          <div className="flex items-center">
            <Logo />
          </div>

          <div className="my-10 max-w-[26rem]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs font-medium tracking-[0.01em] text-primary-strong">
                {badge}
              </p>
              <h2 className="mt-3 text-[clamp(2rem,2.7vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-text">
                {asideTitle ?? 'Keputusan yang baik dimulai dari berkas yang jelas.'}
              </h2>
              <p className="mt-4 max-w-[24rem] text-sm leading-relaxed text-text-secondary-strong">
                {asideBody ??
                  'SponsorIn menyusun informasi event, sumber data audiens, dan riwayat kerja sama dalam satu tempat yang bisa diperiksa.'}
              </p>
            </motion.div>

            <motion.ol
              className="mt-10 divide-y divide-border border-y border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.12 }}
            >
              {features.map((feature, index) => {
                const text = typeof feature === 'string' ? feature : feature.text;

                return (
                  <li key={index} className="flex gap-4 py-3.5">
                    <span className="w-5 shrink-0 pt-0.5 text-[11px] font-medium tabular-nums text-primary-strong">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-[13px] leading-relaxed text-text-secondary-strong">
                      {text}
                    </p>
                  </li>
                );
              })}
            </motion.ol>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-text-secondary-strong transition-colors hover:text-text"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Kembali ke beranda
            </Link>
            <span className="text-[11px] text-text-secondary-strong">
              © {new Date().getFullYear()} SponsorIn
            </span>
          </div>
        </aside>

        {/* ── Form ── */}
        <main className="flex flex-col px-5 py-6 sm:px-8 lg:col-span-7 lg:justify-center lg:px-12 lg:py-12 xl:px-20">
          <div className="flex items-center justify-between border-b border-border pb-5 lg:hidden">
            <Logo />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-secondary-strong transition-colors hover:text-text"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Beranda
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-8 sm:py-12 lg:py-0">
            <div className={`w-full ${maxWidth}`}>
              <motion.div
                className="rounded-[14px] border border-border bg-surface p-5 sm:p-8 lg:p-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-6">
                  <h1 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.03em] text-text">
                    {title}
                  </h1>
                  {description ? (
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary-strong">
                      {description}
                    </p>
                  ) : null}
                </div>

                {children}
              </motion.div>

              {!auth?.user ? (
                <div className="mt-5 flex items-start gap-2.5 px-1 text-[11px] leading-relaxed text-text-secondary-strong">
                  <ShieldCheck
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-strong"
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
            <p className="text-xs text-text-secondary-strong">
              © {new Date().getFullYear()} SponsorIn · Platform Kolaborasi Sponsorship
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
