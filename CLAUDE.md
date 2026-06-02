# CLAUDE.md — "The Inclusionist" · guia de continuação para o Claude Code CLI

Este arquivo é carregado automaticamente pelo Claude Code como contexto do projeto. Leia-o inteiro antes de agir. Todo o trabalho é em pt-BR. Honre as preferências do José (§2): sinalize incoerências antes de executar, anuncie decisões não triviais, valide antes de entregar e incremente a versão a cada export (nunca sobrescreva um entregável).

## 1. O projeto

* **O que é:** jogo de plataforma 2D em pixel-art **320×180 (16:9)** em HTML/Canvas. **1º MVP** de um projeto de **35+ jogos educativos** (EdSP). Reimplementação clean-room do engine Clarity (Adam Brooks / dissimulate).
* **🔴 PILARES INEGOCIÁVEIS:** os critérios não-negociáveis do projeto agora vivem em **`docs/PILARES-INEGOCIAVEIS.md`** (constituição) — leia-o ANTES de agir. São 10: hardware de escola pública BR (Positivo/Chromebook), a11y (WCAG 2.2 AAA + GAG; Libras em motor zdog à parte), i18n (portfólio nórdico), conformidade China+Nórdicos+LGPD/COPPA (regra mais rígida vence), pixel 320×180 / Libras 420×180 21:9, telemetria 1EdTech+xAPI com privacidade infantil rígida, multiplayer em telas separadas (sem split-screen), offline (PWA+Electron+Capacitor), LAN + telemetria store-and-forward, código aberto **GPL-3.0** (código) + **arte não-FOSS** + gratuito + fomento.
* **Arte = dados/código (rodada 2, 2026-06-01):** a reversão para PNG foi **re-revertida**. A arte volta a ser **dados** (arrays + paleta hex), **gerada por algoritmo** (1 algoritmo por tipo de cabelo/corpo/roupa), tendo **spritesheets EM CAMADAS do PixelLab apenas como referência de design**. **Nenhum PNG embutido** no jogo (GPL-clean). Forma = camada; cor = palette-swap por chave. **⚠️ IP sob pesquisa:** ver `docs/LICENCAS-GERACAO-IMAGEM.md`.
* **Stack (rodada 2):** renderer **PixiJS** (WebGL/Canvas) + **DOM-first** p/ texto/UI (a11y AAA); empacotamento **PWA** (Tauri/Tauri Mobile = pós-MVP); multiplayer em viewports separados = pós-MVP. **Licença: GPL-3.0 desde já** (código); **arte não-FOSS**. Detalhes e os 10 pilares: `docs/PILARES-INEGOCIAVEIS.md`.
* **Acessibilidade primeiro:** WCAG 2.2 + Game Accessibility Guidelines em tudo. Quando estética brigar com a11y, a11y vence.
* **Domínio:** educacional → o critério de prioridade é eficácia pedagógica.
* **Usuário:** Prof. José Rocha (`jrocha.developer@gmail.com`), professor de informática educacional.
* **Arquivo atual mais recente:** `legacy/v3.1.100.html`. Sempre trabalhe sobre a versão de maior número encontrada no diretório.

## 2. Preferências do José (obrigatórias)

