import { useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { Flag, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import { Field, Select, Textarea } from './Form';

/**
 * Tombol + dialog pelaporan penyalahgunaan (PRD ADM-02).
 * targetType: 'event' | 'review' | 'account'. Untuk 'account', targetId adalah ID organisasi.
 */
export default function ReportDialog({ targetType, targetId, label = 'Laporkan', title, description }) {
  const { reportReasons } = usePage().props;
  const reasons = reportReasons?.[targetType] ?? [];
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    target_type: targetType,
    target_id: targetId,
    reason: '',
    details: '',
  });

  function close() {
    setOpen(false);
    reset('reason', 'details');
    clearErrors();
  }

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') close();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    const timer = window.setTimeout(() => dialogRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (reasons.length === 0) return null;

  function submit(event) {
    event.preventDefault();
    post('/reports', {
      preserveScroll: true,
      onSuccess: () => close(),
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary-strong underline-offset-4 hover:text-danger-strong hover:underline"
      >
        <Flag className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </button>

      {createPortal(
        <AnimatePresence>
          {open ? (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <button type="button" aria-label="Tutup dialog" className="absolute inset-0 bg-text/25 backdrop-blur-[2px]" onClick={close} />
              <motion.form
                ref={dialogRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-title"
                onSubmit={submit}
                className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[14px] border border-border bg-surface p-5 shadow-[0_18px_50px_-24px_rgba(52,59,50,0.45)] sm:p-6"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  onClick={close}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-text-muted transition-colors hover:bg-hover hover:text-text"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>

                <h2 id="report-title" className="pr-8 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-text">
                  {title ?? 'Laporkan penyalahgunaan'}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary-strong">
                  {description ?? 'Laporan ditinjau oleh tim SponsorIn. Identitas pelapor tidak ditampilkan kepada pihak yang dilaporkan.'}
                </p>

                <div className="mt-5 space-y-4">
                  <Field label="Alasan" htmlFor="report_reason" error={errors.reason} required>
                    <Select id="report_reason" value={data.reason} onChange={(event) => setData('reason', event.target.value)} error={errors.reason} required>
                      <option value="">Pilih alasan</option>
                      {reasons.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Konteks tambahan" htmlFor="report_details" error={errors.details} hint="Opsional, maks. 1.000 karakter">
                    <Textarea
                      id="report_details"
                      rows={4}
                      maxLength={1000}
                      value={data.details}
                      onChange={(event) => setData('details', event.target.value)}
                      error={errors.details}
                      placeholder="Jelaskan apa yang tidak sesuai. Jangan sertakan data pribadi sensitif."
                    />
                  </Field>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={close} disabled={processing} className="w-full sm:w-auto">
                    Batal
                  </Button>
                  <Button type="submit" loading={processing} className="w-full sm:w-auto">
                    Kirim laporan
                  </Button>
                </div>
              </motion.form>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
