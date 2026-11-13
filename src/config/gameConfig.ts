import { LevelConfig, Point } from '../types/game';

/**
 * Nome do criador exibido na tela inicial e no rodapé.
 * Substitua "[Seu Nome Aqui]" pelo seu nome antes de publicar no GitHub/Vercel.
 */
export const CREATOR_NAME = '[Seu Nome Aqui]';

/**
 * Regras de validação do nome do jogador.
 */
export const PLAYER_NAME_MIN_LENGTH = 2;
export const PLAYER_NAME_MAX_LENGTH = 20;

/**
 * Pontuação base por alimento coletado.
 */
export const NORMAL_FOOD_POINTS = 10;
export const BONUS_FOOD_POINTS = 25;

/**
 * Chaves utilizadas no localStorage para persistência entre sessões.
 */
export const STORAGE_KEYS = {
  LEADERBOARD: 'cobrinha_ranking_v1',
  LAST_PLAYER: 'cobrinha_ultimo_jogador_v1',
  SOUND_MUTED: 'cobrinha_som_mutado_v1',
} as const;

/**
 * Helper para criar pares simétricos de obstáculos sem bloquear a faixa central.
 */
function pt(x: number, y: number): Point {
  return { x, y };
}

/**
 * Lista de níveis com dificuldade progressiva (velocidade, área e obstáculos).
 * Há 5 níveis principais com meta de pontuação e um 6º nível infinito para recordes.
 */
export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'Campo Aberto',
    description: 'Área ampla e sem obstáculos para aquecer os reflexos.',
    gridSize: 20,
    speedMs: 145,
    targetScore: 50,
    obstacles: [],
  },
  {
    level: 2,
    name: 'Cantos Guardados',
    description: 'Velocidade moderada com os primeiros blocos nos cantos.',
    gridSize: 20,
    speedMs: 122,
    targetScore: 120,
    obstacles: [
      pt(4, 4), pt(4, 5),
      pt(15, 4), pt(15, 5),
      pt(4, 14), pt(4, 15),
      pt(15, 14), pt(15, 15),
    ],
  },
  {
    level: 3,
    name: 'Pilares da Arena',
    description: 'Tabuleiro reduzido (18×18) e pilares estratégicos no trajeto.',
    gridSize: 18,
    speedMs: 104,
    targetScore: 210,
    obstacles: [
      pt(3, 3), pt(4, 3),
      pt(13, 3), pt(14, 3),
      pt(3, 14), pt(4, 14),
      pt(13, 14), pt(14, 14),
      pt(8, 5), pt(9, 5),
      pt(8, 12), pt(9, 12),
    ],
  },
  {
    level: 4,
    name: 'Corredores Estreitos',
    description: 'Ritmo acelerado com barreiras em L exigindo curvas precisas.',
    gridSize: 18,
    speedMs: 88,
    targetScore: 320,
    obstacles: [
      pt(4, 4), pt(5, 4), pt(4, 5),
      pt(13, 4), pt(12, 4), pt(13, 5),
      pt(4, 13), pt(5, 13), pt(4, 12),
      pt(13, 13), pt(12, 13), pt(13, 12),
      pt(8, 3), pt(9, 3),
      pt(8, 14), pt(9, 14),
    ],
  },
  {
    level: 5,
    name: 'Desafio Compacto',
    description: 'Arena de 16×16 em alta velocidade com obstáculos fechados.',
    gridSize: 16,
    speedMs: 74,
    targetScore: 450,
    obstacles: [
      pt(3, 3), pt(4, 3),
      pt(11, 3), pt(12, 3),
      pt(3, 12), pt(4, 12),
      pt(11, 12), pt(12, 12),
      pt(7, 4), pt(8, 4),
      pt(7, 11), pt(8, 11),
      pt(2, 6), pt(13, 6),
      pt(2, 9), pt(13, 9),
    ],
  },
  {
    level: 6,
    name: 'Mestre Infinito',
    description: 'Sem meta fixa: sobreviva na velocidade máxima e lidere o ranking.',
    gridSize: 16,
    speedMs: 64,
    targetScore: null,
    obstacles: [
      pt(3, 3), pt(4, 3),
      pt(11, 3), pt(12, 3),
      pt(3, 12), pt(4, 12),
      pt(11, 12), pt(12, 12),
      pt(7, 4), pt(8, 4),
      pt(7, 11), pt(8, 11),
      pt(2, 6), pt(13, 6),
      pt(2, 9), pt(13, 9),
    ],
  },
];
