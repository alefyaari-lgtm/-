import { Droplets, RotateCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NoorakAvatar } from '../characters/NoorakAvatar';

interface ValvePuzzleModalProps {
  onTurnStep: (progressRatio: number) => void;
  onValveOpened: () => void;
  onClose: () => void;
}

const REQUIRED_TURNS = 4;

export function ValvePuzzleModal({
  onTurnStep,
  onValveOpened,
  onClose,
}: ValvePuzzleModalProps) {
  const [turnsCompleted, setTurnsCompleted] = useState(0);
  const progressPercent = Math.round((turnsCompleted / REQUIRED_TURNS) * 100);
  const rotationDeg = turnsCompleted * 90;
  const isOpened = turnsCompleted >= REQUIRED_TURNS;

  useEffect(() => {
    if (!isOpened) return;
    const timer = window.setTimeout(onValveOpened, 420);
    return () => window.clearTimeout(timer);
  }, [isOpened, onValveOpened]);

  const handleTurn = () => {
    if (isOpened) {
      return;
    }
    const next = turnsCompleted + 1;
    setTurnsCompleted(next);
    onTurnStep(next / REQUIRED_TURNS);

  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 safe-area-inset">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="valve-title"
        className="w-full max-w-md rounded-3xl bg-[#fffdf7] border-4 border-teal-600 shadow-2xl p-6 space-y-5 text-center"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-teal-800">
            رفع مشکل فواره
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره شیر آب"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 inline-flex items-center justify-center text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 bg-teal-50 rounded-2xl p-3 text-right border border-teal-200">
          <NoorakAvatar mood={isOpened ? 'happy' : 'guiding'} size={62} className="shrink-0" />
          <p id="valve-title" className="text-sm sm:text-base font-bold text-[#134e4a]">
            {isOpened
              ? 'آفرین! شیر آب کاملاً باز شد و آب به طرف فواره حرکت کرد!'
              : 'دکمه زیر را چند بار بزن تا دسته قرمز شیر آب بچرخد و راه آب باز شود.'}
          </p>
        </div>

        {/* Interactive Rotating Valve Wheel SVG */}
        <div className="py-2 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleTurn}
            aria-label="چرخاندن شیر آب"
            className="relative w-40 h-40 rounded-full bg-slate-100 border-4 border-slate-300 flex items-center justify-center shadow-inner hover:bg-amber-50 active:scale-95 transition-transform cursor-pointer"
          >
            <svg
              viewBox="0 0 120 120"
              className="w-32 h-32 transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${rotationDeg}deg)` }}
            >
              <circle
                cx="60"
                cy="60"
                r="44"
                fill="none"
                stroke={isOpened ? '#10b981' : '#dc2626'}
                strokeWidth="12"
              />
              <line
                x1="16"
                y1="60"
                x2="104"
                y2="60"
                stroke={isOpened ? '#10b981' : '#dc2626'}
                strokeWidth="9"
                strokeLinecap="round"
              />
              <line
                x1="60"
                y1="16"
                x2="60"
                y2="104"
                stroke={isOpened ? '#10b981' : '#dc2626'}
                strokeWidth="9"
                strokeLinecap="round"
              />
              <circle cx="60" cy="60" r="12" fill={isOpened ? '#047857' : '#991b1b'} />
              <circle cx="60" cy="18" r="5" fill="#fde047" />
            </svg>
          </button>

          <div className="w-full max-w-xs space-y-1.5">
            <div className="flex justify-between text-xs font-extrabold text-slate-700 tabular-nums">
              <span>میزان باز شدن شیر</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  isOpened ? 'bg-emerald-500' : 'bg-sky-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTurn}
          disabled={isOpened}
          className="w-full inline-flex items-center justify-center gap-2 min-h-14 px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-600 disabled:bg-emerald-600 text-white font-extrabold text-base shadow-lg active:scale-95 transition-transform cursor-pointer"
        >
          {isOpened ? (
            <>
              <Droplets className="w-5 h-5" />
              <span>آب جریان پیدا کرد!</span>
            </>
          ) : (
            <>
              <RotateCw className="w-5 h-5" />
              <span>چرخاندن شیر آب ({turnsCompleted} از {REQUIRED_TURNS})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
