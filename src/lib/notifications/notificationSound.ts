/**
 * Universal Notification Chime Synthesizer
 * Uses the Web Audio API to play crisp, pleasant bell chimes.
 * Self-contained, zero external audio files or dependencies, works offline.
 */

export function playNotificationChime() {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // Two-tone bell chime: E5 (659.25 Hz) followed by B5 (987.77 Hz)
    const tones = [
      { freq: 659.25, start: 0, duration: 0.18 },
      { freq: 987.77, start: 0.12, duration: 0.35 },
    ];

    tones.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      // Smooth volume attack and exponential decay
      gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration + 0.05);
    });

    // Close AudioContext after playback completes
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 700);
  } catch (err) {
    console.warn("Audio chime playback omitted:", err);
  }
}

/**
 * Urgent Alert Tri-Tone Synthesizer
 * For critical alerts and high-priority notifications
 */
export function playUrgentAlertSound() {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    const tones = [
      { freq: 880.0, start: 0.0, duration: 0.12 },     // A5
      { freq: 1046.5, start: 0.12, duration: 0.12 },   // C6
      { freq: 1318.51, start: 0.24, duration: 0.28 },  // E6
    ];

    tones.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration + 0.05);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 800);
  } catch (err) {
    console.warn("Urgent alert audio playback omitted:", err);
  }
}
