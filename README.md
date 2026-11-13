# Cobrinha — Desafio Progressivo

Jogo clássico da Cobrinha (Snake) construído com React, TypeScript, Vite e Tailwind CSS, com interface totalmente em português, design responsivo para computador e celular e persistência local sem necessidade de backend.

## Funcionalidades

- **6 níveis com dificuldade progressiva**:
  - **Nível 1 — Campo Aberto**: grade `20×20`, sem obstáculos, `145ms` por passo (meta: `50` pontos).
  - **Nível 2 — Cantos Guardados**: grade `20×20`, `8` obstáculos nos cantos, `122ms` por passo (meta: `120` pontos).
  - **Nível 3 — Pilares da Arena**: grade reduzida `18×18`, `12` pilares estratégicos, `104ms` por passo (meta: `210` pontos).
  - **Nível 4 — Corredores Estreitos**: grade `18×18`, `16` barreiras em L, `88ms` por passo (meta: `320` pontos).
  - **Nível 5 — Desafio Compacto**: grade `16×16`, `16` obstáculos em alta velocidade, `74ms` por passo (meta: `450` pontos).
  - **Nível 6 — Mestre Infinito**: grade `16×16`, velocidade máxima (`64ms`, acelerando gradualmente a cada 100 pontos extras) sem limite de pontuação.
- **Avanço automático de nível**: ao atingir a meta de pontos, o jogo transiciona automaticamente para o próximo nível com reposicionamento seguro da cobrinha.
- **Identificação do jogador**: validação de nome na tela inicial (entre 2 e 20 caracteres, não vazio).
- **Ranking persistente (`localStorage`)**: armazena pontuações ordenadas da maior para a menor, destaca a posição do jogador atual e persiste entre sessões do navegador.
- **Controles completos**:
  - **Computador**: teclas `Setas` ou `WASD` para mover, `Espaço` ou `P` para pausar/continuar.
  - **Celular / Tablet**: botões direcionais táteis abaixo da arena ou gestos de deslize (*swipe*) diretamente sobre o tabuleiro.
- **Efeitos sonoros sintetizados**: feedback sonoro via Web Audio API com botão para silenciar a qualquer momento.

---

## Antes de publicar: inserir seu nome nos créditos

O arquivo `src/config/gameConfig.ts` contém a constante `CREATOR_NAME` exibida na tela inicial e no rodapé:

```ts
export const CREATOR_NAME = '[Seu Nome Aqui]';
```

Substitua `[Seu Nome Aqui]` pelo seu nome completo antes de enviar para o GitHub ou publicar na Vercel.

---

## Estrutura do projeto

```text
├── index.html                   # Documento HTML principal (pt-BR) e fontes
├── package.json                 # Scripts e dependências do projeto
├── vite.config.ts               # Configuração do Vite + Tailwind CSS
├── .gitignore                   # Arquivos ignorados pelo Git
├── README.md                    # Documentação em português
└── src/
    ├── main.tsx                 # Ponto de entrada React
    ├── index.css                # Estilos globais e tipografia tabular
    ├── App.tsx                  # Máquina de estados, loop do jogo e HUD
    ├── config/
    │   └── gameConfig.ts        # Níveis, metas, obstáculos e créditos
    ├── types/
    │   └── game.ts              # Tipos TypeScript do jogo e ranking
    ├── utils/
    │   ├── sound.ts             # Efeitos sonoros via Web Audio API
    │   └── storage.ts           # Persistência do ranking no localStorage
    └── components/
        ├── Header.tsx           # Barra superior e controle de áudio
        ├── GameBoard.tsx        # Tabuleiro Canvas e telas de menu/fim
        ├── TouchControls.tsx    # Controles táteis para dispositivos móveis
        ├── Leaderboard.tsx      # Tabela de ranking ordenada
        ├── LevelsOverview.tsx   # Lista e status dos 6 níveis
        └── Footer.tsx           # Rodapé com créditos e atalhos
```

---

## Como executar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- `npm` (instalado junto com o Node.js)

### Passo a passo

1. Instale as dependências do projeto:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Abra o endereço exibido no terminal (por padrão `http://localhost:3000`) no navegador.
4. Para testar a versão final de produção localmente:
   ```bash
   npm run build
   npm run preview
   ```

---

## Como publicar no GitHub

1. Crie um novo repositório vazio no [GitHub](https://github.com/new) (sem marcar README ou `.gitignore`, pois o projeto já inclui ambos).
2. No terminal, na pasta raiz do projeto, execute:
   ```bash
   git init
   git add .
   git commit -m "Versão inicial do jogo Cobrinha"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```
   *(Substitua `SEU-USUARIO` e `SEU-REPOSITORIO` pelos dados do seu repositório.)*

---

## Como conectar o repositório à Vercel e fazer o deploy

A Vercel detecta automaticamente projetos Vite sem necessidade de configuração manual adicional.

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
2. Clique em **Add New...** → **Project**.
3. Localize o repositório que você acabou de publicar no GitHub e clique em **Import**.
4. Confira as configurações detectadas automaticamente:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Clique em **Deploy**.
6. Em menos de um minuto, a Vercel finalizará a publicação e fornecerá a URL pública do seu jogo (por exemplo, `https://seu-projeto.vercel.app`).

A cada novo `git push` na branch `main`, a Vercel atualizará o site automaticamente.
