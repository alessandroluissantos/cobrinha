import { CREATOR_NAME } from '../config/gameConfig';

/**
 * Rodapé limpo exibindo os créditos obrigatórios do criador e resumo de controles.
 */
export function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-800/80 bg-[#0B1120]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:px-6">
        <p className="font-medium text-slate-300">
          Criado por {CREATOR_NAME}
        </p>
        <p className="text-slate-400">
          Setas ou WASD para mover · Espaço para pausar · Toque ou deslize no celular
        </p>
      </div>
    </footer>
  );
}
