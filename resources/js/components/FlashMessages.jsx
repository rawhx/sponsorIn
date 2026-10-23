import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function FlashMessages() {
  const { flash } = usePage().props;
  const key = `${flash?.success ?? ''}|${flash?.error ?? ''}`;

  return (
    <AnimatePresence initial={false}>
      {(flash?.success || flash?.error) ? (
        <motion.div
          key={key}
          className="space-y-2"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
        >
          {flash.success ? (
            <div className="flex items-start gap-2.5 rounded-[10px] border border-success/25 bg-success/10 px-3.5 py-3 text-sm text-success-strong">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{flash.success}</p>
            </div>
          ) : null}
          {flash.error ? (
            <div className="flex items-start gap-2.5 rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger-strong">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{flash.error}</p>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
