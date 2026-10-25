import { Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock, Handshake } from 'lucide-react';
import { buttonClasses } from '../Button';

/**
 * Panel konfirmasi ringkasan kesepakatan (PRD PROP-04).
 * Sponsorship baru tercatat setelah sponsor DAN EO sama-sama mengonfirmasi.
 */
export default function AgreementPanel({ proposal, role }) {
  const form = useForm({});

  if (proposal.status !== 'accepted') return null;

  const prefix = role === 'sponsor' ? '/sponsor' : '/eo';
  const confirmUrl = role === 'sponsor' ? `/sponsor/proposals/${proposal.id}/sponsorship` : `/eo/proposals/${proposal.id}/agreement`;
  const agreement = proposal.agreement ?? { viewer_confirmed: false, counterpart_confirmed: false };
  const canConfirm = !agreement.viewer_confirmed || agreement.counterpart_confirmed;

  if (proposal.sponsorship_id) {
    return (
      <div className="rounded-[12px] border border-border bg-background-muted p-5">
        <h2 className="text-sm font-semibold text-text">Kerja sama</h2>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary-strong">
          Ringkasan kesepakatan sudah dikonfirmasi kedua pihak dan tercatat sebagai kerja sama.
        </p>
        <Link href={`${prefix}/sponsorships/${proposal.sponsorship_id}`} className={buttonClasses({ className: 'mt-3 w-full justify-center' })}>
          <Handshake className="h-4 w-4" aria-hidden="true" />
          Buka kerja sama
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-border bg-background-muted p-5">
      <h2 className="text-sm font-semibold text-text">Konfirmasi kesepakatan</h2>
      <p className="mt-2 text-xs leading-relaxed text-text-secondary-strong">
        Proposal yang diterima belum otomatis menjadi kerja sama. Kerja sama dicatat setelah kedua pihak mengonfirmasi ringkasan kesepakatan.
      </p>
      <ul className="mt-3 space-y-1.5 text-xs text-text-secondary-strong">
        <li className="flex items-center gap-2">
          {agreement.viewer_confirmed ? <CheckCircle2 className="h-3.5 w-3.5 text-success-strong" aria-hidden="true" /> : <Clock className="h-3.5 w-3.5 text-warning-strong" aria-hidden="true" />}
          Konfirmasi Anda: <span className="font-medium text-text">{agreement.viewer_confirmed ? 'sudah' : 'belum'}</span>
        </li>
        <li className="flex items-center gap-2">
          {agreement.counterpart_confirmed ? <CheckCircle2 className="h-3.5 w-3.5 text-success-strong" aria-hidden="true" /> : <Clock className="h-3.5 w-3.5 text-warning-strong" aria-hidden="true" />}
          Konfirmasi pihak lain: <span className="font-medium text-text">{agreement.counterpart_confirmed ? 'sudah' : 'belum'}</span>
        </li>
      </ul>
      {canConfirm ? (
        <button
          type="button"
          onClick={() => form.post(confirmUrl, { preserveScroll: true })}
          className={buttonClasses({ className: 'mt-4 w-full justify-center' })}
          disabled={form.processing}
        >
          <Handshake className="h-4 w-4" aria-hidden="true" />
          {form.processing ? 'Menyimpan…' : 'Konfirmasi ringkasan kesepakatan'}
        </button>
      ) : (
        <p className="mt-4 text-xs text-text-secondary-strong">Menunggu konfirmasi dari pihak lain.</p>
      )}
    </div>
  );
}
