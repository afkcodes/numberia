export function Berry({ group = 0, plank = false }: { group?: number; plank?: boolean }) {
  return (
    <svg
      preserveAspectRatio={plank ? 'none' : 'xMidYMid meet'}
      viewBox={plank ? '0 0 32 84' : '0 0 48 48'}
      aria-hidden="true"
    >
      {plank ? (
        <>
          <rect
            x="2"
            y="2"
            width="28"
            height="80"
            rx="5"
            fill="var(--color-toy-yellow)"
            stroke="var(--color-gold-ink)"
            strokeWidth="2"
          />
          <path
            d="M10 12Q16 32 10 54T13 76M23 8Q18 22 23 42T21 75"
            stroke="var(--color-gold)"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="8" cy="9" r="2" fill="var(--color-orange-ink)" />
          <circle cx="24" cy="75" r="2" fill="var(--color-orange-ink)" />
        </>
      ) : (
        <>
          <path d="M23 14Q20 3 32 4Q38 4 36 9Q30 15 23 14" fill="var(--color-accent)" />
          <path
            d="M24 12C7 6 3 26 11 38C17 47 31 46 38 35C46 22 39 9 24 12"
            fill={`var(--color-${group ? 'coral' : 'berry'})`}
          />
          <ellipse
            cx="16"
            cy="19"
            rx="4"
            ry="6"
            fill="var(--color-white)"
            opacity=".28"
            transform="rotate(30 16 19)"
          />
          <circle cx="19" cy="29" r="2" fill="var(--color-ink)" />
          <circle cx="31" cy="29" r="2" fill="var(--color-ink)" />
          <path
            d="M21 35Q25 39 29 35"
            stroke="var(--color-ink)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
