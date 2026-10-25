import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import Button from '../Button';
import { Field, Textarea } from '../Form';

/** Pembatalan kerja sama oleh salah satu pihak selama pelaksanaan (status Aktif). */
export default function CancelSponsorshipForm({ action }) {
  const [open, setOpen] = useState(false);
  const { data, setData, post, processing, errors } = useForm({ reason: '' });

  if (!open) {
    return (
      <Button variant="ghost" className="w-full justify-center" onClick={() => setOpen(true)}>
        Batalkan kerja sama
      </Button>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        post(action, { preserveScroll: true });
      }}
      className="space-y-2 rounded-[8px] border border-border p-3"
    >
      <Field label="Alasan pembatalan" htmlFor="cancel_reason" error={errors.reason} required>
        <Textarea
          id="cancel_reason"
          rows={3}
          value={data.reason}
          onChange={(event) => setData('reason', event.target.value)}
          error={errors.reason}
          required
        />
      </Field>
      <p className="text-xs text-text-secondary-strong">Pembatalan tidak membuka ulasan dan akan diberitahukan ke pihak lain.</p>
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" size="sm" loading={processing}>
          Batalkan kerja sama
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Tutup
        </Button>
      </div>
    </form>
  );
}
