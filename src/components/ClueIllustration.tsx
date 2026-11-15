interface ClueIllustrationProps {
  kind:
    | 'basin_low'
    | 'valve_closed'
    | 'pipe_intact'
    | 'flowerpot'
    | 'bench'
    | 'butterfly'
    | 'fountain'
    | 'fountain_card'
    | 'sharp_eye_badge';
  size?: number;
  className?: string;
}

export function ClueIllustration({
  kind,
  size = 96,
  className = '',
}: ClueIllustrationProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {kind === 'basin_low' && (
        <g>
          <rect x="8" y="8" width="104" height="104" rx="20" fill="#ecfeff" stroke="#0891b2" strokeWidth="3" />
          {/* Turquoise octagonal basin cutaway */}
          <polygon points="20,66 35,50 85,50 100,66 94,94 26,94" fill="#14b8a6" stroke="#0f766e" strokeWidth="3" />
          <polygon points="28,66 38,56 82,56 92,66 86,86 34,86" fill="#ccfbf1" />
          {/* Very shallow water puddle at bottom */}
          <ellipse cx="60" cy="82" rx="24" ry="5" fill="#38bdf8" />
          {/* Downward arrow showing low water level */}
          <line x1="60" y1="24" x2="60" y2="54" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" />
          <polyline points="50,45 60,56 70,45" fill="none" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {kind === 'valve_closed' && (
        <g>
          <rect x="8" y="8" width="104" height="104" rx="20" fill="#fff1f2" stroke="#e11d48" strokeWidth="3" />
          {/* Vertical pipe */}
          <rect x="52" y="54" width="16" height="46" rx="4" fill="#94a3b8" stroke="#334155" strokeWidth="2.5" />
          <rect x="26" y="72" width="68" height="14" rx="4" fill="#64748b" stroke="#334155" strokeWidth="2.5" />
          {/* Red closed valve wheel */}
          <circle cx="60" cy="44" r="20" fill="none" stroke="#dc2626" strokeWidth="6" />
          <line x1="40" y1="44" x2="80" y2="44" stroke="#dc2626" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="60" y1="24" x2="60" y2="64" stroke="#dc2626" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="60" cy="44" r="5.5" fill="#991b1b" />
          {/* Closed X badge */}
          <circle cx="90" cy="30" r="11" fill="#dc2626" />
          <path d="M85 25 L95 35 M95 25 L85 35" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}

      {kind === 'pipe_intact' && (
        <g>
          <rect x="8" y="8" width="104" height="104" rx="20" fill="#f0fdf4" stroke="#16a34a" strokeWidth="3" />
          {/* Smooth copper/steel pipe */}
          <rect x="18" y="54" width="84" height="18" rx="5" fill="#d97706" stroke="#78350f" strokeWidth="2.5" />
          <rect x="20" y="58" width="80" height="5" fill="#fbbf24" opacity="0.65" />
          <rect x="34" y="50" width="10" height="26" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="2" />
          <rect x="76" y="50" width="10" height="26" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="2" />
          {/* Green checkmark */}
          <circle cx="88" cy="30" r="12" fill="#16a34a" />
          <polyline points="82,30 86,35 95,25" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {kind === 'flowerpot' && (
        <g>
          <rect x="8" y="8" width="104" height="104" rx="20" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
          <polygon points="40,66 80,66 73,98 47,98" fill="#ea580c" stroke="#9a3412" strokeWidth="2.5" />
          <rect x="36" y="58" width="48" height="10" rx="3" fill="#f97316" stroke="#9a3412" strokeWidth="2.5" />
          <circle cx="48" cy="42" r="10" fill="#22c55e" />
          <circle cx="72" cy="44" r="10" fill="#16a34a" />
          <circle cx="60" cy="36" r="11" fill="#ec4899" />
          <circle cx="60" cy="36" r="4" fill="#fde047" />
        </g>
      )}

      {kind === 'bench' && (
        <g>
          <rect x="8" y="8" width="104" height="104" rx="20" fill="#f5f5f4" stroke="#78716c" strokeWidth="3" />
          <rect x="24" y="42" width="72" height="16" rx="4" fill="#b45309" stroke="#78350f" strokeWidth="2.5" />
          <rect x="20" y="64" width="80" height="10" rx="3" fill="#d97706" stroke="#78350f" strokeWidth="2.5" />
          <rect x="30" y="74" width="8" height="20" fill="#44403c" />
          <rect x="82" y="74" width="8" height="20" fill="#44403c" />
        </g>
      )}

      {kind === 'butterfly' && (
        <g>
          <rect x="8" y="8" width="104" height="104" rx="20" fill="#fffbeb" stroke="#f59e0b" strokeWidth="3" />
          <ellipse cx="44" cy="52" rx="18" ry="15" fill="#fb923c" stroke="#c2410c" strokeWidth="2.5" />
          <ellipse cx="76" cy="52" rx="18" ry="15" fill="#fb923c" stroke="#c2410c" strokeWidth="2.5" />
          <ellipse cx="47" cy="72" rx="13" ry="11" fill="#fbbf24" stroke="#c2410c" strokeWidth="2.5" />
          <ellipse cx="73" cy="72" rx="13" ry="11" fill="#fbbf24" stroke="#c2410c" strokeWidth="2.5" />
          <rect x="57" y="40" width="6" height="40" rx="3" fill="#451a03" />
        </g>
      )}

      {kind === 'fountain' && (
        <g>
          <rect x="8" y="8" width="104" height="104" rx="20" fill="#ecfeff" stroke="#0d9488" strokeWidth="3" />
          <polygon points="24,78 96,78 88,98 32,98" fill="#14b8a6" stroke="#0f766e" strokeWidth="2.5" />
          <rect x="52" y="42" width="16" height="36" rx="4" fill="#2dd4bf" stroke="#0f766e" strokeWidth="2.5" />
          <ellipse cx="60" cy="42" rx="18" ry="6" fill="#0d9488" stroke="#134e4a" strokeWidth="2" />
        </g>
      )}

      {kind === 'fountain_card' && (
        <g>
          <rect x="14" y="10" width="92" height="100" rx="14" fill="#fefce8" stroke="#eab308" strokeWidth="3.5" />
          <rect x="22" y="18" width="76" height="58" rx="10" fill="#cffafe" stroke="#0891b2" strokeWidth="2" />
          {/* Active splashing fountain */}
          <path d="M60 44 Q42 22 34 48" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M60 44 Q78 22 86 48" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M60 44 L60 22" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          <polygon points="32,62 88,62 82,74 38,74" fill="#14b8a6" stroke="#0f766e" strokeWidth="2" />
          <rect x="54" y="44" width="12" height="18" fill="#2dd4bf" stroke="#0f766e" strokeWidth="2" />
          <circle cx="60" cy="92" r="8" fill="#f59e0b" />
          <path d="M56 92 L59 95 L65 89" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}

      {kind === 'sharp_eye_badge' && (
        <g>
          <circle cx="60" cy="60" r="46" fill="#fef08a" stroke="#d97706" strokeWidth="4" />
          <circle cx="60" cy="60" r="36" fill="#0d9488" stroke="#134e4a" strokeWidth="2.5" />
          {/* Eye / Magnifying star */}
          <path
            d="M32 60 Q60 36 88 60 Q60 84 32 60 Z"
            fill="#ffffff"
            stroke="#134e4a"
            strokeWidth="2.5"
          />
          <circle cx="60" cy="60" r="10" fill="#f59e0b" stroke="#134e4a" strokeWidth="2.2" />
          <circle cx="60" cy="60" r="4.5" fill="#134e4a" />
          <circle cx="63" cy="57" r="2" fill="#ffffff" />
        </g>
      )}
    </svg>
  );
}
