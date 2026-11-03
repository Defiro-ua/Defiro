/*
 * Decorative illustration of the login screen: a procedure drawn as a path
 * through three numbered steps, plus two brand bars. Coordinates are those of
 * the 1440×900 mockup; the SVG scales and stays anchored to the right.
 */
const steps = [
  { n: 1, cx: 830, cy: 600, label: 'Pedido', labelY: 662 },
  { n: 2, cx: 1040, cy: 430, label: 'Aprovação', labelY: 492 },
  { n: 3, cx: 1250, cy: 600, label: 'Concluído', labelY: 662 },
]

const yellow = { stopColor: 'var(--color-yellow)' }
const orange = { stopColor: 'var(--color-orange)' }

export function FlowIllustration({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMaxYMid meet"
      className={className}
    >
      <defs>
        <linearGradient id="flow-path" x1="780" y1="230" x2="1220" y2="600" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={yellow} />
          <stop offset="1" style={orange} />
        </linearGradient>
        <linearGradient id="flow-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={yellow} />
          <stop offset="1" style={orange} />
        </linearGradient>
        <linearGradient id="flow-dot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={yellow} />
          <stop offset="1" style={orange} />
        </linearGradient>
      </defs>

      <rect x="1250" y="112" width="96" height="260" rx="26" fill="url(#flow-bar)" />
      <rect x="1168" y="164" width="34" height="86" rx="17" fill="url(#flow-bar)" />

      <path
        d="M 790 230 C 790 430 760 600 830 600 C 930 600 960 430 1040 430 C 1120 430 1150 600 1196 600"
        fill="none"
        stroke="url(#flow-path)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle cx="790" cy="230" r="10" className="fill-yellow" />
      <polygon points="1194,586 1216,600 1194,614" strokeWidth="4" strokeLinejoin="round" className="fill-orange stroke-orange" />

      {steps.map((step) => (
        <g key={step.n}>
          <circle cx={step.cx} cy={step.cy} r="28" fill="url(#flow-dot)" />
          <text
            x={step.cx}
            y={step.cy + 7}
            textAnchor="middle"
            className="fill-on-brand font-sans text-title-lg font-extrabold"
          >
            {step.n}
          </text>
          <text
            x={step.cx}
            y={step.labelY}
            textAnchor="middle"
            className="fill-ink font-sans text-body-lg font-extrabold tracking-heading"
          >
            {step.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