1. **Saídas densas e auditáveis.** Justifique escolhas não óbvias em ≤1 frase, com fonte primária quando couber.
2. **Versão por export.** Convenção SemVer-like `vMAJOR.MINOR.PATCH` (hoje `v3.1.100`). Nunca `cp` por cima de um arquivo já entregue — crie a próxima versão.
3. **Sinalize antes de executar.** Se o pedido contradiz uma decisão registrada, tem erro ou é incoerente, avise primeiro — não execute em silêncio.
4. **Anuncie decisões não triviais** assim: `Decisão: X porque Y. Para sobrepor, diga Z.` Honre reversões explícitas do José (com a razão dele).
5. **Projeto grande → primeiro plano + escopo, depois execução em etapas.**
6. **Valide antes de entregar** (tsc + simulação Node + render node-canvas/jsdom — ver §5).
7. **a11y:** alvo WCAG 2.2; AAA é aspiracional — marque honestamente onde só dá AA (ex.: 1.4.6 contraste 7:1 briga com cores vivas; 2.4.9; 3.1.5). Não venda "AAA em bloco".
8. **Diagramas:** nunca Mermaid (estética inferior); use SVG inline original. Não insira diagramas no portfólio/site sem pedido explícito. Em diagramas com elementos paralelos, ordene para minimizar cruzamento de conexões (sem perguntar a ordem).
9. **CSS com seletor descendente** (espaço entre classes): antes de adicionar a regra, faça `grep` de TODOS os elementos com a classe-alvo no escopo — classes como `.tooltip-host` aparecem em vários contextos; efeitos colaterais são comuns.
10. **Patches que mexem em HTML/CSS e JSON embutido ao mesmo tempo:** faça todas as alterações que tocam literais JSON antes de extrair o `m_json`, ou as do JSON antes das do HTML — nunca intercale. Sanity check pós-patch sempre reparseia o JSON (`json.loads`) com asserts.
11. **Arte:** crie arte 16-bit original, nunca copie IP de Nintendo/Disney/etc. Exceção atual: o elenco de personagens (§6) vem de imagens que o próprio José gerou (via Nanobanana) e autorizou copiar — são assets dele, não há questão de IP de terceiros.
12. **Física:** as velocidades são independentes entre si (sem equações derivando uma da outra).

## 3. Fluxo por versão (receita)

1. `cp pixel-art-sem-imagens-vX.html pixel-art-sem-imagens-vY.html` (Y = próxima versão).
2. Edite com str-replace asseverado (Python). Use sempre um helper que garante 1 ocorrência:

```python
def rep(old, new, desc):
    global s
    assert s.count(old) == 1, f'[{desc}] ocorrencias={s.count(old)}'
    s = s.replace(old, new, 1)
```

(Passar `desc` é obrigatório; sem ele o helper quebra antes de salvar — proposital.)

3. Bumpe 3 lugares: `<title>The Inclusionist · vY</title>`, o `<h1>...· vY</h1>` e `class="game-version">vY<` (o separador é `·` U+00B7, literal).
4. Valide (§5): `tsc` = 0 erros + simulação Node (física) + render node-canvas/jsdom (visual/DOM).
5. Entregue (apresente o arquivo) com um resumo conciso em pt-BR.
6. Uma mudança coesa por versão. Investigue a causa-raiz antes de corrigir.

## 4. Fatos do motor (estado em v3.1.100)

Números de linha são aproximados (usam `grep`). Constantes em maiúsculas no topo do `<script>`.

### Dimensões / mundo

* `LOGICAL_W=320`, `LOGICAL_H=180`, `TILE=16`, player 16×32 (`PLAYER_W`/`PLAYER_H`).
* Mundo estático (`buildWorld()` chamado uma vez), `WORLD_W=56`, `WORLD_H=58` tiles, `WORLD_PX_H=928`. Câmera percorre a vertical (clamp `[0, WORLD_PX_H−vh]`).
* Loop por `requestAnimationFrame` (física acoplada a ~60fps; YAGNI assumido).
* Players num array; funções de física recebem `pl` explícito; `refPlayer = players[0]`.

### Tiles (`TILE_TYPES`)

`0`=fundo escuro (escuridão, não-sólido) · `1`=fundo claro (visível, não-sólido) · `2`=pedra (sólido, bounce 0.28) · `3`=água (frente, gravidade 0.1, pulo) · `4`=escada · `5`=trampolim (sólido, bounce 1.1) · `6`=parede dura · `7`=pulo-turbo · `8`=voo · `9`=lava · `10`=portão · `11`=chave · `12`=super-corrida · `13`=ultra-pulo · `14`=wallcling.

