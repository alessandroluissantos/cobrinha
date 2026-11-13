import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Footer } from './components/Footer';
import { GameBoard } from './components/GameBoard';
import { Header } from './components/Header';
import { Leaderboard } from './components/Leaderboard';
import { LevelsOverview } from './components/LevelsOverview';
import { TouchControls } from './components/TouchControls';
import {
  BONUS_FOOD_POINTS,
  LEVELS,
  NORMAL_FOOD_POINTS,
} from './config/gameConfig';
import {
  Direction,
  FoodItem,
  GameStatus,
  LevelConfig,
  Point,
  ScoreEntry,
} from './types/game';
import {
  playEatSound,
  playGameOverSound,
  playLevelUpSound,
} from './utils/sound';
import {
  clearLeaderboard,
  loadLastPlayerName,
  loadLeaderboard,
  loadSoundMuted,
  saveLastPlayerName,
  saveScoreEntry,
  saveSoundMuted,
} from './utils/storage';

/**
 * Cria a posição inicial segura da cobrinha no centro horizontal da grade.
 */
function createInitialSnake(gridSize: number): Point[] {
  const centerY = Math.floor(gridSize / 2);
  const headX = Math.floor(gridSize / 2) - 1;
  return [
    { x: headX, y: centerY },
    { x: headX - 1, y: centerY },
    { x: headX - 2, y: centerY },
  ];
}

/**
 * Sorteia uma célula livre (fora da cobrinha e dos obstáculos) para posicionar o alimento.
 */
function spawnFood(
  gridSize: number,
  snake: Point[],
  obstacles: Point[],
  allowBonus: boolean
): FoodItem {
  const occupied = new Set<string>();
  for (const seg of snake) occupied.add(`${seg.x},${seg.y}`);
  for (const obs of obstacles) occupied.add(`${obs.x},${obs.y}`);

  const freeCells: Point[] = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }

  const chosen =
    freeCells.length > 0
      ? freeCells[Math.floor(Math.random() * freeCells.length)]
      : { x: 0, y: 0 };

  const isBonus = allowBonus && Math.random() < 0.2;
  return {
    position: chosen,
    kind: isBonus ? 'BONUS' : 'NORMAL',
    points: isBonus ? BONUS_FOOD_POINTS : NORMAL_FOOD_POINTS,
  };
}

/**
 * Verifica se duas direções são opostas (impedindo reversão imediata de 180 graus).
 */
function isOppositeDirection(a: Direction, b: Direction): boolean {
  return (
    (a === 'UP' && b === 'DOWN') ||
    (a === 'DOWN' && b === 'UP') ||
    (a === 'LEFT' && b === 'RIGHT') ||
    (a === 'RIGHT' && b === 'LEFT')
  );
}

