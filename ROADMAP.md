---
title: Roadmap v4 — port PixiJS + features + vertical slice
type: plan
status: active
created: 2026-06-01
---

# Roadmap v4 (port PixiJS + novas features + vertical slice)

Plano em etapas para **(a)** terminar de portar o jogo para a v4 (PixiJS/PWA),
**(b)** implementar a lista de novas features e **(c)** fechar o vertical slice.
Regra de trabalho: **conventional commits a cada alteração significativa**
(`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`), mantendo o build sempre jogável.

Ordem otimizada: vitórias visuais/UX primeiro → núcleo pedagógico (modos) → sistemas de
a11y → arquitetura pesada (multiplayer) → avançado → polimento/auditoria. Multiplayer e
power-ups ficam mais tarde (mais risco, menor prioridade de sala — conforme o red-team).

| # | Etapa | Tipo | Depende |
|---|-------|------|---------|
| **E1** | **Iluminação de área secreta** (acende tile `0` ao entrar; não escurece o resto) | feat | — |
| **E2** | **Prompts de início** ("Aperte L para pular", "Segure P para correr e pular mais alto") | feat | — |
| **E3** | **Perigos + susto + respawn** (lava `9`, HURT, invuln) | feat | — |
| **E4** | **Decoração de fundo** (árvores/arbustos) — **atrás do jogador, sempre visível** (corrigido: NÃO some ao pular) | feat | — |
| **E5** | **Minimapa estilo Metroid** (canto inferior esquerdo; tiles explorados) | feat | — |
| **E6** | **Modo Soma-Sub** (moedas = figuras geométricas; quiz) | feat | — |
| **E7** | **Modo Sílabas** + **maiúsc/minúsc** + **letra = inicial da palavra a escrever** | feat | — |
| **E8** | **Modo cego: ditado de Braille** (dita pontos da cela por letra da sílaba) | feat·a11y | E7 |
| **E9** | **Áudio + legendas (C1)** e **modo assistência (C2)** | feat·a11y | — |
| **E10** | **Controles remapeáveis + persistência (B2)** + painel de opções | feat·a11y | — |
| **E11** | **Multiplayer 2–4 telas 320×180 lado a lado** (viewports independentes; entrada por jogador) | feat | single-player estável |
| **E12** | **Power-ups + chaves/portões** (restante do port) | feat | — |
| **E13** | **Botões de toque (mobile)** + auditoria (axe/Lighthouse) + 5 gates do ADR-001 | feat·a11y·test | tudo |

## Notas de design
- **E1 (iluminação):** regiões de tiles `0` viram componentes conexos; camada escura por
  região com `alpha=1`; ao o jogador entrar, `alpha→0` (permanece aceso). Player desenhado
  ACIMA da camada (sempre visível). Coins/tiles do segredo ficam escondidos até acender.
- **E5 (minimapa):** grade reduzida do mundo no canto inf. esquerdo; marca tiles já vistos
  pela câmera (fog-of-war) + posição do jogador. DOM ou canvas Pixi separado.
- **E7/E8:** a moeda-letra é a **inicial da palavra-alvo**; ao montar a palavra, o modo
  cego **dita os pontos Braille** de cada letra (ex.: "lua" → "dois quatro" (L), depois
  "um três seis"? na verdade por letra: L=1·2·3, U=1·3·6, A=1). Confirmar tabela Braille PT.
- **E11:** N apps/câmeras PixiJS lado a lado, **uma simulação compartilhada**; entrada por
  jogador (teclado 2P; controles 3–4P). Sem netcode (local, mesma página) — conforme P7.

## Vertical slice (fecha junto com E1–E3, E9, E13)
O slice "Lúdico ponta-a-ponta validado" se completa quando: E1–E3 (mundo vivo) + E9 (áudio/
legendas/assistência) + E13 (auditoria + 5 gates no hardware real) estiverem feitos.
