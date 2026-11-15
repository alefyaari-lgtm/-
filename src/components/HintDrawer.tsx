import { Lightbulb, Sparkles, X } from 'lucide-react';
import { NoorakAvatar } from '../characters/NoorakAvatar';
import type { ActiveHintResult } from '../core/caseEngine';
import type { HintLevel } from '../core/types';

interface HintDrawerProps {
  hint: ActiveHintResult;
  onSelectLevel: (level: HintLevel) => void;
  onClose: () => void;
}

export function HintDrawer({
  hint,
  onSelectLevel,
  onClose,
}: HintDrawerProps) {
  const levels: { level: HintLevel; label: string }[] = [
    { level: 1, label: 'راهنمای ۱ · اشاره کلی' },
    { level: 2, label: 'راهنمای ۲ · سرنخ دقیق‌تر' },
    { level: 3, label: 'راهنمای ۳ · نشان‌دادن محل' },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5 pointer-events-none safe-area-inset flex justify-center">
      <div
        role="dialog"
        aria-label="راهنمای نورک"
        className="pointer-events-auto w-full max-w-2xl rounded-3xl bg-[#fffdf7] border-4 border-amber-400 shadow-2xl p-4 sm:p-5 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-base">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <span>راهنمای کارآگاه نورک</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن راهنما"
            className="inline-flex items-center gap-1 min-h-10 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>بستن</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {levels.map((item) => {
            const active = hint.level === item.level;
            return (
              <button
                key={item.level}
                type="button"
                onClick={() => onSelectLevel(item.level)}
                className={`min-h-10 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold border-2 transition-colors cursor-pointer ${
                  active
                    ? 'bg-amber-400 border-amber-600 text-[#134e4a]'
                    : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3.5 bg-teal-50 rounded-2xl p-3.5 border border-teal-200">
          <NoorakAvatar mood="guiding" size={66} className="shrink-0" />
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-bold text-[#134e4a] leading-relaxed">
              {hint.messageFa}
            </p>
            {hint.level === 3 && hint.sceneObjectId && (
              <p className="inline-flex items-center gap-1 text-xs font-extrabold text-teal-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>یک حلقه نورانی روی شیء مورد نظر در میدان روشن شده است.</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
