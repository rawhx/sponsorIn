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
          className="space-y-2.5"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
        >
          {flash.success ? (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-800 shadow-xs">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <p className="flex-1 leading-relaxed">{flash.success}</p>
            </div>
          ) : null}
          {flash.error ? (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-800 shadow-xs">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <p className="flex-1 leading-relaxed">{flash.error}</p>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
