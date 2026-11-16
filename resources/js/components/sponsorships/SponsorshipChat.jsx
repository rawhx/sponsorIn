import { useForm } from '@inertiajs/react';
import { MessageSquare, Send } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
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
    if (!data.body.trim()) return;
    post(`${basePath}/${sponsorship.id}/messages`, {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <MessageSquare className="h-4.5 w-4.5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Ruang Percakapan Kerja Sama</h2>
          <p className="text-xs text-slate-500">
            Terhubung langsung dengan proposal resmi dan dapat dilihat oleh kedua pihak.
          </p>
        </div>
      </div>

      <div className="max-h-[460px] overflow-y-auto p-5 space-y-4 bg-slate-50/30">
        {sponsorship.messages.length > 0 ? (
          sponsorship.messages.map((message) => {
            const isViewer = message.sender_user_id === sponsorship.viewer_user_id;
            return (
              <div
                key={message.id}
                className={cn('flex flex-col', isViewer ? 'items-end' : 'items-start')}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-xs font-semibold text-slate-700">
                    {isViewer ? 'Anda' : message.sender_name}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {formatDateTime(message.created_at)}
                  </span>
                </div>
                <div
                  className={cn(
                    'max-w-md rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-2xs whitespace-pre-line',
                    isViewer
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  )}
                >
                  {message.body}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">
              Belum ada pesan. Mulai percakapan untuk membahas teknis pelaksanaan dan hak sponsorship.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-slate-100 bg-white p-4 space-y-3">
        <Textarea
          rows={3}
          value={data.body}
          onChange={(event) => setData('body', event.target.value)}
          placeholder="Tulis pesan atau koordinasi kerja sama..."
          error={errors.body}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={processing || !data.body.trim()}>
            <Send className="h-3.5 w-3.5" />
            {processing ? 'Mengirim…' : 'Kirim Pesan'}
          </Button>
        </div>
      </form>
    </section>
  );
}