export default function App() {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>(() => loadLeaderboard());
  const [playerName, setPlayerName] = useState<string>(() => loadLastPlayerName());
  const [isMuted, setIsMuted] = useState<boolean>(() => loadSoundMuted());
  const [activeSideTab, setActiveSideTab] = useState<'ranking' | 'levels'>('ranking');

  const [status, setStatus] = useState<GameStatus>('TITLE_MENU');
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [snake, setSnake] = useState<Point[]>(() =>
    createInitialSnake(LEVELS[0].gridSize)
  );
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [food, setFood] = useState<FoodItem>(() =>
    spawnFood(LEVELS[0].gridSize, createInitialSnake(LEVELS[0].gridSize), [], false)
  );

  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [lastEntryId, setLastEntryId] = useState<string | null>(null);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Refs para manter leitura consistente dentro do loop e fila de direções rápidas
  const directionRef = useRef<Direction>('RIGHT');
  const directionQueueRef = useRef<Direction[]>([]);
  const levelTransitionTimerRef = useRef<number | null>(null);

  const currentLevel: LevelConfig = LEVELS[levelIndex] ?? LEVELS[0];
  const previousLevelTarget = levelIndex > 0 ? (LEVELS[levelIndex - 1].targetScore ?? 0) : 0;

  const bestScore = useMemo(
    () => (leaderboard.length > 0 ? leaderboard[0].score : 0),
    [leaderboard]
  );

  const currentRank = useMemo(() => {
    if (!lastEntryId) return null;
    const index = leaderboard.findIndex((item) => item.id === lastEntryId);
    return index === -1 ? null : index + 1;
  }, [leaderboard, lastEntryId]);

  // Limpa timer de transição de nível se desmontar ou reiniciar
  const clearTransitionTimer = useCallback(() => {
    if (levelTransitionTimerRef.current !== null) {
      window.clearTimeout(levelTransitionTimerRef.current);
      levelTransitionTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTransitionTimer();
  }, [clearTransitionTimer]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      saveSoundMuted(next);
      return next;
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    clearLeaderboard();
    setLeaderboard([]);
    setLastEntryId(null);
  }, []);

  const enqueueDirection = useCallback(
    (nextDir: Direction) => {
      if (status !== 'PLAYING') return;

      const queue = directionQueueRef.current;
      const lastPlanned = queue.length > 0 ? queue[queue.length - 1] : directionRef.current;

      if (nextDir === lastPlanned || isOppositeDirection(nextDir, lastPlanned)) {
        return;
      }

      if (queue.length < 2) {
        queue.push(nextDir);
      }
    },
    [status]
  );

  const handleStartGame = useCallback(
    (validatedName: string) => {
      clearTransitionTimer();
      saveLastPlayerName(validatedName);
      setPlayerName(validatedName);

      const firstLevel = LEVELS[0];
      const initialSnake = createInitialSnake(firstLevel.gridSize);

      directionRef.current = 'RIGHT';
      directionQueueRef.current = [];

      setLevelIndex(0);
      setScore(0);
      setSnake(initialSnake);
      setDirection('RIGHT');
      setFood(spawnFood(firstLevel.gridSize, initialSnake, firstLevel.obstacles, false));
      setGameOverReason('');
      setLastEntryId(null);
      setIsNewRecord(false);
      setStatus('PLAYING');
    },
    [clearTransitionTimer]
  );

  const handleTogglePause = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'PLAYING') return 'PAUSED';
      if (prev === 'PAUSED') return 'PLAYING';
      return prev;
    });
  }, []);

  const handleEndToMenu = useCallback(() => {
    clearTransitionTimer();
    const firstLevel = LEVELS[0];
    const initialSnake = createInitialSnake(firstLevel.gridSize);
    directionRef.current = 'RIGHT';
    directionQueueRef.current = [];
    setLevelIndex(0);
    setScore(0);
    setSnake(initialSnake);
    setDirection('RIGHT');
    setFood(spawnFood(firstLevel.gridSize, initialSnake, firstLevel.obstacles, false));
    setStatus('TITLE_MENU');
  }, [clearTransitionTimer]);

  const finishMatch = useCallback(
    (finalScore: number, reachedLevel: number, reason: string) => {
      playGameOverSound(isMuted);
      setGameOverReason(reason);
      setStatus('GAME_OVER');

      const entryId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const newEntry: ScoreEntry = {
        id: entryId,
        playerName: playerName || 'Jogador',
        score: finalScore,
        levelReached: reachedLevel,
        createdAt: new Date().toISOString(),
      };

      const previousTop = leaderboard.length > 0 ? leaderboard[0].score : 0;
      const updated = saveScoreEntry(newEntry);

      setLeaderboard(updated);
      setLastEntryId(entryId);
      setIsNewRecord(finalScore > previousTop && finalScore > 0);
    },
    [isMuted, leaderboard, playerName]
  );

  // Controles de teclado (Setas, WASD e Espaço/P para pausar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Nunca intercepta teclas enquanto o usuário digita no campo de nome
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'arrowup' || key === 'w') {
        if (status === 'PLAYING') e.preventDefault();
        enqueueDirection('UP');
      } else if (key === 'arrowdown' || key === 's') {
        if (status === 'PLAYING') e.preventDefault();
        enqueueDirection('DOWN');
      } else if (key === 'arrowleft' || key === 'a') {
        if (status === 'PLAYING') e.preventDefault();
        enqueueDirection('LEFT');
      } else if (key === 'arrowright' || key === 'd') {
        if (status === 'PLAYING') e.preventDefault();
        enqueueDirection('RIGHT');
      } else if (key === ' ' || key === 'p') {
        if (status === 'PLAYING' || status === 'PAUSED') {
          e.preventDefault();
          handleTogglePause();
        }
      } else if (key === 'enter' && status === 'GAME_OVER') {
        e.preventDefault();
        handleStartGame(playerName);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, enqueueDirection, handleTogglePause, handleStartGame, playerName]);

  // Loop principal de atualização da partida conforme a velocidade do nível atual
  useEffect(() => {
    if (status !== 'PLAYING') return;

    // No nível 6 (infinito), a velocidade acelera levemente a cada 100 pontos extras
    const effectiveSpeedMs =
      currentLevel.targetScore === null
        ? Math.max(52, currentLevel.speedMs - Math.floor(Math.max(0, score - 450) / 100) * 3)
        : currentLevel.speedMs;

    const timer = window.setTimeout(() => {
      const nextDir = directionQueueRef.current.shift() ?? directionRef.current;
      directionRef.current = nextDir;
      setDirection(nextDir);

      const head = snake[0];
      const nextHead: Point = {
        x:
          nextDir === 'LEFT'
            ? head.x - 1
            : nextDir === 'RIGHT'
              ? head.x + 1
              : head.x,
        y:
          nextDir === 'UP'
            ? head.y - 1
            : nextDir === 'DOWN'
              ? head.y + 1
              : head.y,
      };

      // 1. Verifica colisão com as bordas da arena
      if (
        nextHead.x < 0 ||
        nextHead.x >= currentLevel.gridSize ||
        nextHead.y < 0 ||
        nextHead.y >= currentLevel.gridSize
      ) {
        finishMatch(score, currentLevel.level, 'Colisão com a parede');
        return;
      }

      // 2. Verifica colisão com obstáculos do nível
      const hitObstacle = currentLevel.obstacles.some(
        (obs) => obs.x === nextHead.x && obs.y === nextHead.y
      );
      if (hitObstacle) {
        finishMatch(score, currentLevel.level, 'Colisão com obstáculo');
        return;
      }

      const ateFood =
        nextHead.x === food.position.x && nextHead.y === food.position.y;

      // 3. Verifica colisão com o próprio corpo (ignora a ponta da cauda se não cresceu)
      const bodyToCheck = ateFood ? snake : snake.slice(0, -1);
      const hitSelf = bodyToCheck.some(
        (seg) => seg.x === nextHead.x && seg.y === nextHead.y
      );
      if (hitSelf) {
        finishMatch(score, currentLevel.level, 'Colisão com o próprio corpo');
        return;
      }

      const updatedSnake = ateFood
        ? [nextHead, ...snake]
        : [nextHead, ...snake.slice(0, -1)];

      if (!ateFood) {
        setSnake(updatedSnake);
        return;
      }

      const nextScore = score + food.points;
      setScore(nextScore);

      // 4. Verifica se atingiu a meta de pontos para avançar automaticamente ao próximo nível
      if (
        currentLevel.targetScore !== null &&
        nextScore >= currentLevel.targetScore &&
        levelIndex < LEVELS.length - 1
      ) {
        const nextLevelIdx = levelIndex + 1;
        const nextLvl = LEVELS[nextLevelIdx];
        const safeSnake = createInitialSnake(nextLvl.gridSize);

        playLevelUpSound(isMuted);
        directionRef.current = 'RIGHT';
        directionQueueRef.current = [];

        setLevelIndex(nextLevelIdx);
        setSnake(safeSnake);
        setDirection('RIGHT');
        setFood(
          spawnFood(nextLvl.gridSize, safeSnake, nextLvl.obstacles, true)
        );
        setStatus('LEVEL_TRANSITION');

        clearTransitionTimer();
        levelTransitionTimerRef.current = window.setTimeout(() => {
          setStatus('PLAYING');
          levelTransitionTimerRef.current = null;
        }, 1500);
        return;
      }

      playEatSound(food.kind === 'BONUS', isMuted);
      setSnake(updatedSnake);
      setFood(
        spawnFood(
          currentLevel.gridSize,
          updatedSnake,
          currentLevel.obstacles,
          currentLevel.level >= 2
        )
      );
    }, effectiveSpeedMs);

    return () => window.clearTimeout(timer);
  }, [
    status,
    snake,
    food,
    score,
    currentLevel,
    levelIndex,
    isMuted,
    finishMatch,
    clearTransitionTimer,
  ]);

  // Cálculo da barra de progresso para o próximo nível
  const levelProgressPercent = useMemo(() => {
    if (currentLevel.targetScore === null) return 100;
    const span = currentLevel.targetScore - previousLevelTarget;
    if (span <= 0) return 0;
    const earnedInLevel = Math.max(0, score - previousLevelTarget);
    return Math.min(100, Math.round((earnedInLevel / span) * 100));
  }, [currentLevel.targetScore, previousLevelTarget, score]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-slate-100">
      <Header
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        activeSideTab={activeSideTab}
        onSelectSideTab={setActiveSideTab}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Coluna principal: HUD da partida, Arena Canvas e Controles Táteis */}
          <section id="arena" aria-label="Área do jogo" className="flex flex-col">
            {/* HUD compacto acima do tabuleiro */}
            <div className="mx-auto mb-4 w-full max-w-[540px] rounded-2xl border border-slate-800/90 bg-slate-900/75 p-3.5 sm:p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 items-center">
                <div>
                  <div className="text-[11px] font-medium text-slate-400">
                    Nível Atual
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="font-mono-tabular text-lg font-bold text-emerald-400">
                      {currentLevel.level}/{LEVELS.length}
                    </span>
                    <span className="text-xs text-slate-300 truncate">
                      {currentLevel.name}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400">
                    Pontuação
                  </div>
                  <div className="mt-0.5 font-mono-tabular text-lg font-bold text-slate-50">
                    {score}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400">
                    Meta do Nível
                  </div>
                  <div className="mt-0.5 font-mono-tabular text-lg font-bold text-slate-200">
                    {currentLevel.targetScore !== null
                      ? `${currentLevel.targetScore} pts`
                      : 'Livre'}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 sm:text-right">
                      Recorde
                    </div>
                    <div className="mt-0.5 font-mono-tabular text-lg font-bold text-amber-400 sm:text-right">
                      {Math.max(bestScore, score)}
                    </div>
                  </div>

                  {(status === 'PLAYING' || status === 'PAUSED') && (
                    <button
                      type="button"
                      onClick={handleTogglePause}
                      aria-label={status === 'PAUSED' ? 'Continuar jogo' : 'Pausar jogo'}
                      className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      {status === 'PAUSED' ? (
                        <Play className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Pause className="h-4 w-4 text-amber-400" aria-hidden="true" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Barra discreta de progresso rumo ao próximo nível */}
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800"
                  role="progressbar"
                  aria-label="Progresso no nível atual"
                  aria-valuenow={levelProgressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-transform duration-200 origin-left"
                    style={{
                      transform: `scaleX(${levelProgressPercent / 100})`,
                    }}
                  />
                </div>
                <span className="font-mono-tabular text-[11px] text-slate-400 shrink-0">
                  {playerName ? `Jogador: ${playerName}` : 'Aguardando jogador'}
                </span>
              </div>
            </div>

            <GameBoard
              status={status}
              snake={snake}
              food={food}
              direction={direction}
              levelConfig={currentLevel}
              score={score}
              bestScore={bestScore}
              playerName={playerName}
              gameOverReason={gameOverReason}
              currentRank={currentRank}
              isNewRecord={isNewRecord}
              onStartGame={handleStartGame}
              onResumeGame={handleTogglePause}
              onEndToMenu={handleEndToMenu}
              onSwipeDirection={enqueueDirection}
            />

            <TouchControls
              status={status}
              onDirection={enqueueDirection}
              onTogglePause={handleTogglePause}
            />
          </section>

          {/* Coluna lateral: Ranking persistente e Progressão de Níveis */}
          <aside
            id="painel-lateral"
            aria-label="Ranking e níveis"
            className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 sm:p-5"
          >
            {/* Seletor segmentado entre Ranking e Níveis */}
            <div
              role="tablist"
              aria-label="Visualização do painel lateral"
              className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-950/80 p-1 border border-slate-800/80"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeSideTab === 'ranking'}
                onClick={() => setActiveSideTab('ranking')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  activeSideTab === 'ranking'
                    ? 'bg-slate-800 text-slate-50 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ranking
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeSideTab === 'levels'}
                onClick={() => setActiveSideTab('levels')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  activeSideTab === 'levels'
                    ? 'bg-slate-800 text-slate-50 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Níveis ({LEVELS.length})
              </button>
            </div>

            {activeSideTab === 'ranking' ? (
              <Leaderboard
                entries={leaderboard}
                currentPlayerName={playerName}
                lastEntryId={lastEntryId}
                onClearHistory={handleClearHistory}
              />
            ) : (
              <LevelsOverview currentLevelNumber={currentLevel.level} />
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