### TUNE (física; já são os valores afinados pelo José)

```
jumpVel 3.5 · ultraJumpVel 10 · waterJump 3.5 · waterJumpRun 4 · waterStrokeFrames 30
trampBase 5 · trampMax 8 · gravity 0.15 · hWalk 2 · hRun 3 · hTurbo 4.5 · darkOpacity 0.9
```

* Cruzeiro horizontal = `pl.vx = dx` setado direto ao `hSpeed` (instantâneo, sem rampa; o cap `vmaxX` raramente morde). `hSpeed = powerSuperRun&&run ? hTurbo : run ? hRun : hWalk`.
* Pulo do chão: `powerUltraJump ? vy=-ultraJumpVel : vy=-jumpVel*Math.sqrt(tiles/5)` (cadeia bunny-hop `[0,5,8,9][jumpChain]`, ou 9 se `powerJump15`).
* Trampolim (cadeia): segurando pular sobe `trampLevel` até `trampMax`; solto cai a `trampBase`; `vy=-trampLevel`. Reset a `trampBase` ao tocar sólido não-trampolim.
* Água (braçada repetida): segurando pular, a cada `waterStrokeFrames` aplica `vy -= run ? waterJumpRun : waterJump`.
* Painel `?debug=true` (`buildDebugPanel()` no fim do script): um campo numérico por knob do TUNE; edita ao vivo. Guardado por `typeof location!=='undefined'`. Pendência: cravar os valores finais do José como padrão (já estão acima).

### Temas (`THEMES`, ~linha 1026)

`campo`(Dia no Campo) · `cemiterio`(Amanhecer no Campo) · `espaco`(Noite no Campo) · `floresta`(Floresta — renomear p/ "Floresta Brasileira" quando as árvores entrarem) · `classico`(Tema de Teste, sem inversão). `SCENE_THEMES = ['campo','cemiterio','espaco','floresta']`. `THEME_FLORA` por tema. Rádios de seleção ~linhas 462-466.

### Inversão da escuridão (mecânica)

`updateDarkInversion()`: por player, `viewInvLerp` 0→1 (lerp 0.18, histerese a 2 tiles). `classico` não inverte.

* Tile 0: escuridão (overlay `rgba(8,8,16, darkOpacity*(1-invLerp))`) ↔ caverna revelada quando `invLerp>0` → `drawCaveRock(x,y,inv)` (rocha de mina determinística por tile: base+fendas+realces+veio de minério, opacidade=inv). Paleta por tema em `CAVE_PAL` (campo dourado, cemiterio ametista, espaco cristal ciano, floresta âmbar).
* Tile 1: claro/visível ↔ overlay escuro quando invertido.

### Sistema de sprite do personagem (ALVO de mudança — ver §6)

* 4 frames ASCII 16×32: `PLAYER_IDLE`, `PLAYER_WALK`, `PLAYER_CLIMB` (costas), `PLAYER_HURT`. Não existe PLAYER_JUMP.
* Chars: `H`=cabelo `S`=pele `K`=preto(olhos) `W`=branco(boca) `R`=camisa `B`=calça `.`=transparente.
* `drawSprite(art,x,y,flip,tint,override)`: pinta 1 char = 1 px; `override` remapeia H/S/R/B.
* `randomAppearance()`: `SKIN_TONES`(5 Fitzpatrick), `HAIR_COLORS`(4), `SHIRT_COLORS`(7), `PANTS_COLORS`(6), `hairStyle`(0/1), `gender`(0/1).
* `drawHairOverlay` (hairStyle 1 = cabelo lateral cheio) · `drawGenderOverlay` (gender 1 = cabelo longo até ombros + saia trapezoidal cor-da-camisa) · `drawPlayerSwimming` (sprite girado) · `buildAppearanceOverride` · `pickPlayerArt`.
* Alto-contraste (`viewHC`) curto-circuita overlays e usa silhueta chapada — preservar em qualquer redesenho.

