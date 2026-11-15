import { BookOpen, Lightbulb, Pause, SearchCheck, Volume2, VolumeX, Wrench } from 'lucide-react';
import type { CasePhase } from '../core/types';

interface HudOverlayProps {
  phase: CasePhase;
  discoveredCount: number;
  totalCluesCount: number;
  allCluesFound: boolean;
  muted: boolean;
  onOpenNotebook: () => void;
  onRequestHint: () => void;
  onOpenHypothesis: () => void;
  onToggleMute: () => void;
  onPause: () => void;
}

export function HudOverlay({
  phase,
  discoveredCount,
  totalCluesCount,
  allCluesFound,
  muted,
  onOpenNotebook,
  onRequestHint,
  onOpenHypothesis,
  onToggleMute,
  onPause,
}: HudOverlayProps) {
  return (
    <div className="fixed inset-0 z-20 pointer-events-none safe-area-inset flex flex-col justify-between p-3 sm:p-4">
      {/* Top Perimeter Clusters only — >= 85% of courtyard viewport stays unobstructed */}
      <div className="flex items-start justify-between gap-2 w-full">
        {/* Top-Right Cluster: Clue Progress, Notebook, Hint, Reasoning CTA */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onOpenNotebook}
            className="inline-flex items-center gap-2.5 min-h-12 px-4 py-2 rounded-2xl bg-[#fffdf7]/95 hover:bg-amber-50 text-[#134e4a] font-bold shadow-lg border-2 border-teal-700/25 active:scale-95 transition-transform cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-teal-700 shrink-0" />
            <span className="text-sm sm:text-base whitespace-nowrap">دفترچه کارآگاهی</span>
            <span
              data-testid="clue-counter"
              className="inline-flex items-center justify-center min-w-10 px-2 py-0.5 rounded-xl bg-teal-700 text-white text-xs sm:text-sm font-extrabold tabular-nums"
            >
              {discoveredCount}/{totalCluesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onRequestHint}
            className="inline-flex items-center gap-2 min-h-12 px-4 py-2 rounded-2xl bg-amber-300 hover:bg-amber-200 text-[#134e4a] font-bold shadow-lg border-2 border-amber-500/40 active:scale-95 transition-transform cursor-pointer"
          >
            <Lightbulb className="w-5 h-5 text-amber-800 shrink-0" />
            <span className="text-sm sm:text-base whitespace-nowrap">راهنمای نورک</span>
          </button>

          {allCluesFound && (phase === 'explore' || phase === 'hypothesis') && (
            <button
              type="button"
              onClick={onOpenHypothesis}
              className="inline-flex items-center gap-2 min-h-12 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg border-2 border-emerald-300 active:scale-95 transition-transform cursor-pointer"
            >
              <SearchCheck className="w-5 h-5 shrink-0" />
              <span className="text-sm sm:text-base whitespace-nowrap">حدس علت مشکل</span>
            </button>
          )}

          {phase === 'fix' && (
            <div className="inline-flex items-center gap-2 min-h-12 px-4 py-2 rounded-2xl bg-rose-600 text-white font-bold shadow-lg border-2 border-rose-200">
              <Wrench className="w-5 h-5 shrink-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">
                شیر آب کنار باغچه را لمس کن!
              </span>
            </div>
          )}
        </div>

        {/* Top-Left Cluster: Mute & Pause square icon controls */}
        <div className="flex items-center gap-2 pointer-events-auto shrink-0">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={muted ? 'روشن کردن صدا [M]' : 'بی‌صدا کردن [M]'}
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#fffdf7]/95 hover:bg-amber-50 text-[#134e4a] shadow-lg border-2 border-teal-700/25 active:scale-95 transition-transform cursor-pointer"
          >
            {muted ? <VolumeX className="w-5 h-5 text-rose-600" /> : <Volume2 className="w-5 h-5 text-teal-700" />}
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            aria-label="توقف و تنظیمات بازی [P]"
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#fffdf7]/95 hover:bg-amber-50 text-[#134e4a] shadow-lg border-2 border-teal-700/25 active:scale-95 transition-transform cursor-pointer"
          >
            <Pause className="w-5 h-5 text-teal-800" />
          </button>
        </div>
      </div>

      {/* Bottom subtle mission prompt only when exploring and not covered by dialogue */}
      {phase === 'explore' && !allCluesFound && (
        <div className="self-center pointer-events-none">
          <div className="px-4 py-2 rounded-2xl bg-[#fffdf7]/92 text-[#134e4a] text-xs sm:text-sm font-bold shadow-md border border-teal-700/20">
            اجزای میدان را لمس کن تا ۳ سرنخ پیدا شوند.
          </div>
        </div>
      )}
    </div>
  );
}
