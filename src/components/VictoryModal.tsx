import { Award, Home, RotateCcw, Sparkles } from 'lucide-react';
import { NoorakAvatar } from '../characters/NoorakAvatar';
import { RahaAvatar } from '../characters/RahaAvatar';
import type { CaseDefinition } from '../core/types';
import { ClueIllustration } from './ClueIllustration';

interface VictoryModalProps {
  caseDef: CaseDefinition;
  completedCasesCount: number;
  totalPlannedCases: number;
  detectiveProgressPercent: number;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export function VictoryModal({
  caseDef,
  completedCasesCount,
  totalPlannedCases,
  detectiveProgressPercent,
  onPlayAgain,
  onReturnHome,
}: VictoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 safe-area-inset">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="victory-title"
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#fffdf7] border-4 border-amber-400 shadow-2xl p-5 sm:p-7 space-y-5 text-center"
      >
        <div className="flex items-center justify-center gap-3">
          <RahaAvatar mood="happy" size={76} />
          <NoorakAvatar mood="happy" size={86} />
        </div>

        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-1.5 text-emerald-700 font-extrabold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>آفرین کارآگاه! پرونده با موفقیت حل شد</span>
          </p>
          <h2 id="victory-title" className="text-2xl sm:text-3xl font-extrabold text-[#134e4a]">
            فواره میدان روشن دوباره به صدا درآمد!
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl mx-auto">
            با مشاهده دقیق، ثبت سرنخ‌ها و باز کردن شیر آب کنار باغچه، شادی را به میدان برگرداندی.
          </p>
        </div>

        {/* Earned Rewards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-right">
          {caseDef.rewards.map((reward) => (
            <div
              key={reward.id}
              data-testid={`reward-${reward.id}`}
              className="flex items-center gap-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 p-3.5 shadow-sm"
            >
              <ClueIllustration kind={reward.iconKey} size={76} />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-800">
                  {reward.type === 'card' ? 'کارت کلکسیونی جدید' : 'نشان افتخار کارآگاهی'}
                </p>
                <h3 className="text-base font-extrabold text-[#134e4a]">
                  {reward.titleFa}
                </h3>
                <p className="text-xs text-slate-600 leading-snug">
                  {reward.descriptionFa}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* BrightLand Detective Progress */}
        <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 space-y-2 text-right">
          <div className="flex items-center justify-between gap-2 text-sm font-extrabold text-[#134e4a]">
            <span className="inline-flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-700" />
              <span>پیشرفت کارآگاهی در سرزمین روشن</span>
            </span>
            <span className="tabular-nums">
              {completedCasesCount} از {totalPlannedCases} پرونده ({detectiveProgressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-teal-100 overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(detectiveProgressPercent, 8)}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="inline-flex items-center justify-center gap-2 min-h-13 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#134e4a] font-extrabold text-base shadow-md cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>بازی مجدد</span>
          </button>

          <button
            type="button"
            onClick={onReturnHome}
            className="inline-flex items-center justify-center gap-2 min-h-13 px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-base shadow-md cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>بازگشت به صفحه اصلی</span>
          </button>
        </div>
      </div>
    </div>
  );
}