### Ordem de desenho (`drawViewport`, ~linha 3033)

`drawBackdrop → drawThemeStars → drawHills → drawThemeDecorBack(nuvens,pássaros) → drawMap(0) → drawFloraBack(arbustos/árvores, atrás do player) → drawCoinsFor → drawPlayer(todos) → drawThemeDecorFront(minhocas,vagalumes,borboletas,névoa) → drawMap(1)(frente: água)`. Lição de camada: tiles 0/1 (fundo de ar) são pintados em `drawMap(0)`; o que precisa aparecer sobre o ar desenha depois (camada `drawFloraBack`), não em `drawThemeDecorBack` (que fica atrás do mapa e é coberto). Decoração fixa no mundo usa `worldPos − viewCam`, não coordenada de tela.

## 5. Validação (rode SEMPRE antes de entregar)

### tsc (TypeScript check em JS)

Extraia o 1º `<script>` para `incl.js` e cheque:

```bash
node -e "const fs=require('fs');const js=fs.readFileSync('ARQUIVO.html','utf8').match(/<script>([\s\S]*)<\/script>/)[1];fs.writeFileSync('incl.js',js)"
tsc --allowJs --checkJs --noEmit --target es2020 --lib dom,es2020 --strict false incl.js   # DEVE dar 0 erros
```

Armadilhas: `textContent` precisa de `String(x)` quando `x` pode ser número; todo campo novo no objeto player precisa entrar também no `@typedef Player` (`@property`) ou o tsc acusa "Property X does not exist on type 'Player'".

### Simulação Node (física)

Base `sim_v3136.js`. Exponha internos com str-replace (ex.: trocar `, gamePhase:(` por `, TUNE:TUNE, PLAYER_H:PLAYER_H, gamePhase:(`). Armadilhas:

* Prefixe todas as vars de teste (a sim já declara `TILE`, `PLAYER_H` etc. — redeclarar quebra).
* Guarde código de browser com `typeof location !== 'undefined'`.
* O harness deixa estado sujo: nos testes anexados, faça `api.setNumPlayers(1); api.resetState(true);` primeiro e re-pegue `api.players[0]`/`api.state` a cada vez (cachear `var pl=...` fica obsoleto após `resetState` — causou medições zeradas).
* `api`: `players, state, setNumPlayers, resetState, update, frame(), heldKeys, CONTROLS_P1/P2` (P1 jump=`'KeyL'`, run=`'KeyP'`, right=`'KeyD'`), `TILE, isSolid, tileAt, gamePhase`, etc.

### node-canvas (visual) — `npm install canvas`

Replique as funções de desenho + paleta, renderize PNG e inspecione. Para arte, renderize a proposta e mostre ao José ANTES de embutir.

### jsdom (DOM/handlers) — `npm install jsdom`

Para testar painéis/handlers (ex.: `?debug=true`): JSDOM com `url:'https://x.test/?debug=true'`, `global.document=...`, extraia a função via regex e avalie.

## 6. TAREFA IMEDIATA — Arte do personagem (R3)

**Objetivo:** substituir as silhuetas atuais por um elenco fofo e fiel ao desenho do José. As imagens-fonte são do próprio José (Nanobanana) e ele autorizou copiar — trate como assets dele.

**Estado:** a extração fiel já está boa a partir do SVG (`file.svg` → rasterizar → moda por célula → remover fundo pela borda → maior componente conectado → preencher buracos). Melhor resultado: `elenco-extraido-v3-svg.png` (16 crianças, 32×64, cores chapadas, fundo limpo).

**Decisões do José (2026-05-23):**

