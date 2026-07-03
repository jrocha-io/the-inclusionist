# ADR-001 — Escala do canvas em múltiplos INTEIROS de 320×180 (sem `dpr`)

- **Status:** aceito (2026-07-04)
- **Contexto de origem:** regressão reportada pelo José — "por que a tela voltou a escalar do jeito errado, prejudicando o trabalho todo? E por que corta em cima/embaixo quando há espaço?". Já é a **segunda vez** que esse erro aparece; por isso vira ADR.

## Decisão

O canvas do jogo é **pixel art de resolução base 320×180** e só pode ser exibido em **múltiplos inteiros** dessa base:

- Fator de escala `k ∈ {2, 3, 4, 5, …}` — **mínimo `k=2`** (640×360).
- `k = max(2, floor( min( availW/(baseW−10), availH/(baseH−10) ) ))`, onde `baseW=320·colunas`, `baseH=180·linhas` da grade de telas.
- O `−10` implementa a **tolerância pedida pelo José**: aceita-se perder **até 5px lógicos por lado** (`5·k` físicos) se isso permitir subir um degrau inteiro de escala. É intencional e desejado — sem ela, o canvas cairia para um `k` menor e sobraria muito espaço vazio.

### O que NÃO fazer (a armadilha)

**`window.devicePixelRatio` (dpr) NÃO entra na fórmula da escala do canvas.** A tentativa de usar dpr para obter "pixel físico perfeito" (`kDev = floor(avail·dpr/(base−10))`, `k = kDev/dpr`) produz um `k` **fracionário** em CSS (ex.: `4,8×` sob dpr 1,25) — ou seja, arte **fora da escala inteira**, exatamente o defeito reclamado. Isso foi introduzido em ~2026-07-03 e revertido aqui.

## Por que dpr é irrelevante para o canvas

Porque a **UI de alta definição vive no DOM sobreposto**, não no canvas:

- **HUD, texto, SVGs de fração, menus** → DOM (nítidos em qualquer dpr, e mais acessíveis — leitor de tela, zoom do SO, etc.).
- **Canvas** → só o mundo em pixel art, que *quer* ser um upscale inteiro e nearest-neighbor (`image-rendering: pixelated`). Um `k` inteiro garante blocos de pixel uniformes; o compositor do navegador cuida do passo final de dpr sem borrar (pixelated).

Logo, separar responsabilidades (pixel art no canvas ×  alta definição no DOM) elimina a necessidade de dpr na escala — e evita o `k` fracionário.

## Consequências

- `--ui-fs = 8·k` é sempre inteiro (k inteiro) → sem fonte de menu borrada.
- Em telas onde a base × k não cabe exato, ocorre corte ≤5px lógicos/lado **por design** (tolerância). Para **nunca** cortar (canvas um degrau menor quando não couber justo), basta remover o `−10` da fórmula — decisão do José, 1 linha.
- Código: `layout()` em `v4.0.0/game.js`. Comentário no ponto do código referencia este ADR e proíbe reintroduzir dpr.
