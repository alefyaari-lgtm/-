import { BookOpen, CheckCircle2, HelpCircle, X } from 'lucide-react';
import type { ClueDefinition } from '../core/types';
import { ClueIllustration } from './ClueIllustration';

interface NotebookModalProps {
  clues: ClueDefinition[];
  discoveredClueIds: string[];
  onClose: () => void;
}

export function NotebookModal({
  clues,
  discoveredClueIds,
  onClose,
}: NotebookModalProps) {
  const foundCount = discoveredClueIds.length;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 safe-area-inset">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notebook-title"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fefce8] border-4 border-amber-700/40 shadow-2xl p-5 sm:p-7 space-y-5"
      >
        <div className="flex items-center justify-between gap-4 border-b border-amber-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 id="notebook-title" className="text-xl sm:text-2xl font-extrabold text-[#134e4a]">
                دفترچه کارآگاهی نورک
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-900 tabular-nums">
                سرنخ‌های پیدا شده: {foundCount} از {clues.length}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن دفترچه"
            className="inline-flex items-center gap-1.5 min-h-12 px-4 py-2 rounded-2xl bg-white hover:bg-rose-50 text-slate-800 font-bold border-2 border-slate-300 active:scale-95 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5" />
            <span>بستن</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {clues.map((clue, index) => {
            const isFound = discoveredClueIds.includes(clue.id);

            if (!isFound) {
              return (
                <div
                  key={clue.id}
                  data-testid={`notebook-slot-empty-${clue.id}`}
                  className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/60 p-4"
                >
                  <div className="w-20 h-20 rounded-2xl bg-amber-100 border-2 border-dashed border-amber-300 flex items-center justify-center shrink-0 text-amber-600">
                    <HelpCircle className="w-9 h-9" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-extrabold text-amber-900">
                      جای خالی سرنخ شماره {index + 1}
                    </p>
                    <p className="text-sm text-amber-800">
                      هنوز پیدا نشده است. در میدان روشن خوب بگرد و اشیا را لمس کن!
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={clue.id}
                data-testid={`notebook-slot-found-${clue.id}`}
                className="flex items-center gap-4 rounded-2xl border-2 border-teal-300 bg-white p-4 shadow-sm"
              >
                <ClueIllustration kind={clue.illustrationKey} size={84} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{clue.titleFa}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#134e4a]">
                    {clue.shortLabelFa}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {clue.descriptionFa}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 px-7 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-base shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            بازگشت به میدان
          </button>
        </div>
      </div>
    </div>
  );
}