1. **Tamanho de exibição em jogo:** ✅ **`16×32` ("tamanho do Mario")** — visual cabe exatamente na caixa de colisão, sem extrapolar. Re-extrair limpo direto nessa resolução. Esta decisão divergiu das 3 opções originais (32×64, 24×48, 20×40) — José introduziu a 4ª.
2. **Caminho:** ✅ **(B) ASCII paramétrico evoluído** — preserva sistema atual (4 frames `PLAYER_IDLE`/`WALK`/`CLIMB`/`HURT`) e expande:
   - Estilo dos frames evolui para mais detalhe/sombreamento (mantendo ASCII map + paleta);
   - Biblioteca de penteados, acessórios, roupas, expressões expansível;
   - Cada personagem gerado combinatorialmente (pele × cabelo × roupa × acessórios = milhões de combinações);
   - **Arte do José (Nanobanana, `file.svg`/`elenco-extraido-v3-svg.png`) fica preservada** para uso em outros contextos (intro, loading screen, marketing) — NÃO integrada no jogo como sprite-data.
   - Aluno cria seu próprio personagem (Mii-like), não escolhe entre 16 fixos.

**Implicação técnica:** R3 vira evolução incremental de `drawSprite`/`drawHairOverlay`/`drawGenderOverlay`/`randomAppearance` em vez de novo pipeline de extração. Lower risk, mais fácil de validar por versão.

**Pipeline de extração que funcionou (Python; requer `pip install pillow scipy cairosvg --break-system-packages`):**

```python
import cairosvg, numpy as np
from PIL import Image; from collections import Counter; from scipy import ndimage
cairosvg.svg2png(url='file.svg', write_to='svg_raster.png', output_width=1774, output_height=3548)
src=Image.open('svg_raster.png').convert('RGB'); W,H=src.size; cw,ch=W//4,H//4   # grade 4x4
q=src.quantize(colors=48, method=Image.MEDIANCUT); pal=np.array(q.getpalette()[:48*3]).reshape(-1,3); idx=np.asarray(q)
border=np.concatenate([idx[:6,:].ravel(),idx[-6:,:].ravel(),idx[:,:6].ravel(),idx[:,-6:].ravel()])
bg_set={c for c,n in Counter(border.tolist()).most_common(5) if n>border.size*0.02}
arr=np.asarray(src).astype(int)
# por célula (cx,cy): bbox justo pela cor != fundo; depois MODA por célula de saída;
# alpha = (índice not in bg_set); ndimage.label -> manter maior componente; binary_fill_holes.
```

(Ver `elenco-extraido-v3-svg.png` para o alvo. Há leve franja clara em alguns — limpar por personagem no embed final, ex.: erodir 1px de borda de baixa saturação.)

**Próximos passos (após as 2 decisões):**

1. Re-extrair limpo na resolução final → encodar cada sprite como `{pal:[...], px:[índices]}` (considere RLE; ~poucos KB).
2. Adaptar `drawSprite`/`drawPlayer` para os sprites-dados, centralizados na caixa 16×32 (pés alinhados, cabeça/ombros sobressaem).
3. Animação procedural + tint de susto + rotação no nado + escada simplificada.
4. Fallback de silhueta chapada no `viewHC`.
5. Trocar `randomAppearance` por sorteio de índice do elenco (2P distintos).
6. Render em escala real do jogo para o José aprovar → embed → validar (tsc 0 + render).

## 7. Backlog (rota R0–R5 + extras)

