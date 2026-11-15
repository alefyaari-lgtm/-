export interface VoiceOverAdapter {
  readonly isVoiceAssetAvailable: boolean;
  playClip: (clipKey?: string) => Promise<void>;
  stopCurrent: () => void;
}

class ProceduralSoundSystem {
  private ctx: AudioContext | null = null;
  private muted = false;
  private volume = 0.7;
  private waterLoopTimer: number | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        return null;
      }
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopWaterAmbient();
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public getSettings(): { muted: boolean; volume: number } {
    return { muted: this.muted, volume: this.volume };
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.22,
    delaySec = 0,
    slideToFreq?: number,
  ): void {
    if (this.muted || this.volume <= 0.01) {
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    const startTime = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideToFreq, startTime + durationSec);
    }

    const scaledGain = gainPeak * this.volume;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, scaledGain), startTime + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.03);
  }

  public playTap(): void {
    const pitchJitter = 1 + (Math.random() * 0.08 - 0.04);
    this.playTone(540 * pitchJitter, 0.09, 'triangle', 0.14, 0, 660 * pitchJitter);
  }

  public playPropReaction(): void {
    const jitter = 1 + (Math.random() * 0.1 - 0.05);
    this.playTone(460 * jitter, 0.12, 'sine', 0.16, 0, 580 * jitter);
    this.playTone(680 * jitter, 0.14, 'triangle', 0.12, 0.07);
  }

  public playClueDiscovery(): void {
    this.playTone(523.25, 0.14, 'triangle', 0.2, 0);
    this.playTone(659.25, 0.14, 'triangle', 0.2, 0.09);
    this.playTone(783.99, 0.18, 'triangle', 0.22, 0.18);
    this.playTone(1046.5, 0.34, 'sine', 0.22, 0.27);
  }

  public playGentleNudge(): void {
    this.playTone(330, 0.16, 'sine', 0.15, 0, 280);
    this.playTone(270, 0.22, 'sine', 0.13, 0.12, 240);
  }

  public playValveTurnTick(progressRatio: number): void {
    const base = 240 + progressRatio * 180;
    this.playTone(base, 0.06, 'square', 0.08, 0, base * 1.15);
  }

  public playWaterFlowStart(): void {
    if (this.muted || this.volume <= 0.01) {
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    // Filtered noise burst for gentle water rushing
    const duration = 1.6;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.6;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(520, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1150, ctx.currentTime + 0.9);
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18 * this.volume, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.04 * this.volume, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    this.startWaterAmbient();
  }

  public startWaterAmbient(): void {
    this.stopWaterAmbient();
    if (this.muted || typeof window === 'undefined') {
      return;
    }

    const pulseDrops = () => {
      if (this.muted || this.volume <= 0.01) {
        return;
      }
      const f1 = 780 + Math.random() * 360;
      this.playTone(f1, 0.08, 'sine', 0.045, 0, f1 * 1.25);
    };

    this.waterLoopTimer = window.setInterval(pulseDrops, 420);
  }

  public stopWaterAmbient(): void {
    if (this.waterLoopTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.waterLoopTimer);
      this.waterLoopTimer = null;
    }
  }

  public playVictoryFanfare(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, idx) => {
      this.playTone(n, idx === notes.length - 1 ? 0.55 : 0.18, 'triangle', 0.2, idx * 0.1);
    });
  }
}

export const soundSystem = new ProceduralSoundSystem();

// Ready-to-wire voiceover interface for future Persian studio recordings in /public/assets/audio/
export const voiceOverAdapter: VoiceOverAdapter = {
  isVoiceAssetAvailable: false,
  async playClip(_clipKey?: string): Promise<void> {
    // Future integration: load `/assets/audio/${clipKey}.mp3` when studio voiceover tracks are added.
  },
  stopCurrent(): void {
    // Stop active AudioBufferSourceNode / HTMLAudioElement if playing.
  },
};
