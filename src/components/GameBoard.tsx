import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, UserRound } from 'lucide-react';
import {
  CREATOR_NAME,
  PLAYER_NAME_MAX_LENGTH,
  PLAYER_NAME_MIN_LENGTH,
} from '../config/gameConfig';
import {
  Direction,
  FoodItem,
  GameStatus,
  LevelConfig,
  Point,
} from '../types/game';

interface GameBoardProps {
  status: GameStatus;
  snake: Point[];
  food: FoodItem;
  direction: Direction;
  levelConfig: LevelConfig;
  score: number;
  bestScore: number;
  playerName: string;
  gameOverReason: string;
  currentRank: number | null;
  isNewRecord: boolean;
  onStartGame: (validatedName: string) => void;
  onResumeGame: () => void;
  onEndToMenu: () => void;
  onSwipeDirection: (dir: Direction) => void;
}

/**
 * Renderiza o tabuleiro HTML5 Canvas de alta definição e as telas de estado do jogo.
 */
export function GameBoard({
  status,
  snake,
  food,
  direction,
  levelConfig,
  score,
  bestScore,
  playerName,
  gameOverReason,
  currentRank,
  isNewRecord,
  onStartGame,
  onResumeGame,
  onEndToMenu,
  onSwipeDirection,
}: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const [nameInput, setNameInput] = useState(playerName);
  const [nameError, setNameError] = useState<string | null>(null);

  // Sincroniza campo caso o nome salvo seja atualizado externamente
  useEffect(() => {
    setNameInput(playerName);
  }, [playerName]);

  // Renderização contínua do tabuleiro em Canvas com escala nítida (devicePixelRatio)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const cssSize = Math.max(260, Math.floor(Math.min(rect.width, rect.height)));
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== cssSize * dpr || canvas.height !== cssSize * dpr) {
      canvas.width = cssSize * dpr;
      canvas.height = cssSize * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const gridSize = levelConfig.gridSize;
    const cellSize = cssSize / gridSize;

    // 1. Fundo da arena em padrão quadriculado sutil
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#0F172A' : '#131C31';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize + 0.5, cellSize + 0.5);
      }
    }

    // 2. Obstáculos sólidos com chanfro discreto
    for (const obs of levelConfig.obstacles) {
      const pad = Math.max(1.5, cellSize * 0.08);
      const bx = obs.x * cellSize + pad;
      const by = obs.y * cellSize + pad;
      const bw = cellSize - pad * 2;
      const bh = cellSize - pad * 2;
      const radius = Math.max(3, cellSize * 0.18);

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, radius);
      ctx.fill();

      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Marca diagonal interna discreta para reforçar visual de bloqueio sem depender só de cor
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(bx + bw * 0.28, by + bh * 0.28);
      ctx.lineTo(bx + bw * 0.72, by + bh * 0.72);
      ctx.moveTo(bx + bw * 0.72, by + bh * 0.28);
      ctx.lineTo(bx + bw * 0.28, by + bh * 0.72);
      ctx.stroke();
    }

    // 3. Alimento (fruta comum vermelha ou fruta bônus dourada)
    const fx = food.position.x * cellSize + cellSize / 2;
    const fy = food.position.y * cellSize + cellSize / 2;
    const foodRadius = cellSize * 0.36;

    if (food.kind === 'BONUS') {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
      ctx.beginPath();
      ctx.arc(fx, fy, foodRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(fx, fy, foodRadius, 0, Math.PI * 2);
      ctx.fill();

      // Brilho interno
      ctx.fillStyle = '#FEF3C7';
      ctx.beginPath();
      ctx.arc(fx - foodRadius * 0.28, fy - foodRadius * 0.28, foodRadius * 0.24, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(fx, fy, foodRadius, 0, Math.PI * 2);
      ctx.fill();

      // Folha superior da maçã
      ctx.fillStyle = '#34D399';
      ctx.beginPath();
      ctx.ellipse(
        fx + foodRadius * 0.22,
        fy - foodRadius * 0.85,
        foodRadius * 0.32,
        foodRadius * 0.16,
        -0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // 4. Corpo e cabeça da cobrinha
    const total = snake.length;
    for (let i = total - 1; i >= 0; i--) {
      const seg = snake[i];
      const isHead = i === 0;
      const ratio = total > 1 ? i / (total - 1) : 0;

      const pad = isHead ? cellSize * 0.06 : cellSize * 0.1;
      const sx = seg.x * cellSize + pad;
      const sy = seg.y * cellSize + pad;
      const sw = cellSize - pad * 2;
      const sh = cellSize - pad * 2;
      const radius = isHead ? cellSize * 0.32 : cellSize * 0.26;

      if (isHead) {
        ctx.fillStyle = '#10B981';
      } else {
        // Gradiente suave da cabeça até a cauda
        const green = Math.round(165 - ratio * 55);
        const blue = Math.round(115 - ratio * 35);
        ctx.fillStyle = `rgb(5, ${green}, ${blue})`;
      }

      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, radius);
      ctx.fill();

      // Olhos direcionais na cabeça da cobrinha
      if (isHead) {
        const eyeRadius = Math.max(1.8, cellSize * 0.1);
        const cx = seg.x * cellSize + cellSize / 2;
        const cy = seg.y * cellSize + cellSize / 2;
        const forwardOffset = cellSize * 0.16;
        const sideOffset = cellSize * 0.18;

        let eye1: Point;
        let eye2: Point;

        if (direction === 'RIGHT') {
          eye1 = { x: cx + forwardOffset, y: cy - sideOffset };
          eye2 = { x: cx + forwardOffset, y: cy + sideOffset };
        } else if (direction === 'LEFT') {
          eye1 = { x: cx - forwardOffset, y: cy - sideOffset };
          eye2 = { x: cx - forwardOffset, y: cy + sideOffset };
        } else if (direction === 'UP') {
          eye1 = { x: cx - sideOffset, y: cy - forwardOffset };
          eye2 = { x: cx + sideOffset, y: cy - forwardOffset };
        } else {
          eye1 = { x: cx - sideOffset, y: cy + forwardOffset };
          eye2 = { x: cx + sideOffset, y: cy + forwardOffset };
        }

        ctx.fillStyle = '#062E22';
        ctx.beginPath();
        ctx.arc(eye1.x, eye1.y, eyeRadius, 0, Math.PI * 2);
        ctx.arc(eye2.x, eye2.y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }, [snake, food, direction, levelConfig, status]);

  // Validação simples do nome antes de iniciar a partida
  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameInput.trim().replace(/\s+/g, ' ');

    if (!cleaned) {
      setNameError('Digite seu nome antes de iniciar a partida.');
      return;
    }

    if (cleaned.length < PLAYER_NAME_MIN_LENGTH) {
      setNameError(`O nome deve ter pelo menos ${PLAYER_NAME_MIN_LENGTH} caracteres.`);
      return;
    }

    if (cleaned.length > PLAYER_NAME_MAX_LENGTH) {
      setNameError(`O nome deve ter no máximo ${PLAYER_NAME_MAX_LENGTH} caracteres.`);
      return;
    }

    setNameError(null);
    onStartGame(cleaned);
  };

  // Reconhecimento de gesto de deslize (swipe) sobre a arena
  const handleTouchStart = (e: React.TouchEvent) => {
    if (status !== 'PLAYING') return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (status !== 'PLAYING' || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const threshold = 24;

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      touchStartRef.current = null;
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      onSwipeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      onSwipeDirection(dy > 0 ? 'DOWN' : 'UP');
    }

    touchStartRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative mx-auto w-full max-w-[540px] aspect-square min-h-[380px] overflow-hidden rounded-2xl border border-slate-800 bg-[#0F172A] shadow-xl ${
        status === 'PLAYING' ? 'touch-none' : ''
      }`}
    >
      <canvas
        ref={canvasRef}
        aria-label="Tabuleiro do jogo da Cobrinha"
        className="block h-full w-full"
      />

      {/* Tela Inicial: identificação do jogador e créditos */}
      {status === 'TITLE_MENU' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/82 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/95 p-5 sm:p-6 shadow-2xl">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50 text-balance">
              Desafio da Cobrinha
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Atravesse 6 níveis com velocidade crescente, obstáculos e metas de pontuação.
            </p>

            <form onSubmit={validateAndSubmit} noValidate className="mt-4 space-y-3">
              <div>
                <label
                  htmlFor="player-name-input"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Nome do jogador
                </label>
                <div className="relative">
                  <UserRound
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="player-name-input"
                    type="text"
                    value={nameInput}
                    maxLength={PLAYER_NAME_MAX_LENGTH}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    placeholder="Ex.: Ana Silva"
                    autoComplete="nickname"
                    className={`w-full rounded-xl border bg-slate-950/80 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                      nameError
                        ? 'border-rose-500 focus:ring-rose-500/40'
                        : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/30'
                    }`}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  {nameError ? (
                    <span role="alert" className="font-medium text-rose-400">
                      {nameError}
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      De {PLAYER_NAME_MIN_LENGTH} a {PLAYER_NAME_MAX_LENGTH} caracteres
                    </span>
                  )}
                  <span className="font-mono-tabular text-slate-500">
                    {nameInput.trim().length}/{PLAYER_NAME_MAX_LENGTH}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 active:scale-[0.99] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>Iniciar Jogo</span>
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-1 text-center">
              <p className="text-xs font-medium text-slate-300">
                Criado por {CREATOR_NAME}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tela de Pausa */}
      {status === 'PAUSED' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-5">
          <div className="w-full max-w-xs rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-2xl">
            <h2 className="text-xl font-bold text-slate-50">Jogo Pausado</h2>
            <p className="mt-1 text-xs text-slate-400">
              Nível {levelConfig.level} · {score} pontos
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onResumeGame}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>Continuar</span>
              </button>
              <button
                type="button"
                onClick={onEndToMenu}
                className="inline-flex min-h-[42px] w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transição automática ao avançar de nível */}
      {status === 'LEVEL_TRANSITION' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-5">
          <div className="w-full max-w-xs rounded-2xl border border-emerald-500/40 bg-slate-900/95 p-6 text-center shadow-2xl">
            <p className="text-xs font-semibold text-emerald-400">
              Meta alcançada
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-50">
              Nível {levelConfig.level}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-200">
              {levelConfig.name}
            </p>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              {levelConfig.description}
            </p>
            <div className="mt-4 text-xs font-mono-tabular text-slate-300">
              Arena {levelConfig.gridSize}×{levelConfig.gridSize} · {levelConfig.speedMs}ms/passo
            </div>
          </div>
        </div>
      )}

      {/* Tela de Fim de Partida */}
      {status === 'GAME_OVER' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/82 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/95 p-5 sm:p-6 text-center shadow-2xl">
            <p className="text-xs font-medium text-rose-400">
              {gameOverReason}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-50">
              Fim de Jogo
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Jogador: <span className="font-semibold text-slate-200">{playerName}</span>
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div>
                <div className="text-[11px] text-slate-400">Pontos</div>
                <div className="mt-0.5 font-mono-tabular text-lg font-bold text-emerald-400">
                  {score}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Nível</div>
                <div className="mt-0.5 font-mono-tabular text-lg font-bold text-slate-100">
                  {levelConfig.level}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Recorde</div>
                <div className="mt-0.5 font-mono-tabular text-lg font-bold text-amber-400">
                  {Math.max(bestScore, score)}
                </div>
              </div>
            </div>

            {currentRank !== null && (
              <p className="mt-3 text-xs font-medium text-slate-300">
                {isNewRecord
                  ? 'Novo recorde geral registrado!'
                  : `Esta partida ficou em #${currentRank} no ranking.`}
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => onStartGame(playerName)}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Jogar Novamente</span>
              </button>
              <button
                type="button"
                onClick={onEndToMenu}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Trocar Jogador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
