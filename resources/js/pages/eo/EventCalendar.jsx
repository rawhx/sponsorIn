import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MapPin, Plus } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { buttonClasses } from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';

const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function daysForMonth(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const first = new Date(year, monthNumber - 1, 1);
  const last = new Date(year, monthNumber, 0);
  const offset = (first.getDay() + 6) % 7;
  const total = Math.ceil((offset + last.getDate()) / 7) * 7;

  return Array.from({ length: total }, (_, index) => {
    const date = new Date(year, monthNumber - 1, index - offset + 1);
    return {
      date,
      key: [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-'),
      inMonth: date.getMonth() === monthNumber - 1,
    };
  });
}

function formatDay(date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric' }).format(date);
}

export default function EventCalendar({
  month,
  monthLabel,
  previousMonth,
  nextMonth,
  today,
  events,
}) {
  const days = daysForMonth(month);

  return (
    <DashboardLayout
      eyebrow="Ruang Kerja EO"
      title="Kalender Event"
      description="Pantau jadwal pelaksanaan event, status publikasi, dan venue dalam satu tampilan kalender bulanan."
      actions={
        <Link href="/eo/events/create" className={buttonClasses()}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Buat Event Baru
        </Link>
      }
    >
      <Head title="Kalender Event EO" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold capitalize text-slate-900">{monthLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/eo/events/calendar?month=${previousMonth}`}
            className={buttonClasses({ variant: 'outline', size: 'sm' })}
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/eo/events/calendar"
            className={buttonClasses({ variant: 'outline', size: 'sm' })}
          >
            Hari Ini
          </Link>
          <Link
            href={`/eo/events/calendar?month=${nextMonth}`}
            className={buttonClasses({ variant: 'outline', size: 'sm' })}
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
          {dayLabels.map((label) => (
            <div key={label} className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500 sm:px-3">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {days.map(({ key, date, inMonth }) => {
            const dayEvents = events.filter((event) => event.date_start <= key && event.date_end >= key);
            const isToday = today === key;

            return (
              <div
                key={key}
                className={`min-h-[110px] p-2 sm:min-h-[140px] sm:p-2.5 transition-colors ${
                  inMonth ? 'bg-white' : 'bg-slate-50/40 opacity-60'
                }`}
              >
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                  isToday ? 'bg-emerald-600 text-white shadow-2xs' : inMonth ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {formatDay(date)}
                </span>
                <div className="mt-1.5 space-y-1.5">
                  {dayEvents.map((event) => (
                    <Link
                      key={`${key}-${event.id}`}
                      href={`/eo/events/${event.id}`}
                      className="block rounded-lg border border-emerald-200 bg-emerald-50/70 p-2 transition-all hover:border-emerald-400 hover:bg-emerald-100/80"
                    >
                      <p className="truncate text-xs font-bold text-emerald-950">{event.title}</p>
                      <div className="mt-1 hidden items-center gap-1 text-[11px] text-emerald-800 sm:flex truncate">
                        <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </DashboardLayout>
  );
}
