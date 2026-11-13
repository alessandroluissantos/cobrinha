import { useState } from 'react';
import { Trash2, Trophy } from 'lucide-react';
import { ScoreEntry } from '../types/game';

interface LeaderboardProps {
  entries: ScoreEntry[];
  currentPlayerName: string;
  lastEntryId: string | null;
  onClearHistory: () => void;
}

/**
 * Tabela de melhores pontuações ordenada da maior para a menor,
 * destacando o jogador atual e sua melhor posição.
 */
export function Leaderboard({
  entries,
  currentPlayerName,
  lastEntryId,
  onClearHistory,
}: LeaderboardProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);

  const normalizedCurrent = currentPlayerName.trim().toLowerCase();

  // Encontra a posição da partida mais recente ou a melhor colocação do jogador atual
  const highlightedIndex = entries.findIndex((entry) => {
    if (lastEntryId && entry.id === lastEntryId) return true;
    return (
      normalizedCurrent.length > 0 &&
      entry.playerName.trim().toLowerCase() === normalizedCurrent
    );
  });

  const handleConfirmClear = () => {
    onClearHistory();
    setConfirmingClear(false);
  };

  return (
    <section aria-labelledby="ranking-titulo" className="flex flex-col">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2
            id="ranking-titulo"
            className="text-base font-semibold text-slate-50"
          >
            Melhores Pontuações
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {entries.length === 0
              ? 'Nenhuma partida registrada ainda'
              : `${entries.length} ${
                  entries.length === 1 ? 'registro salvo' : 'registros salvos'
                } no navegador`}
          </p>
        </div>

        {entries.length > 0 && !confirmingClear && (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            aria-label="Limpar ranking local"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-rose-300 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Limpar</span>
          </button>
        )}

        {confirmingClear && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleConfirmClear}
              className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-500 transition-colors cursor-pointer whitespace-nowrap"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Resumo da posição do jogador atual quando já possui registro */}
      {highlightedIndex !== -1 && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          <span>
            Posição de <strong>{entries[highlightedIndex].playerName}</strong>
          </span>
          <span className="font-mono-tabular font-bold text-emerald-300">
            #{highlightedIndex + 1} · {entries[highlightedIndex].score} pts
          </span>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40 px-4 py-10 text-center">
          <Trophy className="h-7 w-7 text-slate-600 mb-2" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-300">
            Ranking ainda vazio
          </p>
          <p className="mt-1 text-xs text-slate-400 max-w-[230px]">
            Digite seu nome e conclua uma partida para inaugurar a tabela de recordes.
          </p>
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-xs font-medium text-slate-400">
                <th className="py-2 pr-2 w-10">#</th>
                <th className="py-2 px-2">Jogador</th>
                <th className="py-2 px-2 text-center">Nível</th>
                <th className="py-2 pl-2 text-right">Pontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {entries.slice(0, 15).map((entry, idx) => {
                const isLastMatch = lastEntryId !== null && entry.id === lastEntryId;
                const isCurrentPlayer =
                  normalizedCurrent.length > 0 &&
                  entry.playerName.trim().toLowerCase() === normalizedCurrent;

                const isHighlighted = isLastMatch || isCurrentPlayer;

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isLastMatch
                        ? 'bg-emerald-500/15 text-slate-50'
                        : isCurrentPlayer
                          ? 'bg-slate-800/70 text-slate-100'
                          : 'text-slate-300 hover:bg-slate-800/35'
                    }`}
                  >
                    <td className="py-2.5 pr-2 font-mono-tabular text-xs font-semibold text-slate-400">
                      {idx + 1}º
                    </td>
                    <td className="py-2.5 px-2 max-w-[140px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`truncate ${
                            isHighlighted ? 'font-semibold text-slate-50' : ''
                          }`}
                          title={entry.playerName}
                        >
                          {entry.playerName}
                        </span>
                        {isLastMatch ? (
                          <span className="text-[11px] font-medium text-emerald-400 shrink-0">
                            (Última)
                          </span>
                        ) : isCurrentPlayer ? (
                          <span className="text-[11px] font-medium text-emerald-400 shrink-0">
                            (Você)
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono-tabular text-xs text-slate-400">
                      N{entry.levelReached}
                    </td>
                    <td
                      className={`py-2.5 pl-2 text-right font-mono-tabular font-semibold ${
                        idx === 0
                          ? 'text-amber-400'
                          : isHighlighted
                            ? 'text-emerald-400'
                            : 'text-slate-100'
                      }`}
                    >
                      {entry.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
