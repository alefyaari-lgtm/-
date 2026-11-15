interface NaneBaharAvatarProps {
  size?: number;
  className?: string;
}

export function NaneBaharAvatar({
  size = 84,
  className = '',
}: NaneBaharAvatarProps) {
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm">
        <circle cx="60" cy="60" r="54" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />

        {/* Floral headscarf / chador */}
        <path
          d="M27 64 C27 26, 93 26, 93 64 L96 104 C75 110, 45 110, 24 104 Z"
          fill="#f8fafc"
          stroke="#64748b"
          strokeWidth="2.4"
        />
        {/* Tiny floral dots on scarf */}
        <circle cx="38" cy="48" r="2.6" fill="#ec4899" />
        <circle cx="82" cy="48" r="2.6" fill="#ec4899" />
        <circle cx="34" cy="76" r="2.6" fill="#10b981" />
        <circle cx="86" cy="76" r="2.6" fill="#10b981" />

        {/* Face */}
        <circle cx="60" cy="58" r="19" fill="#fbd8b8" stroke="#b45309" strokeWidth="1.5" />

        {/* Gentle glasses */}
        <circle cx="52" cy="56" r="6" fill="none" stroke="#475569" strokeWidth="1.8" />
        <circle cx="68" cy="56" r="6" fill="none" stroke="#475569" strokeWidth="1.8" />
        <line x1="58" y1="56" x2="62" y2="56" stroke="#475569" strokeWidth="1.8" />

        {/* Eyes */}
        <circle cx="52" cy="56" r="2.2" fill="#1e293b" />
        <circle cx="68" cy="56" r="2.2" fill="#1e293b" />

        {/* Warm smile */}
        <path
          d="M54 66 Q60 71 66 66"
          fill="none"
          stroke="#7c2d12"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
