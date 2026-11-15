import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, LoaderCircle, Search } from 'lucide-react';
import { cn } from '../lib/utils';

let citiesPromise;

function titleCaseCity(name) {
  return name
    .toLocaleLowerCase('id-ID')
    .split(/(\s+|-)/)
    .map((part) => (/^\s+$/.test(part) || part === '-' ? part : part.charAt(0).toLocaleUpperCase('id-ID') + part.slice(1)))
    .join('');
}

function loadCities() {
  if (!citiesPromise) {
    citiesPromise = fetch('/api/locations/cities')
      .then((response) => {
        if (!response.ok) throw new Error('Daftar kota tidak tersedia.');
        return response.json();
      })
      .then(({ data }) => data.map(titleCaseCity));
  }

  return citiesPromise;
}

export default function CitySelect({
  id,
  value = '',
  onChange,
  onBlur,
  name,
  error,
  placeholder = 'Cari kota atau kabupaten',
  allowCustom = true,
  className,
}) {
  const [cities, setCities] = useState([]);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    loadCities()
      .then((items) => {
        if (!controller.signal.aborted) {
          setCities(items);
        }
        setLoadError(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setLoadError(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setQuery(value);
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const filteredCities = cities
    .filter((city) => city.toLowerCase().includes(query.trim().toLowerCase()));

  function updateValue(nextValue) {
    setQuery(nextValue);
  }

  function selectCity(city) {
    setQuery(city);
    onChange?.({ target: { name, id, value: city } });
    setOpen(false);
  }

  function resetSearch() {
    setQuery(value);
    setOpen(false);
    onBlur?.();
  }

  return (
    <div ref={rootRef} className="relative">
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
        <input
          id={id}
          value={query}
          onChange={(event) => updateValue(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={resetSearch}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-cities`}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-11 w-full rounded-[8px] border border-border bg-surface px-10 pr-10 text-[15px] text-text placeholder:text-text-muted transition-colors focus:border-primary-strong focus:outline-none focus:ring-2 focus:ring-primary/20',
            error && 'border-danger-strong focus:border-danger-strong focus:ring-danger/20',
            className
          )}
        />
        {loading ? (
          <LoaderCircle className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" aria-label="Memuat kota" />
        ) : (
          <ChevronDown className={cn('pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-transform', open && 'rotate-180')} aria-hidden="true" />
        )}
      </div>

      {open ? (
        <div id={`${id}-cities`} role="listbox" className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-[8px] border border-border bg-surface p-1 shadow-lg">
          {filteredCities.map((city) => (
            <button
              key={city}
              type="button"
              role="option"
              aria-selected={city === value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectCity(city)}
              className="flex w-full items-center justify-between rounded-[6px] px-3 py-2 text-left text-sm text-text hover:bg-hover"
            >
              <span>{city}</span>
              {city === value ? <Check className="h-4 w-4 text-primary-strong" aria-hidden="true" /> : null}
            </button>
          ))}
          {!loading && !filteredCities.length ? (
            <p className="px-3 py-2 text-xs text-text-secondary-strong">
              {loadError ? 'Daftar kota gagal dimuat. Coba lagi nanti.' : 'Kota tidak ditemukan. Pilih kota dari daftar yang tersedia.'}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
