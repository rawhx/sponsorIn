import { cn } from '../lib/utils';

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Frame({ children, className }) {
  return (
    <svg
      viewBox="0 0 160 120"
      role="presentation"
      aria-hidden="true"
      className={cn('h-24 w-32 text-primary-soft', className)}
      {...strokeProps}
    >
      {children}
    </svg>
  );
}

export function HandshakeIllustration({ className }) {
  return (
    <Frame className={className}>
      <path d="M28 58c10-9 20-9 30 0l10 9c4 3 9 3 13 0" className="text-primary" />
      <path d="M132 58c-10-9-20-9-30 0l-10 9c-4 3-9 3-13 0" className="text-primary" />
      <path d="M58 67l8 7c5 4 12 4 17 0l8-7" />
      <circle cx="80" cy="38" r="12" className="text-primary/70" />
      <path d="M44 92h72" className="text-border" strokeDasharray="3 6" />
    </Frame>
  );
}

export function DocumentIllustration({ className }) {
  return (
    <Frame className={className}>
      <path d="M56 24h34l16 16v56a4 4 0 0 1-4 4H56a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4Z" className="text-primary" />
      <path d="M90 24v16h16" />
      <path d="M64 58h32M64 68h32M64 78h20" />
    </Frame>
  );
}

export function CalendarIllustration({ className }) {
  return (
    <Frame className={className}>
      <rect x="44" y="32" width="72" height="60" rx="8" className="text-primary" />
      <path d="M44 50h72M60 24v14M100 24v14" />
      <path d="M62 66h10M88 66h10M62 78h10" className="text-primary/70" />
    </Frame>
  );
}

export function SearchIllustration({ className }) {
  return (
    <Frame className={className}>
      <circle cx="74" cy="56" r="22" className="text-primary" />
      <path d="M90 72l16 16" />
      <path d="M64 56h20M74 46v20" className="text-primary/70" />
    </Frame>
  );
}

export function BellIllustration({ className }) {
  return (
    <Frame className={className}>
      <path d="M62 76c-4-3-6-8-6-14V52c0-13 10-22 24-22s24 9 24 22v10c0 6-2 11-6 14H62Z" className="text-primary" />
      <path d="M72 84a8 8 0 0 0 16 0" />
      <path d="M80 30v-6" />
    </Frame>
  );
}

export function ShieldIllustration({ className }) {
  return (
    <Frame className={className}>
      <path d="M80 24l26 10v20c0 18-11 30-26 38-15-8-26-20-26-38V34l26-10Z" className="text-primary" />
      <path d="M70 56l8 8 16-16" />
    </Frame>
  );
}

const map = {
  handshake: HandshakeIllustration,
  document: DocumentIllustration,
  calendar: CalendarIllustration,
  search: SearchIllustration,
  bell: BellIllustration,
  shield: ShieldIllustration,
};

export default function Illustration({ name = 'document', className }) {
  const Component = map[name] ?? DocumentIllustration;

  return <Component className={className} />;
}
