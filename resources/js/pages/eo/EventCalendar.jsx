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
      eyebrow="Ruang kerja EO"
      title="Kalender Event"
      actions={
        <Link href="/eo/events/create" className={buttonClasses()}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Buat event
        </Link>
      }
    >
      <Head title="Kalender Event" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-text-secondary-strong">
            Pantau jadwal event, status moderasi, dan lokasi dalam satu tampilan.
          </p>
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
            Hari ini
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

      <section className="mt-6 overflow-hidden rounded-[14px] border border-border bg-surface">
        <div className="border-b border-border bg-background-muted px-5 py-4">
          <h2 className="text-lg font-semibold capitalize tracking-[-0.02em] text-text">{monthLabel}</h2>
        </div>
        <div className="grid grid-cols-7 border-b border-border bg-background-muted">
          {dayLabels.map((label) => (
            <div key={label} className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted sm:px-3">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map(({ key, date, inMonth }) => {
            const dayEvents = events.filter((event) => event.date_start <= key && event.date_end >= key);
            const isToday = today === key;

            return (
              <div
                key={key}
                className={`min-h-[128px] border-b border-r border-border p-2 last:border-r-0 sm:min-h-[154px] sm:p-3 ${
                  inMonth ? 'bg-surface' : 'bg-background-muted/50'
                }`}
              >
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  isToday ? 'bg-primary text-white' : inMonth ? 'text-text' : 'text-text-muted'
                }`}>
                  {formatDay(date)}
                </span>
                <div className="mt-2 space-y-1.5">
                  {dayEvents.map((event) => (
                    <Link
                      key={`${key}-${event.id}`}
                      href={`/eo/events/${event.id}`}
                      className="block rounded-[7px] border border-primary/15 bg-primary/8 px-2 py-1.5 transition-colors hover:border-primary/40 hover:bg-primary/12"
                    >
                      <p className="truncate text-[11px] font-semibold leading-tight text-primary-strong">{event.title}</p>
                      <div className="mt-1 hidden items-center gap-1 text-[10px] text-text-secondary-strong sm:flex">
                        <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="mt-1 hidden sm:block">
                        <StatusBadge status={event.status} />
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
