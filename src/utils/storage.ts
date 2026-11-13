import { STORAGE_KEYS } from '../config/gameConfig';
import { ScoreEntry } from '../types/game';

/**
 * Ordena as pontuações da maior para a menor (desempate por nível e data mais recente).
 */
export function sortLeaderboard(entries: ScoreEntry[]): ScoreEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.levelReached !== a.levelReached) return b.levelReached - a.levelReached;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Carrega a lista de pontuações salva no localStorage com tratamento de falhas.
 */
export function loadLeaderboard(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const validEntries: ScoreEntry[] = parsed.filter(
      (item): item is ScoreEntry =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.playerName === 'string' &&
        typeof item.score === 'number' &&
        typeof item.levelReached === 'number' &&
        typeof item.createdAt === 'string'
    );

    return sortLeaderboard(validEntries);
  } catch {
    return [];
  }
}

/**
 * Registra uma nova pontuação no ranking local (mantém até 50 melhores registros).
 */
export function saveScoreEntry(entry: ScoreEntry): ScoreEntry[] {
  const current = loadLeaderboard();
  const updated = sortLeaderboard([...current, entry]).slice(0, 50);

  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updated));
  } catch {
    // Ignora erro caso o armazenamento do navegador esteja cheio ou restrito
  }

  return updated;
}

/**
 * Limpa todo o histórico de pontuações armazenado no navegador.
 */
export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
  } catch {
    // Ignora falha de acesso ao localStorage
  }
}

/**
 * Recupera o último nome de jogador utilizado.
 */
export function loadLastPlayerName(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_PLAYER) ?? '';
  } catch {
    return '';
  }
}

/**
 * Persiste o nome do jogador atual para sessões futuras.
 */
export function saveLastPlayerName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_PLAYER, name);
  } catch {
    // Ignora falha de acesso ao localStorage
  }
}

/**
 * Recupera a preferência de áudio (mutado ou ativo).
 */
export function loadSoundMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.SOUND_MUTED) === 'true';
  } catch {
    return false;
  }
}

/**
 * Salva a preferência de áudio do jogador.
 */
export function saveSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND_MUTED, String(muted));
  } catch {
    // Ignora falha de acesso ao localStorage
  }
}
