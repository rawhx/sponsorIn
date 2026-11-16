import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  processing = false,
  tone = 'danger',
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === 'Escape') onCancel?.();
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
  }, [open, onCancel]);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Tutup dialog"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCancel}
          />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={description ? 'confirm-description' : undefined}
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-7"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onCancel}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <span
              className={
                tone === 'danger'
                  ? 'inline-flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-4 ring-rose-50/50'
                  : 'inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-4 ring-amber-50/50'
              }
            >
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>

            <h2 id="confirm-title" className="mt-4 text-lg font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            {description ? (
              <p id="confirm-description" className="mt-2 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={onCancel} disabled={processing} className="w-full sm:w-auto">
                {cancelLabel}
              </Button>
              <Button
                variant={tone === 'danger' ? 'destructive' : 'primary'}
                onClick={onConfirm}
                loading={processing}
                className="w-full sm:w-auto"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
