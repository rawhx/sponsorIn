import { useForm } from '@inertiajs/react';
import { formatDate } from '../../lib/utils';
import Button from '../Button';
import { Textarea } from '../Form';

function formatDateTime(value) {
  if (!value) return '—';
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SponsorshipChat({ sponsorship, basePath }) {
  const { data, setData, post, processing, errors, reset } = useForm({ body: '' });

  function submit(event) {
    event.preventDefault();
    post(`${basePath}/${sponsorship.id}/messages`, {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  }

  return (
    <section className="rounded-[12px] border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-text">Chat kerja sama</h2>
        <p className="mt-1 text-xs text-text-secondary-strong">
          Percakapan ini terhubung dengan proposal dan dapat dilihat oleh kedua pihak.
        </p>
      </div>

      {sponsorship.messages.length > 0 ? (
        <div className="divide-y divide-border">
          {sponsorship.messages.map((message) => (
            <div key={message.id} className="px-5 py-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm font-medium text-text">
                  {message.sender_user_id === sponsorship.viewer_user_id ? 'Anda' : message.sender_name}
                </p>
                <p className="text-xs tabular-nums text-text-muted">{formatDateTime(message.created_at)}</p>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-text-secondary-strong">{message.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-5 py-6 text-sm text-text-secondary-strong">
          Belum ada pesan. Mulai percakapan untuk membahas detail kerja sama.
        </p>
      )}

      <form onSubmit={submit} className="space-y-3 border-t border-border px-5 py-4">
        <Textarea
          rows={3}
          value={data.body}
          onChange={(event) => setData('body', event.target.value)}
          placeholder="Tulis pesan untuk pihak lain…"
          error={errors.body}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={processing}>
            {processing ? 'Mengirim…' : 'Kirim pesan'}
          </Button>
        </div>
      </form>
    </section>
  );
}
