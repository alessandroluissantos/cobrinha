import { Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  activeSideTab: 'ranking' | 'levels';
  onSelectSideTab: (tab: 'ranking' | 'levels') => void;
}

/**
 * Barra superior com marca do jogo, navegação objetiva e controle de áudio.
 */
export function Header({
  isMuted,
  onToggleMute,
  activeSideTab,
  onSelectSideTab,
}: HeaderProps) {
  const scrollToSection = (id: string, sideTab?: 'ranking' | 'levels') => {
    if (sideTab) {
      onSelectSideTab(sideTab);
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#0B1120]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zona 1: Marca em linha única */}
        <a
          href="#arena"
          className="text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
        >
          Cobrinha
        </a>

        {/* Zona 2: Links de navegação concisos em linha única */}
        <nav
          aria-label="Navegação principal"
          className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-400"
        >
          <button
            type="button"
            onClick={() => scrollToSection('arena')}
            className="hover:text-slate-100 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md px-1 py-0.5"
          >
            Arena
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('painel-lateral', 'ranking')}
            className={`transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md px-1 py-0.5 ${
              activeSideTab === 'ranking'
                ? 'text-slate-100 underline decoration-emerald-500 decoration-2 underline-offset-4'
                : 'hover:text-slate-100'
            }`}
          >
            Ranking
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('painel-lateral', 'levels')}
            className={`transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md px-1 py-0.5 ${
              activeSideTab === 'levels'
                ? 'text-slate-100 underline decoration-emerald-500 decoration-2 underline-offset-4'
                : 'hover:text-slate-100'
            }`}
          >
            Níveis
          </button>
        </nav>

        {/* Zona 3: Ação única de controle sonoro */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Ativar efeitos sonoros' : 'Silenciar efeitos sonoros'}
            aria-pressed={!isMuted}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-800/70 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-slate-400" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            )}
            <span>{isMuted ? 'Som mudo' : 'Som ativo'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
