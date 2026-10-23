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
    description: 'Mencari event dan mengelola kerja sama pendanaan.',
  },
  {
    value: 'eo',
    label: 'Event Organizer',
    icon: CalendarDays,
    description: 'Menyusun event dan mengajukan proposal sponsorship.',
  },
];

const registerFeatures = [
  {
    icon: Briefcase,
    text: 'Event dan paket tampil dengan sumber data audiens yang jelas.',
  },
  {
    icon: ShieldCheck,
    text: 'Verifikasi usaha menjaga kedua pihak tetap aman.',
  },
  {
    icon: CalendarDays,
    text: 'Penawaran dan kesepakatan tercatat dalam satu riwayat.',
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
  const label = tooShort ? 'Minimal 10 karakter' : score <= 1 ? 'Cukup' : score === 2 ? 'Baik' : 'Kuat';

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
                  ? 'bg-warning'
                  : 'bg-primary-strong'
                : 'bg-background-muted'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs', tooShort ? 'text-warning-strong' : 'text-text-secondary-strong')}>
        Kekuatan kata sandi: <span className="font-medium">{label}</span>
      </p>
    </div>
  );
}

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="space-y-3.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] border border-primary/20 bg-primary/10 text-primary-strong">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          {description ? <p className="mt-0.5 text-xs leading-relaxed text-text-secondary-strong">{description}</p> : null}
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
      title="Buat akun SponsorIn"
      description="Pilih peran, lengkapi identitas dasar, dan mulai dari satu berkas yang bisa dibaca."
      features={registerFeatures}
      asideTitle="Mulai dari berkas yang jelas, bukan janji."
      asideBody="Daftarkan brand atau organisasi Anda untuk melihat peluang, mengajukan proposal, dan menyimpan riwayat kerja sama."
      maxWidth="max-w-[560px]"
    >
      <Head title="Daftar Akun" />

      <form onSubmit={submit} className="space-y-6">
        <fieldset>
          <legend className="mb-2.5 flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-text">Daftar sebagai</span>
            <span className="text-xs text-text-secondary-strong">Pilih satu peran</span>
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = data.role === role.value;

              return (
                <label
                  key={role.value}
                  className={cn(
                    'relative flex cursor-pointer gap-3 rounded-[10px] border p-3 transition-colors duration-150',
                    isSelected
                      ? 'border-primary-strong bg-primary/8'
                      : 'border-border bg-surface hover:border-primary-soft hover:bg-hover'
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
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border',
                      isSelected
                        ? 'border-primary-strong bg-primary-strong text-white'
                        : 'border-border bg-background-muted text-text-secondary-strong'
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-text">{role.label}</span>
                      {isSelected ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-strong text-white">
                          <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-text-secondary-strong">
                      {role.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.role ? <p className="mt-1.5 text-xs text-danger-strong">{errors.role}</p> : null}
        </fieldset>

        <FormSection
          icon={User}
          title="Identitas akun"
          description="Email kerja aktif untuk menerima tautan verifikasi."
        >
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Nama lengkap" htmlFor="name" error={errors.name} required>
              <Input
                id="name"
                icon={User}
                autoComplete="name"
                autoFocus
                value={data.name}
                onChange={(event) => setData('name', event.target.value)}
                error={errors.name}
                placeholder="Sarah Pratama"
              />
            </Field>

            <Field label="Email kerja" htmlFor="email" error={errors.email} required>
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
          </div>

          <Field
            label={data.role === 'sponsor' ? 'Nama perusahaan / brand' : 'Nama organisasi / kepanitiaan'}
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
              placeholder={data.role === 'sponsor' ? 'PT Brand Inovasi Nusantara' : 'Komunitas Kreatif Indonesia'}
            />
          </Field>
        </FormSection>

        <FormSection
          icon={LockKeyhole}
          title="Keamanan akun"
          description="Minimal 10 karakter. Kombinasi huruf dan angka membuatnya lebih kuat."
        >
          <div className="grid items-start gap-3.5 sm:grid-cols-2">
            <div className="space-y-2">
              <Field
                label="Kata sandi"
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
                  placeholder="Buat kata sandi"
                />
              </Field>
              <PasswordStrength value={data.password} />
            </div>

            <div className="space-y-1.5">
              <Field
                label="Ulangi kata sandi"
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
                  placeholder="Ketik ulang"
                />
              </Field>
              {passwordMatched && !errors.password_confirmation ? (
                <p className="flex items-center gap-1.5 text-xs text-success-strong">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Kata sandi cocok.
                </p>
              ) : null}
              {passwordMismatch ? (
                <p className="text-xs text-warning-strong">Kata sandi belum cocok.</p>
              ) : null}
            </div>
          </div>
        </FormSection>

        <Button type="submit" size="lg" className="w-full" loading={processing}>
          {!processing ? <UserPlus className="h-4 w-4" aria-hidden="true" /> : null}
          Buat akun
        </Button>
      </form>

      <div className="mt-5 border-t border-border pt-4 text-center text-sm text-text-secondary-strong">
        Sudah memiliki akun?{' '}
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium text-primary-strong underline decoration-primary/30 underline-offset-4 transition-colors hover:text-text"
        >
          Masuk ke akun Anda
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </AuthLayout>
  );
}
