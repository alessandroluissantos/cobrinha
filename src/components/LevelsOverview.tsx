import { LEVELS } from '../config/gameConfig';

interface LevelsOverviewProps {
  currentLevelNumber: number;
}

/**
 * Visão geral dos 6 níveis progressivos do jogo, destacando o nível ativo.
 */
export function LevelsOverview({ currentLevelNumber }: LevelsOverviewProps) {
  return (
    <section aria-labelledby="niveis-titulo" className="flex flex-col">
      <div className="pb-3 border-b border-slate-800">
        <h2
          id="niveis-titulo"
          className="text-base font-semibold text-slate-50"
        >
          Progressão de Níveis
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Avanço automático ao atingir a meta de pontos de cada fase
        </p>
      </div>

      <ol className="mt-3 space-y-2.5">
        {LEVELS.map((lvl) => {
          const isCurrent = lvl.level === currentLevelNumber;
          const isPassed = lvl.level < currentLevelNumber;

          return (
            <li
              key={lvl.level}
              className={`rounded-xl border p-3 transition-colors ${
                isCurrent
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-slate-800/90 bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-sm font-semibold ${
                    isCurrent ? 'text-emerald-300' : 'text-slate-100'
                  }`}
                >
                  Nível {lvl.level} — {lvl.name}
                </span>
                <span className="font-mono-tabular text-xs text-slate-400 shrink-0">
                  {lvl.targetScore !== null
                    ? `Meta: ${lvl.targetScore} pts`
                    : 'Sem limite'}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {lvl.description}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono-tabular">
                <span>
                  Arena {lvl.gridSize}×{lvl.gridSize}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {lvl.obstacles.length === 0
                    ? 'Sem obstáculos'
                    : `${lvl.obstacles.length} obstáculos`}
                </span>
                <span aria-hidden="true">·</span>
                <span>{lvl.speedMs}ms/passo</span>
                {isCurrent && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-sans font-semibold text-emerald-400">
                      Atual
                    </span>
                  </>
                )}
                {isPassed && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-sans font-medium text-slate-300">
                      Concluído
                    </span>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
