# ADR-001 — Escala do canvas travada em PIXELS REAIS inteiros

- **Status:** aceito (2026-07-04) — **CORRIGE** a versão anterior deste ADR (que estava errada; ver "Histórico").
- **Contexto:** regressão reportada pelo José em várias rodadas — "o canvas estica em números reais / as scanlines ficam com espaçamento irregular". Diagnóstico final confirmado com ele: o que importa é o inteiro em **pixels reais da tela**, não em pixels CSS.

## Decisão

O canvas é **pixel art 320×180 lógico por tela**. A escala é travada em **múltiplos INTEIROS de pixels REAIS (físicos) da tela**, não em pixels CSS:

- `kDev` = fator em **pixels físicos**, INTEIRO. `kDev = max(round(2·dpr), floor(min(availW·dpr/(baseW−10), availH·dpr/(baseH−10))))`.
- Tamanho do canvas em CSS = `baseW·kDev/dpr` × `baseH·kDev/dpr`. **Em pixels REAIS = `baseW·kDev` × `baseH·kDev`** → múltiplo inteiro exato de 320×180.
- `k = kDev/dpr` é o fator lógico/CSS (pode ser fracionário quando dpr≠1 — **isso é irrelevante**, é abstração do navegador).
- O `−10` mantém a tolerância de ≤5px lógicos de corte por lado (pedido do José).

**Por quê:** só quando cada pixel de arte ocupa um número **inteiro** de pixels reais é que (a) a arte fica com pixels uniformes e (b) as **scanlines ficam com espaçamento regular**. Travar em inteiro-CSS NÃO garante isso: numa tela a 125% (dpr 1,25), um canvas 3× em CSS = 3,75 px reais por pixel de arte → pixels/scanlines irregulares.

## A UI DOM escala junto (não é fixa)

HUD, menus, ícones, texto e SVGs vivem no DOM sobreposto (vetorial, alta definição). MAS o **tamanho** deles escala pelo mesmo fator: `--ui-fs = 8·k`, `--tap = 22·k` (setados no `layout()`), e `#title-overlay{font-size:var(--ui-fs)}`. Assim a proporção UI↔canvas é constante em qualquer escala. (Fonte vetorial em px fracionário é nítida — o "borrado" que eu temia não existe.)

## Scanlines

`crtScanVars()`: período = `kDev` px reais (1 linha por pixel de arte), linha = 1 px real. Ancoradas em pixels físicos → espaçamento **regular** em qualquer dpr. NÃO usar período em px CSS inteiro (desalinha quando dpr≠1).

## Histórico (o erro a não repetir)

A **1ª versão deste ADR (v4.147.2)** dizia "NUNCA pôr dpr na fórmula; travar em inteiro-CSS". **Isso estava errado.** Veio de eu interpretar mal a reação do José ao rótulo "4,8×" (o número CSS) — quando na verdade os pixels reais desenhados por aquele cálculo `kDev` eram o múltiplo inteiro que ele queria. Removi a solução certa e passei rodadas "consertando" o problema errado (borrado) enquanto o real (espaçamento irregular por escala não-inteira em pixels reais) seguia. Lição: **o alvo é o pixel REAL da tela; o número CSS é ruído.**

## Consequências

- Scanlines regulares e arte uniforme em qualquer dpr.
- Em telas onde base·kDev não cabe exato, corte ≤5px lógicos/lado por design (tolerância). Para nunca cortar, remover o `−10`.
- Código: `layout()` e `crtScanVars()` em `v4.0.0/game.js`.
