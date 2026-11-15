import { Home, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface PauseAudioModalProps {
  muted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (nextVolume: number) => void;
  onResume: () => void;
  onRestartCase: () => void;
  onReturnTitle: () => void;
}

export function PauseAudioModal({
  muted,
  volume,
  onToggleMute,
  onVolumeChange,
  onResume,
  onRestartCase,
  onReturnTitle,
}: PauseAudioModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 safe-area-inset">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
        className="w-full max-w-md rounded-3xl bg-[#fffdf7] border-4 border-teal-700/35 shadow-2xl p-6 space-y-5"
      >
        <h2 id="pause-title" className="text-2xl font-extrabold text-[#134e4a] text-center">
          توقف و تنظیمات صدا
        </h2>

        {/* Audio controls */}
        <div className="rounded-2xl bg-teal-50/80 border border-teal-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-sm text-[#134e4a]">جلوه‌های صوتی بازی</span>
            <button
              type="button"
              onClick={onToggleMute}
              className="inline-flex items-center gap-2 min-h-10 px-3.5 py-1.5 rounded-xl bg-white border border-teal-300 font-bold text-sm text-[#134e4a] cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-teal-700" />}
              <span>{muted ? 'خاموش' : 'روشن'}</span>
            </button>
          </div>

          <div className="space-y-1">
            <label htmlFor="volume-slider" className="flex justify-between text-xs font-bold text-slate-600 tabular-nums">
              <span>بلندی صدا</span>
              <span>{muted ? '0%' : `${Math.round(volume * 100)}%`}</span>
            </label>
            <input
              id="volume-slider"
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : Math.round(volume * 100)}
              onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
              className="w-full accent-teal-700 h-2.5 cursor-pointer"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full inline-flex items-center justify-center gap-2 min-h-13 px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-base shadow-md cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>ادامه بازی</span>
          </button>

          <button
            type="button"
            onClick={onRestartCase}
            className="w-full inline-flex items-center justify-center gap-2 min-h-12 px-5 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-base cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>شروع دوباره پرونده</span>
          </button>

          <button
            type="button"
            onClick={onReturnTitle}
            className="w-full inline-flex items-center justify-center gap-2 min-h-12 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>بازگشت به صفحه اصلی</span>
          </button>
        </div>
      </div>
    </div>
  );
}