* **R0 — Bugs de a11y (verificar/fechar):** B1 (foco/teclado nas Opções), B2 (remap de controle funcionando de verdade), C3 (foco visível). Status incerto — auditar.
* **R1 — Detalhe dos temas:** grama no topo do piso (decoração world-space, como as minhocas; só visual, não mexe na colisão), nuvens/pássaros, paletas vivas. Grande parte feita.
* **R2 — Temas novos restantes (1 por versão):** caverna, deserto, fábrica/esgoto, castelo (genérico, não "Disney"). Cada um = gradiente + decoração-assinatura + inversão genérica. (`floresta` já existe.)
* **R3 — Silhuetas:** ver §6 (tarefa imediata).
* **R4 — Lacunas GAG:** botões de toque na tela, navegação de menu por controle (A1), legendas de SFX (C1), modo assistência (C2).
* **R5 — Auditoria final:** WCAG 2.2 (AAA aspiracional, marcado honestamente), GAG completo, revisão contra boas práticas sênior.
* **Árvores da Floresta Brasileira (pausado):** decoração de background, plantadas só em colunas de chão com sólido abaixo (sem bloco de ar `1` embaixo, considerando a coluna). Grupo 1 (2–3 de cada): Cerejeira rosa 20 blocos · Jacarandá roxo 20 · Salgueiro chorão verde-amarelado 23 · Sumaúma raízes-largas (6 blocos de raiz, 60 de altura). Grupo 2 (denso o suficiente): Canafístula verde+flores-amarelas 25 · Araucária 35 · Castanheira do Pará 40 · Ipê (amarelo/roxo/rosa/branco) 24 · Quaresmeira roxa 11 · Pau-Ferro 20 · Aroeira-Salsa 13 · Peroba rosa 30 · Guapuruvu amarelo 25. Abordagem decidida: renderizador paramétrico (estilos round/flowering/weeping/conifer/kapok) + tabela de espécies + posicionamento pré-computado (varrer o mundo estático achando colunas válidas) + desenhar em `drawFloraBack` (sobre o ar, atrás do player), só no tema Floresta, e renomear o tema p/ "Floresta Brasileira". Catálogo de arte já rendrizado (`docs/imagens-ref/catalogo-arvores-floresta-v1.png`). Pendências do José: (a) ajustes de arte por espécie? (b) alturas literais (troncos no chão, copas altas) ou "copas visíveis no chão" (reduzir alturas proporcionalmente)? Integrar só após resposta.
* **Caverna (enriquecer, opcional):** vigas de madeira (escoramento de mina), cristais maiores, brilho de lanterna.
* **VLibras:** José deve reportar qual toast aparece no site hospedado (diagnostica a integração).
* **Painel `?debug`:** cravar os valores do TUNE (§4) como padrão quando ele fechar os números.

## 8. Lições / armadilhas

* **Uma mudança coesa por versão**; valide antes de entregar; nunca `cp` por cima de entregável.
* **Investigue a causa-raiz antes de corrigir** (ex.: cruzeiro horizontal = `dx`, não o cap `vmaxX`; decoração fixa no mundo = `worldPos − viewCam`; camada importa — `drawMap(0)` cobre o fundo de ar).
* **Guarde código só-de-browser** com `typeof location`.
* **Sim deixa estado sujo** → reset + `setNumPlayers(1)` primeiro e nunca cacheie refs de player após `resetState` (use `api.players[0]`/`api.state` frescos).
* **Prefixe vars de teste na sim** (`TILE`/`PLAYER_H` já declarados).
* **Campo novo no player** → adicione ao `@typedef Player`.
* **Sinalize incoerências/consequências severas** (ex.: turbo<corrida, pulo meia-altura, ultra-pulo de 21 tiles) antes de executar — mas honre pedidos explícitos como decisões sobreponíveis.
* **Para arte, renderize a proposta** (node-canvas) e peça aprovação antes de embutir.

## 9. Assets de referência (no diretório de trabalho)

* `file.svg` — fonte vetorial do elenco (16 crianças; do próprio José, autorizado). Melhor fonte para a extração.
* `elenco-extraido-v3-svg.png` — melhor extração até agora (alvo da cópia fiel).
* `docs/imagens-ref/catalogo-arvores-floresta-v1.png` — arte das 13 espécies de árvore (background da Floresta).
* `pixel-art-sem-imagens-v3.1.100.html` — versão atual do jogo (trabalhe sobre a maior).

---

**Antes de qualquer entrega:** confirme as decisões pendentes do José (§6 e árvores em §7), valide (§5), incremente a versão (§3) e anuncie decisões não triviais no formato `Decisão: X porque Y. Para sobrepor, diga Z.`
