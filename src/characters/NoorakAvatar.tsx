import type { NoorakMood } from '../core/types';

interface NoorakAvatarProps {
  mood?: NoorakMood;
  size?: number;
  className?: string;
}

export function NoorakAvatar({
  mood = 'normal',
  size = 84,
  className = '',
}: NoorakAvatarProps) {
  const isHappy = mood === 'happy';
  const isSurprised = mood === 'surprised';
  const isThinking = mood === 'thinking';
  const isGuiding = mood === 'guiding';

  return (
    <div
      className={`inline-flex items-center justify-center animate-noorak-float ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
        <defs>
          <radialGradient id="noorakGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="noorakBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="55%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>

        {/* Warm aura */}
        <circle cx="60" cy="56" r="52" fill="url(#noorakGlow)" />

        {/* Little turquoise lantern wings */}
        <path
          d="M28 58 C14 48, 12 68, 28 70 Z"
          fill="#2dd4bf"
          stroke="#0f766e"
          strokeWidth="2.2"
        />
        <path
          d="M92 58 C106 48, 108 68, 92 70 Z"
          fill="#2dd4bf"
          stroke="#0f766e"
          strokeWidth="2.2"
        />

        {/* Lantern crown cap */}
        <path
          d="M42 28 Q60 12 78 28 Z"
          fill="#0f766e"
          stroke="#134e4a"
          strokeWidth="2.2"
        />
        <circle cx="60" cy="14" r="5" fill="#fde047" stroke="#0f766e" strokeWidth="2" />

        {/* Glowing teardrop / lantern body */}
        <path
          d="M34 52 C34 32, 86 32, 86 52 C86 76, 74 94, 60 96 C46 94, 34 76, 34 52 Z"
          fill="url(#noorakBody)"
          stroke="#0f766e"
          strokeWidth="2.6"
        />

        {/* Inner highlight */}
        <ellipse cx="48" cy="44" rx="6" ry="9" fill="#ffffff" opacity="0.42" />

        {/* Eyes */}
        {isHappy ? (
          <>
            <path
              d="M45 56 Q50 50 55 56"
              fill="none"
              stroke="#134e4a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M65 56 Q70 50 75 56"
              fill="none"
              stroke="#134e4a"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <circle cx="50" cy="55" r={isSurprised ? 5.2 : 4.2} fill="#134e4a" />
            <circle cx="70" cy="55" r={isSurprised ? 5.2 : 4.2} fill="#134e4a" />
            <circle cx="51.5" cy="53.5" r="1.5" fill="#ffffff" />
            <circle cx="71.5" cy="53.5" r="1.5" fill="#ffffff" />
          </>
        )}

        {/* Eyebrows for thinking/guiding */}
        {isThinking && (
          <>
            <path d="M44 47 L54 49" stroke="#134e4a" strokeWidth="2.3" strokeLinecap="round" />
            <path d="M66 49 L76 46" stroke="#134e4a" strokeWidth="2.3" strokeLinecap="round" />
          </>
        )}
        {isGuiding && (
          <>
            <path d="M44 46 Q50 43 55 46" fill="none" stroke="#134e4a" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M65 46 Q70 43 76 46" fill="none" stroke="#134e4a" strokeWidth="2.2" strokeLinecap="round" />
          </>
        )}

        {/* Cheeks */}
        <circle cx="42" cy="63" r="3.5" fill="#fb7185" opacity="0.55" />
        <circle cx="78" cy="63" r="3.5" fill="#fb7185" opacity="0.55" />

        {/* Mouth */}
        {isSurprised ? (
          <circle cx="60" cy="66" r="4" fill="#134e4a" />
        ) : isThinking ? (
          <path d="M55 67 Q60 65 65 67" fill="none" stroke="#134e4a" strokeWidth="2.4" strokeLinecap="round" />
        ) : (
          <path
            d="M52 64 Q60 73 68 64"
            fill="none"
            stroke="#134e4a"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        )}

        {/* Noorak's little magnifying glass */}
        <g transform="translate(76, 68) rotate(22)">
          <line x1="8" y1="14" x2="8" y2="29" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
          <circle cx="8" cy="6" r="10" fill="#bae6fd" fillOpacity="0.65" stroke="#0f766e" strokeWidth="3" />
          <path d="M4 3 Q7 0 11 3" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
