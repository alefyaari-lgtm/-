import type { RahaMood } from '../core/types';

interface RahaAvatarProps {
  mood?: RahaMood;
  size?: number;
  className?: string;
}

export function RahaAvatar({
  mood = 'normal',
  size = 84,
  className = '',
}: RahaAvatarProps) {
  const isHappy = mood === 'happy';

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm">
        {/* Background soft medallion */}
        <circle cx="60" cy="60" r="54" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" />

        {/* Colorful Iranian modest tunic / coat */}
        <path
          d="M28 106 C30 82, 90 82, 92 106 Z"
          fill="#e11d48"
          stroke="#881337"
          strokeWidth="2.4"
        />
        {/* Decorative collar trim */}
        <path d="M46 86 L60 96 L74 86" fill="none" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />

        {/* Full headscarf covering all hair cleanly */}
        <path
          d="M31 58 C31 28, 89 28, 89 58 L92 86 C78 92, 42 92, 28 86 Z"
          fill="#0d9488"
          stroke="#134e4a"
          strokeWidth="2.4"
        />
        {/* Inner scarf trim */}
        <path
          d="M38 56 C38 37, 82 37, 82 56 C82 72, 72 80, 60 80 C48 80, 38 72, 38 56 Z"
          fill="#5eead4"
        />

        {/* Face */}
        <circle cx="60" cy="59" r="19" fill="#fde2c4" stroke="#d97706" strokeWidth="1.6" />

        {/* Eyes */}
        {isHappy ? (
          <>
            <path d="M49 57 Q53 52 57 57" fill="none" stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M63 57 Q67 52 71 57" fill="none" stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="53" cy="57" r="2.8" fill="#1e293b" />
            <circle cx="67" cy="57" r="2.8" fill="#1e293b" />
            <circle cx="54" cy="56" r="1" fill="#ffffff" />
            <circle cx="68" cy="56" r="1" fill="#ffffff" />
          </>
        )}

        {/* Rosy cheeks */}
        <circle cx="47" cy="63" r="3" fill="#fb7185" opacity="0.45" />
        <circle cx="73" cy="63" r="3" fill="#fb7185" opacity="0.45" />

        {/* Smile */}
        {mood === 'thinking' ? (
          <path d="M55 68 L64 67" stroke="#7c2d12" strokeWidth="2.3" strokeLinecap="round" />
        ) : (
          <path
            d="M53 65 Q60 72 67 65"
            fill="none"
            stroke="#7c2d12"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}
