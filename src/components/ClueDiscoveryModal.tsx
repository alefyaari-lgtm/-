import { BookCheck, CheckCircle2 } from 'lucide-react';
import { NoorakAvatar } from '../characters/NoorakAvatar';
import type { ClueDefinition } from '../core/types';
import { ClueIllustration } from './ClueIllustration';

interface ClueDiscoveryModalProps {
  clue: ClueDefinition;
  isNewDiscovery: boolean;
  discoveredCount: number;
  totalCluesCount: number;
  onClose: () => void;
}

export function ClueDiscoveryModal({
  clue,
  isNewDiscovery,
  discoveredCount,
  totalCluesCount,
  onClose,
}: ClueDiscoveryModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/55 safe-area-inset">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="clue-modal-title"
        className="w-full max-w-lg rounded-3xl bg-[#fffdf7] border-4 border-amber-400 shadow-2xl p-5 sm:p-7 space-y-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              {isNewDiscovery ? 'سرنخ جدید کشف شد!' : 'سرنخ ثبت‌شده در دفترچه'}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-600 tabular-nums">
            {discoveredCount} از {totalCluesCount} سرنخ
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 bg-teal-50/70 rounded-2xl p-4 border border-teal-200">
          <ClueIllustration kind={clue.illustrationKey} size={112} />
          <div className="space-y-2 text-center sm:text-right">
            <h3 id="clue-modal-title" className="text-xl sm:text-2xl font-extrabold text-[#134e4a]">
              {clue.shortLabelFa}
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {clue.descriptionFa}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 rounded-2xl p-3.5 border border-amber-200">
          <NoorakAvatar mood="happy" size={62} className="shrink-0" />
          <p className="text-sm sm:text-base font-bold text-amber-950 leading-relaxed">
            {isNewDiscovery ? clue.noorakReactionFa : clue.alreadyFoundFa}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full inline-flex items-center justify-center gap-2 min-h-13 px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-base shadow-lg active:scale-95 transition-transform cursor-pointer"
        >
          <BookCheck className="w-5 h-5" />
          <span>{isNewDiscovery ? 'ثبت در دفترچه و ادامه' : 'بستن'}</span>
        </button>
      </div>
    </div>
  );
}
