export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(value, options = {}) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
}

export function formatDateRange(start, end) {
  if (!start) return '—';
  if (!end || end === start) return formatDate(start);

  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function formatCurrency(amount, currency = 'IDR') {
  if (amount === null || amount === undefined) return 'Tidak ditentukan';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

const statusLabels = {
  draft: 'Draft',
  sent: 'Terkirim',
  submitted: 'Diajukan',
  under_review: 'Sedang ditinjau',
  needs_information: 'Perlu informasi',
  needs_changes: 'Perlu perbaikan',
  more_information_requested: 'Perlu informasi',
  negotiation: 'Negosiasi',
  accepted: 'Diterima',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  withdrawn: 'Ditarik',
  expired: 'Kedaluwarsa',
  suspended: 'Ditangguhkan',
  published: 'Terbit',
  closed: 'Ditutup',
  unpublished: 'Ditarik',
  active: 'Aktif',
  completion_requested: 'Menunggu penyelesaian',
  completed: 'Selesai',
  disputed: 'Sengketa',
  needs_admin_review: 'Ditinjau admin',
  cancelled: 'Dibatalkan',
  hidden: 'Disembunyikan',
  open: 'Terbuka',
  in_review: 'Ditinjau',
  resolved: 'Selesai ditangani',
  dismissed: 'Ditolak',
};

const statusTones = {
  draft: 'neutral',
  sent: 'info',
  submitted: 'info',
  under_review: 'warning',
  needs_information: 'warning',
  needs_changes: 'warning',
  more_information_requested: 'warning',
  negotiation: 'info',
  accepted: 'success',
  approved: 'success',
  rejected: 'danger',
  withdrawn: 'neutral',
  expired: 'neutral',
  suspended: 'danger',
  published: 'success',
  closed: 'neutral',
  unpublished: 'neutral',
  active: 'success',
  completion_requested: 'warning',
  completed: 'success',
  disputed: 'danger',
  needs_admin_review: 'warning',
  cancelled: 'neutral',
  hidden: 'danger',
  open: 'warning',
  in_review: 'info',
  resolved: 'success',
  dismissed: 'neutral',
};

export function statusLabel(status) {
  return statusLabels[status] ?? status;
}

export function statusTone(status) {
  return statusTones[status] ?? 'neutral';
}

export const legalFormLabels = {
  pt: 'PT',
  cv: 'CV',
  firma: 'Firma',
  koperasi: 'Koperasi',
  yayasan: 'Yayasan',
  perorangan: 'Usaha perorangan',
  lainnya: 'Lainnya',
};

export const supportTypeLabels = {
  cash: 'Dana tunai',
  product: 'Produk',
  service: 'Layanan',
  media: 'Media',
  other: 'Lainnya',
};

export const evidenceTypeLabels = {
  projection: 'Proyeksi',
  registration: 'Registrasi',
  tickets_sold: 'Tiket terjual',
  check_in: 'Check-in',
  past_event: 'Event sebelumnya',
  community_reach: 'Jangkauan komunitas',
};

export const proposalPreferenceLabels = {
  open: 'Menerima proposal',
  selective: 'Selektif',
  closed: 'Tertutup',
};

export const reportTargetLabels = {
  event: 'Event',
  review: 'Ulasan',
  account: 'Akun',
};
