/**
 * Coordenada inteira na grade do tabuleiro.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Direções possíveis de movimento da cobrinha.
 */
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/**
 * Estados principais da máquina de estados do jogo.
 */
export type GameStatus =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_TRANSITION'
  | 'GAME_OVER';

/**
 * Tipo de fruta exibida no tabuleiro.
 */
export type FoodKind = 'NORMAL' | 'BONUS';

/**
 * Representação do alimento ativo no tabuleiro.
 */
export interface FoodItem {
  position: Point;
  kind: FoodKind;
  points: number;
}

/**
 * Configuração completa de cada nível de dificuldade.
 */
export interface LevelConfig {
  level: number;
  name: string;
  description: string;
  gridSize: number;
  speedMs: number;
  targetScore: number | null;
  obstacles: Point[];
}

/**
 * Registro de pontuação salvo no ranking local.
 */
export interface ScoreEntry {
  id: string;
  playerName: string;
  score: number;
  levelReached: number;
  createdAt: string;
}
