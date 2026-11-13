/**
 * Sintetizador leve via Web Audio API para efeitos sonoros discretos sem arquivos externos.
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }

  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {
      // Ignora erro caso o navegador bloqueie áudio antes de interação do usuário
    });
  }

  return audioContext;
}

function playTone(
  frequency: number,
  durationSeconds: number,
  type: OscillatorType,
  volume: number,
  delaySeconds = 0
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const startTime = ctx.currentTime + delaySeconds;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(volume, startTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    startTime + durationSeconds
  );

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + durationSeconds);
}

/**
 * Som suave ao comer uma fruta comum ou bônus.
 */
export function playEatSound(isBonus: boolean, isMuted: boolean): void {
  if (isMuted) return;
  if (isBonus) {
    playTone(587.33, 0.08, 'triangle', 0.09, 0);
    playTone(880, 0.14, 'triangle', 0.09, 0.06);
  } else {
    playTone(523.25, 0.08, 'sine', 0.08, 0);
    playTone(659.25, 0.09, 'sine', 0.07, 0.04);
  }
}

/**
 * Acorde ascendente ao avançar automaticamente para o próximo nível.
 */
export function playLevelUpSound(isMuted: boolean): void {
  if (isMuted) return;
  playTone(523.25, 0.1, 'triangle', 0.09, 0);
  playTone(659.25, 0.1, 'triangle', 0.09, 0.08);
  playTone(783.99, 0.12, 'triangle', 0.1, 0.16);
  playTone(1046.5, 0.22, 'triangle', 0.1, 0.24);
}

/**
 * Tom curto descendente em caso de colisão / fim de partida.
 */
export function playGameOverSound(isMuted: boolean): void {
  if (isMuted) return;
  playTone(261.63, 0.14, 'sawtooth', 0.06, 0);
  playTone(196.0, 0.24, 'sawtooth', 0.06, 0.12);
}
