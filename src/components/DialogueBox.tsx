import { ChevronLeft } from 'lucide-react';
import { NaneBaharAvatar } from '../characters/NaneBaharAvatar';
import { NoorakAvatar } from '../characters/NoorakAvatar';
import { RahaAvatar } from '../characters/RahaAvatar';
import type { DialogueLine } from '../core/types';

interface DialogueBoxProps {
  line: DialogueLine;
  stepNumber: number;
  totalSteps: number;
  actionLabel: string;
  onNext: () => void;
}

export function DialogueBox({
  line,
  stepNumber,
  totalSteps,
  actionLabel,
  onNext,
}: DialogueBoxProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 p-3 sm:p-6 pointer-events-none safe-area-inset flex justify-center">
      <div
        role="dialog"
        aria-label={`گفت‌وگو با ${line.speakerNameFa}`}
        className="pointer-events-auto w-full max-w-3xl rounded-3xl bg-[#fffdf7] border-4 border-teal-700/30 shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4"
      >
        <div className="shrink-0">
          {line.speaker === 'nane_bahar' && <NaneBaharAvatar size={86} />}
          {line.speaker === 'noorak' && <NoorakAvatar mood={line.noorakMood} size={86} />}
          {line.speaker === 'raha' && <RahaAvatar mood={line.rahaMood ?? 'normal'} size={86} />}
        </div>

        <div className="flex-1 text-center sm:text-right space-y-1.5">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-teal-800">
            <span>{line.speakerNameFa}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums text-slate-500">
              {stepNumber} از {totalSteps}
            </span>
          </div>
          <p className="text-base sm:text-lg font-bold text-[#134e4a] leading-relaxed">
            «{line.textFa}»
          </p>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="shrink-0 inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-base shadow-md active:scale-95 transition-transform cursor-pointer whitespace-nowrap"
        >
          <span>{actionLabel}</span>
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
