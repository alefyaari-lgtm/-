import { X } from 'lucide-react';
import { NoorakAvatar } from '../characters/NoorakAvatar';
import { RahaAvatar } from '../characters/RahaAvatar';
import type { SpeakerId } from '../core/types';

interface ToastFeedbackProps {
  speaker: SpeakerId;
  speakerNameFa: string;
  titleFa: string;
  messageFa: string;
  onDismiss: () => void;
}

export function ToastFeedback({
  speaker,
  speakerNameFa,
  titleFa,
  messageFa,
  onDismiss,
}: ToastFeedbackProps) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-30 px-4 pointer-events-none flex justify-center safe-area-inset">
      <div
        role="status"
        className="pointer-events-auto w-full max-w-xl rounded-3xl bg-[#fffdf7] border-3 border-teal-500/40 shadow-xl p-3.5 sm:p-4 flex items-center gap-3.5"
      >
        <div className="shrink-0">
          {speaker === 'raha' ? (
            <RahaAvatar mood="curious" size={62} />
          ) : (
            <NoorakAvatar mood="normal" size={62} />
          )}
        </div>

        <div className="flex-1 space-y-0.5">
          <p className="text-xs font-extrabold text-teal-800">
            {speakerNameFa} · {titleFa}
          </p>
          <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
            {messageFa}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="بستن پیام"
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 inline-flex items-center justify-center text-slate-700 cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
