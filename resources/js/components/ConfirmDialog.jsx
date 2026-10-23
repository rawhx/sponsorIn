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
            className="absolute inset-0 bg-text/25 backdrop-blur-[2px]"
            onClick={onCancel}
          />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={description ? 'confirm-description' : undefined}
            className="relative w-full max-w-md rounded-[14px] border border-border bg-surface p-5 shadow-[0_18px_50px_-24px_rgba(52,59,50,0.45)] sm:p-6"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onCancel}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-text-muted transition-colors hover:bg-hover hover:text-text"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <span
              className={
                tone === 'danger'
                  ? 'inline-flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger-strong'
                  : 'inline-flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 text-warning-strong'
              }
            >
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>

            <h2 id="confirm-title" className="mt-4 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-text">
              {title}
            </h2>
            {description ? (
              <p id="confirm-description" className="mt-2 text-sm leading-relaxed text-text-secondary-strong">
                {description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
