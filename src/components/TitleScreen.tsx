import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import titleBg from '../assets/images/title_meydan_bg_1794738644696.jpg';
import { NoorakAvatar } from '../characters/NoorakAvatar';
import { RahaAvatar } from '../characters/RahaAvatar';

interface TitleScreenProps {
  hasSavedProgress: boolean;
  isCaseCompleted: boolean;
  muted: boolean;
  onStartNewOrContinue: () => void;
  onStartFresh: () => void;
  onToggleMute: () => void;
}

export function TitleScreen({
  hasSavedProgress,
  isCaseCompleted,
  muted,
  onStartNewOrContinue,
  onStartFresh,
  onToggleMute,
}: TitleScreenProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0e3a42] safe-area-inset">
      {/* Illustrated Key-Art Backdrop */}
      <img
        src={titleBg}
        alt="تصویر میدان روشن در سرزمین روشن"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-left-bottom select-none pointer-events-none"
      />

      {/* Measured contrast scrim on right/top side and subtle bottom strip for crisp RTL legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(11, 46, 53, 0.78) 0%, rgba(11, 46, 53, 0.28) 14%, transparent 28%), linear-gradient(250deg, rgba(11, 46, 53, 0.88) 0%, rgba(11, 46, 53, 0.56) 44%, rgba(11, 46, 53, 0.08) 78%, rgba(11, 46, 53, 0.2) 100%)',
        }}
      />

      {/* Top-left compact sound toggle */}
      <div className="absolute top-4 left-4 z-20">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'روشن کردن صدا' : 'بی‌صدا کردن بازی'}
          className="inline-flex items-center gap-2 min-h-12 px-4 py-2 rounded-2xl bg-[#fffdf7] text-[#134e4a] font-bold shadow-lg border-2 border-teal-700/20 hover:bg-amber-50 active:scale-95 transition-transform cursor-pointer"
        >
          {muted ? <VolumeX className="w-5 h-5 text-rose-600" /> : <Volume2 className="w-5 h-5 text-teal-700" />}
          <span className="text-sm whitespace-nowrap">{muted ? 'صدا خاموش' : 'صدا روشن'}</span>
        </button>
      </div>

      {/* Main RTL Title Lockup positioned in calm sky/right negative space */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 [@media(max-height:500px)]:p-3">
        <div className="max-w-xl self-start flex flex-col items-start gap-2.5 sm:gap-4 [@media(max-height:500px)]:gap-2 my-auto">
          {/* Bespoke SVG Title Emblem */}
          <div className="flex items-center gap-3 [@media(max-height:500px)]:hidden">
            <div className="bg-[#fffdf7]/95 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-xl border-2 border-amber-300">
              <span className="inline-flex sm:hidden">
                <NoorakAvatar mood="guiding" size={56} />
              </span>
              <span className="hidden sm:inline-flex">
                <NoorakAvatar mood="guiding" size={74} />
              </span>
            </div>
            <div className="bg-[#fffdf7]/95 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-xl border-2 border-teal-300 hidden sm:block">
              <RahaAvatar mood="happy" size={74} />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-amber-200 font-bold text-xs sm:text-base [@media(max-height:500px)]:text-xs">
              سرزمین روشن · پرونده نخست
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl [@media(max-height:500px)]:text-3xl font-extrabold text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)] leading-tight">
              کارآگاه نورک
            </h1>
            <h2 className="text-lg sm:text-2xl [@media(max-height:500px)]:text-base font-bold text-amber-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
              راز فواره خاموش
            </h2>
          </div>

          <p className="text-white/95 text-sm sm:text-lg [@media(max-height:500px)]:text-xs leading-relaxed max-w-md drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            فواره میدان روشن از کار افتاده است! همراه نورک و رها سرنخ‌ها را پیدا کنید و راز آن را کشف نمایید.
          </p>

          {/* Primary Actions (<= 3 menu actions total) */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-0.5">
            <button
              type="button"
              data-start="true"
              onClick={onStartNewOrContinue}
              className="inline-flex items-center justify-center gap-2.5 min-h-12 sm:min-h-14 [@media(max-height:500px)]:min-h-11 px-6 sm:px-8 py-2.5 sm:py-3.5 [@media(max-height:500px)]:py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#134e4a] font-extrabold text-base sm:text-lg shadow-xl border-2 border-amber-200 active:scale-95 transition-transform cursor-pointer whitespace-nowrap"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <span>
                {hasSavedProgress && !isCaseCompleted
                  ? 'ادامه پرونده'
                  : isCaseCompleted
                    ? 'بازگشت به میدان'
                    : 'شروع پرونده'}
              </span>
            </button>

            {(hasSavedProgress || isCaseCompleted) && (
              <button
                type="button"
                onClick={onStartFresh}
                className="inline-flex items-center justify-center gap-2 min-h-12 sm:min-h-14 [@media(max-height:500px)]:min-h-11 px-4 sm:px-5 py-2.5 sm:py-3.5 [@media(max-height:500px)]:py-2 rounded-2xl bg-[#fffdf7] hover:bg-teal-50 text-[#134e4a] font-bold text-sm sm:text-base shadow-lg border-2 border-teal-200 active:scale-95 transition-transform cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>شروع از ابتدا</span>
              </button>
            )}
          </div>
        </div>

        {/* Single flat borderless control-hint line in bottom safe margin */}
        <p className="text-white/95 text-[11px] sm:text-sm font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)] shrink-0">
          کلیک یا لمس برای بررسی میدان · دکمه Enter یا Space برای شروع · کلید P برای توقف
        </p>
      </div>
    </div>
  );
}
