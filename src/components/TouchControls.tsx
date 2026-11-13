import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play } from 'lucide-react';
import { Direction, GameStatus } from '../types/game';

interface TouchControlsProps {
  status: GameStatus;
  onDirection: (dir: Direction) => void;
  onTogglePause: () => void;
}

/**
 * Controles direcionais táteis para dispositivos móveis e tablets (alvos >= 48px).
 */
export function TouchControls({
  status,
  onDirection,
  onTogglePause,
}: TouchControlsProps) {
  const isPlayable = status === 'PLAYING' || status === 'PAUSED';

  const buttonBase =
    'flex h-13 w-14 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/90 text-slate-100 active:scale-95 active:bg-emerald-600/30 active:border-emerald-500/60 transition-transform duration-100 select-none touch-manipulation cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div
      className="mt-4 flex flex-col items-center gap-3 sm:hidden"
      aria-label="Controles por toque"
    >
      <div className="flex w-full items-center justify-between gap-4 px-1">
        {/* Direcional em cruz */}
        <div className="grid grid-cols-3 gap-1.5">
          <div />
          <button
            type="button"
            disabled={!isPlayable}
            onPointerDown={(e) => {
              e.preventDefault();
              onDirection('UP');
            }}
            aria-label="Mover para cima"
            className={buttonBase}
          >
            <ArrowUp className="h-6 w-6" aria-hidden="true" />
          </button>
          <div />

          <button
            type="button"
            disabled={!isPlayable}
            onPointerDown={(e) => {
              e.preventDefault();
              onDirection('LEFT');
            }}
            aria-label="Mover para a esquerda"
            className={buttonBase}
          >
            <ArrowLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={!isPlayable}
            onPointerDown={(e) => {
              e.preventDefault();
              onDirection('DOWN');
            }}
            aria-label="Mover para baixo"
            className={buttonBase}
          >
            <ArrowDown className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={!isPlayable}
            onPointerDown={(e) => {
              e.preventDefault();
              onDirection('RIGHT');
            }}
            aria-label="Mover para a direita"
            className={buttonBase}
          >
            <ArrowRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Botão lateral de pausa e instrução de deslize */}
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            disabled={!isPlayable}
            onClick={onTogglePause}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/90 px-4 py-2.5 text-sm font-medium text-slate-100 active:scale-95 transition-transform duration-100 disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {status === 'PAUSED' ? (
              <>
                <Play className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                <span>Continuar</span>
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 text-amber-400" aria-hidden="true" />
                <span>Pausar</span>
              </>
            )}
          </button>
          <p className="text-right text-xs text-slate-400 max-w-[130px]">
            Ou deslize o dedo sobre a arena
          </p>
        </div>
      </div>
    </div>
  );
}
