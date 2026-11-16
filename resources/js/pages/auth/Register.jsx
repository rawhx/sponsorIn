import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
} from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/Button';
import { Field, Input, PasswordInput } from '../../components/Form';
import { cn } from '../../lib/utils';

const roles = [
  {
    value: 'sponsor',
    label: 'Brand Sponsor',
    icon: Briefcase,
    description: 'Mencari event potensial dan mengelola kerja sama pendanaan.',
  },
  {
    value: 'eo',
    label: 'Event Organizer',
    icon: CalendarDays,
    description: 'Mempublikasikan event dan mengajukan penawaran sponsorship.',
  },
];

const registerFeatures = [
  {
    icon: Briefcase,
    text: 'Event dan paket sponsorship tampil dengan sumber data audiens yang jelas.',
  },
  {
    icon: ShieldCheck,
    text: 'Verifikasi legalitas usaha menjaga kedua pihak tetap aman.',
  },
  {
    icon: CalendarDays,
    text: 'Penawaran dan kesepakatan tercatat rapi dalam satu riwayat resmi.',
  },
];

function scorePassword(value) {
  if (!value) return 0;

  let score = 0;
  if (value.length >= 10) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 1;

  return score;
}

function PasswordStrength({ value }) {
  if (!value) return null;

  const score = scorePassword(value);
  const tooShort = value.length < 10;
  const filled = tooShort ? 1 : Math.max(1, score);
  const label = tooShort ? 'Minimal 10 karakter' : score <= 1 ? 'Cukup' : score === 2 ? 'Baik' : 'Sangat Kuat';

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-150',
              index < filled
                ? tooShort
                  ? 'bg-amber-400'
                  : 'bg-emerald-600'
                : 'bg-slate-200'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs', tooShort ? 'text-amber-600 font-medium' : 'text-slate-500')}>
        Kekuatan sandi: <span className="font-semibold text-slate-800">{label}</span>
      </p>
    </div>
  );
}

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="space-y-3.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {description ? <p className="text-xs leading-relaxed text-slate-500">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function Register({ selectedRole = 'sponsor' }) {
  const { data, setData, post, processing, errors } = useForm({
    role: selectedRole === 'eo' ? 'eo' : 'sponsor',
    name: '',
    email: '',
    organization_name: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (selectedRole === 'eo' || selectedRole === 'sponsor') {
      setData('role', selectedRole);
    }
  }, [selectedRole]);

  const passwordMismatch = useMemo(
    () => data.password_confirmation.length > 0 && data.password !== data.password_confirmation,
    [data.password, data.password_confirmation]
  );
  const passwordMatched = useMemo(
    () => data.password_confirmation.length > 0 && data.password === data.password_confirmation,
    [data.password, data.password_confirmation]
  );

  function submit(event) {
    event.preventDefault();
    post('/register');
  }

  return (
    <AuthLayout
      title="Daftar Akun Baru"
      description="Pilih peran Anda dan lengkapi data profil organisasi untuk memulai."
      features={registerFeatures}
      asideTitle="Mulai dari kolaborasi yang transparan dan terarah."
      asideBody="Daftarkan brand atau kepanitiaan event Anda untuk menjelajahi peluang, menyepakati sponsorship, dan menyimpan seluruh riwayat kerja sama."
      maxWidth="max-w-[560px]"
    >
      <Head title="Daftar Akun Baru" />

      <form onSubmit={submit} className="space-y-6">
        <fieldset>
          <legend className="mb-2.5 flex items-baseline justify-between gap-3">
            <span className="text-sm font-bold text-slate-900">Daftar Sebagai</span>
            <span className="text-xs text-slate-500">Pilih salah satu peran</span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = data.role === role.value;

              return (
                <label
                  key={role.value}
                  className={cn(
                    'relative flex cursor-pointer gap-3 rounded-xl border p-3.5 transition-all shadow-2xs',
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={isSelected}
                    onChange={() => setData('role', role.value)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 bg-slate-100 text-slate-500'
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{role.label}</span>
                      {isSelected ? (
                        <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                      {role.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.role ? <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.role}</p> : null}
        </fieldset>

        <FormSection
          icon={User}
          title="Identitas Akun"
          description="Gunakan email resmi aktif untuk verifikasi dan notifikasi."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Lengkap Narahubung" htmlFor="name" error={errors.name} required>
              <Input
                id="name"
                icon={User}
                autoComplete="name"
                autoFocus
                value={data.name}
                onChange={(event) => setData('name', event.target.value)}
                error={errors.name}
                placeholder="Nama Anda..."
              />
            </Field>

            <Field label="Alamat Email Resmi" htmlFor="email" error={errors.email} required>
              <Input
                id="email"
                type="email"
                icon={Mail}
                autoComplete="email"
                value={data.email}
                onChange={(event) => setData('email', event.target.value)}
                error={errors.email}
                placeholder="nama@perusahaan.com"
              />
            </Field>
          </div>

          <Field
            label={data.role === 'sponsor' ? 'Nama Perusahaan / Brand' : 'Nama Organisasi / Komunitas'}
            htmlFor="organization_name"
            error={errors.organization_name}
            required
          >
            <Input
              id="organization_name"
              icon={Building2}
              autoComplete="organization"
              value={data.organization_name}
              onChange={(event) => setData('organization_name', event.target.value)}
              error={errors.organization_name}
              placeholder={data.role === 'sponsor' ? 'PT Brand Nusantara...' : 'Kepanitiaan Event Kreatif...'}
            />
          </Field>
        </FormSection>

        <FormSection
          icon={LockKeyhole}
          title="Keamanan Sandi"
          description="Minimal 10 karakter. Kombinasikan huruf besar, kecil, dan angka."
        >
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Field
                label="Kata Sandi"
                htmlFor="password"
                error={errors.password}
                required
              >
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  value={data.password}
                  onChange={(event) => setData('password', event.target.value)}
                  error={errors.password}
                  placeholder="Buat kata sandi..."
                />
              </Field>
              <PasswordStrength value={data.password} />
            </div>

            <div className="space-y-1.5">
              <Field
                label="Ulangi Kata Sandi"
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
                  placeholder="Ulangi kata sandi..."
                />
              </Field>
              {passwordMatched && !errors.password_confirmation ? (
                <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Kata sandi cocok.
                </p>
              ) : null}
              {passwordMismatch ? (
                <p className="text-xs font-medium text-amber-600">Kata sandi belum cocok.</p>
              ) : null}
            </div>
          </div>
        </FormSection>

        <Button type="submit" size="lg" className="w-full mt-2" loading={processing}>
          {!processing ? <UserPlus className="h-4 w-4" aria-hidden="true" /> : null}
          Daftarkan Akun Sekarang
        </Button>
      </form>

      <div className="mt-5 border-t border-slate-100 pt-4 text-center text-xs sm:text-sm text-slate-500">
        Sudah memiliki akun?{' '}
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
        >
          Masuk ke akun Anda
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </AuthLayout>
  );
}
