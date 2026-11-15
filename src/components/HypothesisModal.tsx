import { BookOpen, Check, ChevronLeft, Lightbulb, X } from 'lucide-react';
import { useState } from 'react';
import { NoorakAvatar } from '../characters/NoorakAvatar';
import type { CaseDefinition, NoorakMood } from '../core/types';
import { ClueIllustration } from './ClueIllustration';

interface HypothesisModalProps {
  caseDef: CaseDefinition;
  accepted: boolean;
  onDraftChange: (hypothesisId: string, evidenceIds: string[]) => void;
  discoveredClueIds: string[];
  initialHypothesisId: string | null;
  initialEvidenceIds: string[];
  onSubmitReasoning: (
    hypothesisId: string,
    evidenceIds: string[],
  ) => { isValid: boolean; feedbackFa: string };
  onOpenNotebook: () => void;
  onRequestHint: () => void;
  onSuccessProceed: () => void;
  onClose: () => void;
}

export function HypothesisModal({
  caseDef,
  accepted,
  onDraftChange,
  discoveredClueIds,
  initialHypothesisId,
  initialEvidenceIds,
  onSubmitReasoning,
  onOpenNotebook,
  onRequestHint,
  onSuccessProceed,
  onClose,
}: HypothesisModalProps) {
  const selectedHypothesisId = initialHypothesisId ?? '';
  const selectedEvidenceIds = initialEvidenceIds;
  const [feedback, setFeedback] = useState<{
    isValid: boolean;
    messageFa: string;
  } | null>(accepted ? { isValid: true, messageFa: caseDef.correctReasoningFeedbackFa } : null);

  const discoveredClues = caseDef.clues.filter((clue) =>
    discoveredClueIds.includes(clue.id),
  );

  const toggleEvidence = (clueId: string) => {
    setFeedback(null);
    onDraftChange(selectedHypothesisId,
      selectedEvidenceIds.includes(clueId) ? selectedEvidenceIds.filter((id) => id !== clueId) : [...selectedEvidenceIds, clueId],
    );
  };

  const handleSubmit = () => {
    if (!selectedHypothesisId) {
      setFeedback({
        isValid: false,
        messageFa: 'ابتدا یکی از سه گزینه علت خاموش شدن فواره را انتخاب کن.',
      });
      return;
    }
    if (selectedEvidenceIds.length === 0) {
      setFeedback({
        isValid: false,
        messageFa: 'حداقل یک کارت سرنخ را به عنوان شاهد برای نظر خودت انتخاب کن.',
      });
      return;
    }

    const result = onSubmitReasoning(selectedHypothesisId, selectedEvidenceIds);
    setFeedback({
      isValid: result.isValid,
      messageFa: result.feedbackFa,
    });
  };

  const noorakMood: NoorakMood = feedback
    ? feedback.isValid
      ? 'happy'
      : 'thinking'
    : 'guiding';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 safe-area-inset">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hypothesis-title"
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#fffdf7] border-4 border-teal-700/35 shadow-2xl p-5 sm:p-7 space-y-5"
      >
        {/* Header with Noorak Question */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <NoorakAvatar mood={noorakMood} size={74} className="shrink-0" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-teal-800">
                زمان فکر کردن و استدلال کارآگاهی
              </p>
              <h2
                id="hypothesis-title"
                className="text-lg sm:text-2xl font-extrabold text-[#134e4a]"
              >
                {caseDef.hypothesisQuestionFa}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره فرضیه"
            className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Hypothesis Options */}
        <div className="space-y-2.5">
          <p className="text-sm font-extrabold text-slate-700">
            ۱. یک فرضیه را انتخاب کن:
          </p>
          <div className="grid grid-cols-1 gap-2.5">
            {caseDef.hypotheses.map((hyp, index) => {
              const isSelected = selectedHypothesisId === hyp.id;
              return (
                <button
                  key={hyp.id}
                  type="button"
                  disabled={Boolean(feedback?.isValid)}
                  onClick={() => {
                    onDraftChange(hyp.id, selectedEvidenceIds);
                    setFeedback(null);
                  }}
                  className={`w-full text-right flex items-center justify-between gap-3 min-h-13 px-4 py-3 rounded-2xl border-2 font-bold text-sm sm:text-base transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 border-teal-700 text-[#134e4a]'
                      : 'bg-white border-slate-200 hover:border-teal-400 text-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-extrabold tabular-nums shrink-0 ${
                        isSelected
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span>{hyp.textFa}</span>
                  </span>
                  {isSelected && <Check className="w-5 h-5 text-teal-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Supporting Evidence Cards */}
        <div className="space-y-2.5">
          <p className="text-sm font-extrabold text-slate-700">
            ۲. {caseDef.evidencePromptFa}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {discoveredClues.map((clue) => {
              const isChosen = selectedEvidenceIds.includes(clue.id);
              return (
                <button
                  key={clue.id}
                  type="button"
                  disabled={Boolean(feedback?.isValid)}
                  onClick={() => toggleEvidence(clue.id)}
                  className={`flex flex-col items-center text-center gap-2 p-3 rounded-2xl border-2 transition-colors cursor-pointer ${
                    isChosen
                      ? 'bg-amber-50 border-amber-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <ClueIllustration kind={clue.illustrationKey} size={68} />
                  <span className="text-sm font-extrabold text-[#134e4a]">
                    {clue.titleFa}
                  </span>
                  <span className="text-xs text-slate-600 leading-snug">
                    {clue.shortLabelFa}
                  </span>
                  <span
                    className={`mt-auto inline-flex items-center gap-1 text-xs font-extrabold ${
                      isChosen ? 'text-amber-800' : 'text-slate-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isChosen ? 'انتخاب شد' : 'انتخاب به عنوان شاهد'}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gentle Feedback Banner */}
        {feedback && (
          <div
            role="status"
            className={`rounded-2xl p-4 border-2 text-sm sm:text-base font-bold leading-relaxed ${
              feedback.isValid
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-amber-50 border-amber-400 text-amber-950'
            }`}
          >
            {feedback.messageFa}
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenNotebook}
              className="inline-flex items-center gap-2 min-h-12 px-4 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-sm cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>بررسی دوباره دفترچه</span>
            </button>
            <button
              type="button"
              onClick={onRequestHint}
              className="inline-flex items-center gap-2 min-h-12 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>راهنمای نورک</span>
            </button>
          </div>

          {feedback?.isValid ? (
            <button
              type="button"
              onClick={onSuccessProceed}
              className="inline-flex items-center justify-center gap-2 min-h-12 px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base shadow-lg active:scale-95 transition-transform cursor-pointer"
            >
              <span>بیایید شیر آب را باز کنیم!</span>
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-2 min-h-12 px-7 py-3 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-base shadow-lg active:scale-95 transition-transform cursor-pointer"
            >
              <span>بررسی پاسخ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
