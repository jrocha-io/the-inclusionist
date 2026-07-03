# Registro de Decisões — The Inclusionist v4

> Índice canônico: **toda decisão do projeto + o estudo que a embasa**. Uma linha por decisão;
> quando o estudo existe, linka o doc; quando não existe, o status é **ESTUDO PENDENTE** e o item
> entra na agenda (§9). Convenção: decisões são sobreponíveis pelo José — a reversão deve ser
> registrada aqui com a data.

## 1. Acessibilidade visual

| Decisão | Fundamento / estudo | Fonte | Status |
|---|---|---|---|
| Alto contraste = **Renderização Direta** (contorno + color-blocking + fundo que recua), NÃO filtros fotográficos | CLAHE/VCEA/linear-quadrático são técnicas fotográficas: posterizam pixel art, não separam papéis, custo alto no hardware-alvo; renderização direta é a prática da indústria (PlayStation 1ª parte, Saints Row 2022) e atinge contraste por construção | [PESQUISA-ALTO-CONTRASTE.md](PESQUISA-ALTO-CONTRASTE.md) | ✅ documentado |
| 3 níveis de contraste: **3:1 (padrão) · 4,5:1 · 7:1** — 3:1 escolhido como melhor ("7:1 vira tudo amarelo/preto/branco, desagradável") | Razões de luminância WCAG medidas analiticamente (3,8 / 4,5 / 7,4 plataforma×fundo); WCAG 1.4.11 (3:1 não-texto), 1.4.6 (7:1 AAA texto) como âncoras dos níveis | PESQUISA-ALTO-CONTRASTE.md §6 + commits `e1e1f56` | ✅ |
| **Dois contornos configuráveis** (Nenhum/Fino/Grosso): 1º plano = personagem/itens; 2º plano = só o PERÍMETRO externo de plataforma/água/lava | WCAG 2.4.7 (foco visível → 1º plano) e 1.4.11 (≥3:1 → ambos); "borda em cada bloco fica esquisito, o que faz sentido é delimitar navegável × não-navegável" (José) | commit `87aed33` | ✅ |
| **Color-blocking por papel**: perigo=laranja, escada/trampolim=ciano (escada em degraus ciano/preto), água=azul, portão trancado=magenta, estrutura=cinza | Papel→matiz distinto para identificação de função à primeira vista (prática GAG/indústria); escada desenhada como escada para não ler como "pista" | commits `d235004`/`7c7a425`/`4677e85` | ✅ (customização de cores → L2) |
| **Daltonização (fix-\*)**: matrizes canônicas C = I + M_err·(I−Sim); Sim = Machado 2009 sev. 1.0; M_err = Fidaner et al. | Fontes primárias conferidas (UFRGS/IEEE; daltonize.py); verificação: ganho de ΔE 4×/84×/3,7× nos piores pares confundíveis; brancos preservados (linhas somam 1) | [PESQUISA-DALTONIZACAO.md](PESQUISA-DALTONIZACAO.md) | ✅ |
| **Simulações (sim-\*)** também Machado 2009 (as "colorjack" antigas eram sem fonte) | Review DaltonLens: matrizes colorjack imprecisas | PESQUISA-DALTONIZACAO.md §2 | ✅ |
| Brettel 1997 exato para tritan **adiado** (piecewise, inexprimível em feColorMatrix) → Machado tritan como aproximação linear | PESQUISA-DALTONIZACAO.md §4 | idem | ✅ documentado |
| Aplicação de filtros em **sRGB nos 2 caminhos** (solo SVG ≡ MP PIXI) em vez de RGB-linear canônico | Consistência visual solo×MP > exatidão colorimétrica; aproximação padrão das implementações web | PESQUISA-DALTONIZACAO.md §4 | ✅ documentado |
| Botão 🚥 com fundo bicolor "diagnóstico" por deficiência; **protan×deutan não separam por cor** (mesmo eixo red-green) — só tritan isola limpo | Busca computacional com simulação Machado (ΔE Lab): melhor par protan deixa deutan com ~60% do contraste — limite físico | sessão 2026-07-02 (commits `cf1b920`) | ✅ · estudo do que mais dá pra fazer → **L8** |
| Modo TEA (🧩) com 3 estados: off=azul, calmo=fundo BRANCO, silencioso=amarelo (sinal no fundo, não na borda — borda é do foco) | Conflito com o realce de seleção :focus/.pi-sel detectado em teste | commit `89e51e2` | ✅ |
| Baixa visão = **5 simulações** (miopia/astigmatismo, catarata, glaucoma, degeneração macular, retinopatia diabética); empatia ≠ ajuda (modo cego ≠ empatia-cego) | Espec. do José por condição clínica; princípio "não confundir ajuda com simulação" | plano-acessibilidade.md | ✅ |
| **Paleta CB-safe** = HUD/menus/itens/elementos de jogo apenas; cenário mantém cores naturais ("árvore cor de árvore para o daltônico") | Decisão do José 2026-07-02; base Okabe-Ito p/ paleta segura | — | 🔨 implementar em **L2** |
| Fonte mínima da UI = **16px a 640×360, escalando com o canvas** (≥16, nunca ≤); HUD em DOM de alta definição (não rasterizado no canvas) | WCAG: 16px como piso prático de legibilidade; correção explícita do José ("MAIOR IGUAL, não menor igual") | commit `8e95257` | ✅ |
| **Noto Color Emoji** no stack de fontes | Consistência de emoji entre Windows/ChromeOS/Android | idem | ✅ |

## 2. Tipografia

| Decisão | Fundamento / estudo | Fonte | Status |
|---|---|---|---|
| **Menu Tipografia próprio** na pausa (saiu da Sensibilidade visual): caixa branca com o pangrama "Juiz foge e bota fita de cetim na xícara" + 3 grupos (Sem serifa / Serifada / Manuscrita), UMA fonte ativa (radio); cada linha renderizada na própria fonte | Pedido do José 2026-07-02; pangrama pt-BR cobre acentos | commit `450e96f` | ✅ |
| Catálogo: só fontes **SIL OFL 1.1** embarcadas (16 famílias, woff2 latin, ~530KB, SW cacheia sob demanda). **Learning Curve** (freeware Blue Vinyl, sem OFL clara) e **Kindergarten Pro** (licença em negociação) aparecem DESABILITADAS e não foram embarcadas | Política GPL-clean do repo (fonts.css: "todas OFL") | fonts.css | ✅ · ⚠️ destravar quando as licenças fecharem |
| Lexend selecionada mantém o **espaçamento BDA** (letter 0.18em / word 0.63em) do mecanismo canônico | British Dyslexia Association style guide | style.css data-fonte | ✅ |

| Decisão | Fundamento / estudo | Fonte | Status |
|---|---|---|---|
| Fontes canônicas: **Atkinson Hyperlegible** (padrão), **Andika** (alfabetização), **Lexend** (opcional dislexia/discalculia/TDAH), **Atkinson Hyperlegible Mono** (matemática), **Braille CC0** | Pesquisa própria do José com referências ABNT/DOI + estudo meu convergente | [referencia-tipografica-projeto-v6.md](referencia-tipografica-projeto-v6.md) (canônico) · [ESTUDO-FONTES.md](ESTUDO-FONTES.md) · [PESQUISA-FONTES-CONDICOES-LETRAMENTO.md](PESQUISA-FONTES-CONDICOES-LETRAMENTO.md) | ✅ |
| OpenDyslexic **fora do cânone** (evidência fraca/negativa), disponível só por escolha explícita, sem alegar eficácia | Estudos de eficácia citados no ESTUDO-FONTES | idem | ✅ |
| Espaçamento padrão: line ≥1.5×, letter ≥0.12em, word ≥0.16em, paragraph ≥2×; toggle Dislexia = letter 0.18em + word 0.63em | WCAG 2.2 §1.4.12 + Guia da British Dyslexia Association (palavra ≥3,5× o espaço entre letras; letra ≈35% da largura média) | ESTUDO-FONTES.md | ✅ |
| Kindergarten Pro (BR) e Learning Curve (EU/CA/US) para caligrafia — uso "inegociável" | Learning Curve conferida: gratuita p/ uso comercial (Blue Vinyl); Kindergarten Pro = licença de embedding a negociar | ESTUDO-FONTES.md | ⚠️ contato com a foundry pendente |

## 3. Entrada e acessibilidade motora

| Decisão | Fundamento / estudo | Fonte | Status |
|---|---|---|---|
| Botões virtuais dimensionados em **mm físicos** (âncora: iPhone 16 preenchendo a tela), NÃO em px WCAG — "as diretrizes WCAG valem para toque/clique, não para botões simulados segurados" | Revisão da proposta do José (9–15mm botão, 1.5–5mm espaço, D-pad cruz 10–20mm, alavanca 3–7mm, analógico 11–18mm; faixas criança 6-12 × adulto) contra literatura de alvos de toque e ergonomia | sessão 2026-07-01 — **pesquisa só no chat** | ⚠️ **ESTUDO PENDENTE: consolidar em doc (L0)** |
| Aviso ergonômico: criança em botão de adulto → risco de tendinite; adulto em botão de criança → fadiga por flexão excessiva | idem (revisão pedida pelo José) | idem | ⚠️ consolidar junto |
| Touch = **4 bolhas em losango** (Gamepad API: 0=pulo/sim embaixo, 1=especial/não direita, 2=interação esquerda, 3=troca em cima) + **START em pílula**; designs Genérico/Microsoft/Sony/Nintendo via `gamepad.id`; só Sony/Nintendo invertem sim/não culturalmente | Convenções culturais de console documentadas pelo José; Gamepad API `mapping:"standard"` | sessão 2026-07-01/02 | ✅ (wizard DirectInput → L1) |
| Teclado: **UJIK preservado** (mãos pequenas, herança DOS); Espaço=pulo por acessibilidade; Ctrl/Shift só no modo Fácil (especial/troca); NUNCA Win/Alt/AltGr (SO) | Experiência de mãos pequenas do José + colisão com atalhos de SO/navegador | game.js KB | ✅ |
| Esquemas 1/2/3/4 jogadores SEPARADOS; conflito bloqueado (tecla de um jogador não pode ser de outro); teclado é sempre fallback com gamepad plugado | GAG (remapeável); prevenção de conflito em MP local | game.js `keyUsedByOther` | ✅ |
| **Modo Fácil**: gravidade ×2/3, pulo ×8/7, hitbox de coleta +4px (visualizada), moedas no chão, sem perigos, proteção de beirada (cair só com ↓), quique fixo suave, todo botão de pulo interage | Espec. do José testada "com dois dedos em riste"; GAG (evitar timing preciso/inputs simultâneos) | plano-acessibilidade.md | ✅ |
| **Alternância** (toggle-move): segurar = 2/3 da velocidade, toque = contínuo 1/3, pulo não interrompe caminhada | Teste do José "com um único dedo"; conferido contra GAG (single-switch OK) | idem | ✅ |
| **Empatia motora**: um-botão-por-vez; cadeirante (sem pulo, rampas 45° com colisão + faixa amarela, elevadores com cabine de vidro + auto-ride, lava/trampolim→chão, pernas paradas, só voo/super-corrida, itens no chão) | Espec. do José + plano completo executado | plano mellow-questing-riddle + commits da sessão | ✅ (auditoria final de percurso → L8) |
| **Gamepad (teste físico 8BitDo, 2026-07-02)**: 1º controle assume o **Jogador 1** (teclado segue de fallback); **entrar em jogo em andamento NÃO reinicia a rodada** (sobrepõe a decisão "nova rodada" do Lote B — o novo jogador entra do spawn com os itens DELE); desconectar ≠ abandonar; recomeço de tela abandonada re-sorteia só os itens daquele dono | Relatório de campo do José com controle real | commits `418b62d`/`7d7aff3` | ✅ |
| **Wizard de mapeamento por modelo de controle** (gamepad.id): botões por índice, analógico por limiar (eixo+sinal), D-pad DirectInput como POV hat (valor de eixo ±0.13); abre AUTOMATICAMENTE (pausando todos) quando um controle fora do padrão sem mapa aperta algo; sempre dentro do canvas; demos com frames reais do jogo | Gamepad API: `mapping:''` não padroniza índices; hat vira eixo com 8 passos ~0.286 | commits `7d7aff3`/`59714f7`/`aaf162d`/`7d686ef` | ✅ |
| **Zona morta do analógico = primeira METADE do curso** (ativa a >0.5); classificação stick×hat por COMPORTAMENTO (variação contínua × valor constante), nunca por magnitude — nada exige curso máximo | Ergonomia: exigir deflexão máxima força tensão constante do dedo (José, teste físico) | commit `7d686ef` | ✅ |
| **Ícones canônicos de power-up**: 👟 super-corrida/bengala · 🕷️ escalada · 🎈 voo (jetpack) · 🐇 super-pulo · 🦘 ultra-pulo; TTS diz "Voo" (não "Asas") | Padronização de linguagem visual/sonora (José 2026-07-02) | idem | ✅ |
| Webcam: **MediaPipe tasks-vision** (não WebGazer — não detecta piscadas bem); modos rosto (blendshapes) e olhos (8 setores, dwell 0,5–1s) | Avaliação técnica das libs (blendshapes 0–1 do MediaPipe) | sessão 2026-07-02 | 🔨 **L7** |
| Voz: palavras-comando pt-BR mapeáveis; "para" interrompe; sim/não nos menus | Espec. do José | idem | 🔨 **L7** |

## 4. Acessibilidade auditiva

| Decisão | Fundamento / estudo | Fonte | Status |
|---|---|---|---|
| Mixer com **9 categorias** independentes (música, ambiente, interação, earcons, outros, TTS, sonar, guarda de beirada, guia) — volume de navegação sonora NÃO é afetado pelo volume geral | GAG (controles de volume independentes); espec. do José | [plano-audio-fase-f.md](plano-audio-fase-f.md) | ✅ |
| **Modo cego** = ajudas de áudio (bengala com material por superfície, sonar, guarda de beirada, guia em laço, cordas na água) SEM escurecer a tela; empatia-cego = tela preta | "NÃO CONFUNDA MODO CEGO COM MODO EMPATIA" (José) | plano-acessibilidade.md | ✅ |
| Sons por **saída de áudio por jogador** (setSinkId); volume/TTS/modo cego só editáveis por quem tem saída PRIVADA | Impossível jogar com bengalas de jogadores diferentes na mesma caixa (José) | game.js `hasPrivateOutput` | ✅ |
| TTS: **Piper primário pt-BR** + Kokoro + Kitten + eSpeak NG WASM embutido; Web Speech = fallback; toggles TTS e Legendas separados | Pesquisa F5: só Piper tinha voz pt-BR neural leve | [plano-tts-fase-f5.md](plano-tts-fase-f5.md) | 🔨 neural em **L4** |
| Perda auditiva (empatia): expansão descendente (downward expansion) + low-pass — o INVERSO de um aparelho auditivo | Espec. técnica do José (limiar → ×0,1; agudos primeiro) | plano-acessibilidade.md | ✅ |
| Música: **MIDI ou procedural, nada de ogg/mp3** | Peso no hardware-alvo + GPL-clean | decisão José | 🔨 estudo em **L8** |
| Pausa GAG: silencia TODO o som e congela chuva/animações | GAG (Pause/Stop/Hide) + WCAG 2.2.2 | setPhase | ✅ |

### 4.1 TTS neural (F5/L4)

| Decisão | Fundamento / estudo | Fonte | Status |
|---|---|---|---|
| Piper pt-BR (faber-medium) via `@mintplex-labs/piper-tts-web` 1.0.4: lazy-CDN (D1), OPFS cacheia o onnx (60,3MB) → 2ª sessão offline; fila de 1 fala (a última vale); fallback Web Speech automático | plano-tts-fase-f5.md (D1–D4); API reconfirmada no fonte da lib antes de codar | commit `814fb5d` | ✅ medido: 1º uso 9,2s · síntese > tempo real · 2ª sessão 1,3s |
| Kokoro/Kitten SEM pt-BR → só builds i18n (D4); eSpeak NG embutido = fase posterior; medição do TTS no hardware-alvo = bloqueada até liberar o Positivo | idem | plano-tts-fase-f5.md | ⏸ |

## 5. Pedagogia e jogo

| Decisão | Fundamento / estudo | Fonte | Status |
|---|---|---|---|
| **Quiz em 5 níveis** pela psicogênese da língua escrita: 1 pré-silábico (escolher a escrita certa entre 3, sistema soletra; distratores malformados = troca de vogal/inversão de par, nunca palavra real) · 2 silábico (monta por sílabas, sistema lê) · 3 silábico-alfabético (idem, sistema soletra) · 4 escritor (grade de letras, sistema fala o nome) · 5 escritor cego (grade de letras, sistema dita a cela braille). Ciclo no botão "📚 Nível" da pausa, persistido, padrão nível 2 | Espec. completa do José 2026-07-02 — base: Ferreiro & Teberosky | PLANO-EXECUCAO.md; commits `856c44b` | ✅ · ⚠️ referências formais a citar no estudo (§9.6) |
| **Quiz POR JOGADOR no MP**: cada jogador abre o SEU quiz na tela dele (DOM por .player-screen); teclado roteia pela tecla do dono, gamepad pelo pad do dono; a partida dos demais segue; Esc/Alt+N bloqueiam com qualquer quiz aberto | GAG (multiplayer equitativo); itens já eram por dono (Lote C) | commit `45b5b66` | ✅ |
| "⠿ Braille" saiu do ciclo do botão ABC: o ditado passivo acompanha o Modo cego (a11y) e a ESCRITA braille é o nível 5 | Evita 2 fontes de verdade p/ braille | game.js | ✅ |
| **Itens individuais por jogador** (cor do dono, posições aleatórias, alheio esmaecido; só o EFEITO da chave é compartilhado) | "Impedir que um jogador atrapalhe o amigo" + "um encontra o item do outro e ajuda" | commit `b06b8fe` | ✅ |
| Braille: sistema **soletra os PONTOS da cela** (pt-BR, grau 1) | Espec. do José; alfabetização braille | game.js BRAILLE | ✅ (nível 5 do quiz consolida) |
| Reduce-motion: "movimento" = GAG (alternância) e "animação" = WCAG (2.3.3); toggles separados por tipo de animação e por jogador; respiração ≠ gracinhas | Conflito terminológico resolvido pelo José | plano-acessibilidade.md | ✅ |
| Física: velocidades independentes entre si (sem derivar uma da outra); TUNE ao vivo no ?debug | Preferência registrada do José (CLAUDE.md §2.12) | CLAUDE.md | ✅ |

### 5.1 Cidade viva (L5) — decisões de implementação

| Decisão | Fundamento | Fonte | Status |
|---|---|---|---|
| L5 inteiro PROCEDURAL (0 gerações): chuva em rotina (30s bom → loop garoa5/chuva5/garoa5/bom45), vida ambiente (pombos revoam cosmético/gatos/cães/adultos, pool 8 perto da câmera), carros na camada da FRENTE + semáforo verde8/amarelo2/vermelho6 governando-os, deco por zona (calçada/postes/placas/letreiros brilho fixo/caixa d'água/janelas/abandonado sob o darkLayer) | plano-cenario-cidade.md (revisão final: "procedural-first"); WCAG 2.3.1 sem flashes; rm.decor desliga chuva+vida+carros | commits `7729dc4`→`39c2aa1` | ✅ |
| "Rua" = linha de superfície AO AR LIVRE mais comum na parte baixa (células de darkRegions EXCLUÍDAS — bug pego por leitura de pixel); adultos em silhueta NO PARALLAX ficam com a arte do José (C2 lojas, Aseprite) — os pedestres no plano já cobrem a vida | detecção robusta > coordenada fixa | game.js initTraffic | ✅ |

### 5.2 R-cidade + L6 (temas)

| Decisão | Fundamento | Fonte | Status |
|---|---|---|---|
| Modelo do cenário Cidade (José 2026-07-03): interior de prédio; parte mais baixa = FACHADA; a RUA (carros 3×, semáforo 2×, placas de PARE) fica NA FRENTE dela, na base do mundo; árvores/calçada/postes/letreiros só na banda baixa; janelas removidas; céu com nuvens à deriva + pássaros; pombos com peso 3× | Correção de leitura espacial do José | commit `0019350` | ✅ |
| ~~L6 procedural inventado~~ **REJEITADO pelo José** ("misturou tudo") → L6 REFEITO como CÓPIA das fórmulas da v3.1.100: THEMES exatos (sky/cloud/hills/decor), blocos Clarity SEM recolor, chuva SÓ na Cidade, decor de tela contra-posicionado (estrelas/nuvens/pássaros/névoa) + decor de mundo culled (grama THEME_FLORA/minhocas/vagalumes/borboletas). Lição: portar = copiar a fonte, não reinterpretar | Ordem explícita do José 2026-07-03 | commits `cf105eb`→`87d8ef6` | ✅ |
| Pegadinha v3→PIXI: `(seed>>17)%len` fica negativo (shift COM sinal) — o canvas2d engolia o fillStyle inválido; o PIXI lança "Unable to convert color NaN". Em ports, trocar `>>` por `>>>` em índices de array | Diagnóstico por monkeypatch no beginFill | game.js drawV3Grass | ✅ |
| R-cidade 2: carros 3× NATIVOS (78×36 detalhados) SEMPRE à frente (boot solo corrigido); HC escurece a frente (setFrontDim 0x4a5058/0,55 — frente é ambiente); adultos = silhuetas 16×32 (3M+3F) nascendo nas colunas abertas da fachada com fade-in | Correções do José 2026-07-03 | commit `f1ee6ed` | ✅ |

### 5.3 Tiles/água da v3 + menu inicial + atividades (2026-07-03)

| Decisão | Fundamento | Fonte | Status |
|---|---|---|---|
| Tiles = drawTile da v3 (pedra pontilhada, parede c/ linhas, escada vazada, trampolim magenta, água TRANSLÚCIDA); água FORE com ondas/corais/algas/peixes por cima do player (stepTileFx, fórmulas exatas); lava com tracinhos | Report do José: "tilesets ruins/água pior" | commit `f51f689` | ✅ |
| Menu inicial = tela da v3 (céu gradiente + nuvens móveis + grama) com Lúdico · Alfabetização (5) · Matemática (11) e seletor 0-10 p/ Tabuada/Divisão; alf = 3 vitórias→1 moeda SEM penalidade; matemática = 1 acerto (decisão: a regra 3-de-1 foi especificada só p/ alfabetização — sobrepor = 1 linha); Braille fala SÓ os pontos; trocar de jogo = todos saem → menu | Espec. completa do José 2026-07-03 | commit `0078c9d` | ✅ |
| Frações: soma/sub por denominadores, sem resultado negativo, resposta SIMPLIFICADA (mdc) e falada por extenso ("três quartos") | Pedagogia + TTS legível | game.js fracStr/fracSpeak | ✅ |

## 6. Arquitetura e plataforma

| Decisão | Fundamento / estudo | Fonte | Status |
|---|---|---|---|
| **PixiJS** (WebGL, 1 contexto) + texto/UI em DOM | Pilar P1 (hardware fraco) + AAA de texto exige DOM | [PILARES-INEGOCIAVEIS.md](PILARES-INEGOCIAVEIS.md) | ✅ |
| MP = **contêiner DOM por jogador sobre render compartilhado** (RenderTexture por viewport); **E5 (N canvases) CANCELADO 2026-07-02** | N contextos WebGL = risco de FPS no Positivo/Chromebook | memória do projeto + PLANO-EXECUCAO.md | ✅ |
| Cada viewport ≥**640×360** (k≥2); 2×2 cabe no Chromebook 1366×768; telas novas só se couberem; celular = fullscreen 1 jogador | Conta de layout sobre a resolução do hardware-alvo | commits Lote B | ✅ |
| PWA offline com SW **network-first para app-shell** (mata o CSS/JS velho preso) + bump de CACHE por mudança | Gotcha documentado após incidentes de cache | v4.0.0/README.md | ✅ |
| Tauri/Tauri Mobile (não Electron/Capacitor) — pós-MVP | Peso do Electron × hardware fraco | PILARES | adiado |
| GPL-3.0 no código desde já + **arte NÃO-FOSS** (marca seletiva + licença própria); jogo gratuito | Elegibilidade FOSS de editais + proteção de personagens; [LICENCAS-GERACAO-IMAGEM.md](LICENCAS-GERACAO-IMAGEM.md) (PixelLab SAFE etc.) | PILARES + LICENCAS | ✅ |
| **Libras: Live2D Cubism com personagem PRÓPRIO** (zdog inviável — expressões faciais; samples oficiais Live2D não redistribuíveis) | Decisão José 2026-07-02; licença Live2D Free Material conferida | PLANO-EXECUCAO.md | 🔨 estudo em **L8** |
| VLibras como interim (painel 420×180, 21:9; jogo desloca e centraliza) | NBR 15290 (janela de intérprete ¼ largura × ½ altura) adaptada | PILARES P5 | ✅ |

## 7. Compliance e políticas educacionais

| Decisão | Fundamento / estudo | Fonte | Status |
|---|---|---|---|
| **Lei local da região de implantação VENCE**; o resto é "meta, conforme possível" | Resolução da contradição China real-name × COPPA/LGPD | PILARES P4 (RN-01..04) | ✅ |
| Identidade do adulto NUNCA armazenada (token/booleano de consentimento; quem trata é o gov); real-name só dentro da China; residência de dados no país de origem | Minimização LGPD/GDPR/COPPA/PIPL | PILARES RN-02/03/04 | ✅ |
| Dados de pesquisa: **nada aberto** — só anônimos/agregados via parceria com instituição de renome | Risco de escândalo (premortem) | [AVALIACAO-ADVERSARIAL-PREMORTEM.md](AVALIACAO-ADVERSARIAL-PREMORTEM.md) | ✅ |
| China = "**aprovável**" é META de engenharia, não claim de venda (版号/localização são aprovação externa) | Red-team | idem | ✅ |
| **Políticas educacionais finlandesas/nórdicas** (critérios de qualidade p/ jogos educativos) | — | — | ❌ **ESTUDO PENDENTE (L0)** |
| **Políticas educacionais chinesas** (anti-addiction, conteúdo, 版号 como referência de projeto) | — | — | ❌ **ESTUDO PENDENTE (L0)** |
| **Mapa GAG item-a-item** (o que cada feature cobre: Basic/Intermediate/Advanced) | Parcial: AUDITORIA-E13 cobriu gates | [v4.0.0/AUDITORIA-E13.md](../v4.0.0/AUDITORIA-E13.md) | ⚠️ **consolidar (L0) + final em L9** |
| **Mapa WCAG 2.2 critério-a-critério** (AA × AAA, honesto: onde só dá AA) | Parcial (axe = 0 violações na E13; AAA "aspiracional marcado honestamente" — CLAUDE.md §2.7) | idem | ⚠️ **consolidar (L0) + final em L9** |

## 8. Arte e visual (diretrizes vigentes)

| Decisão | Fundamento / estudo | Fonte | Status |
|---|---|---|---|
| Arte = **dados/código procedural** (PixelLab/Magnific só referência de design); pixel art PNG agora → procedural depois | GPL-clean + leveza; licenças conferidas | LICENCAS-GERACAO-IMAGEM.md, [DIRETRIZES-VISUAIS-E-FISICA.md](../v4.0.0/DIRETRIZES-VISUAIS-E-FISICA.md) | bases = José (Aseprite) |
| Cores CHAPADAS sem contorno/sombra/luz nos personagens (TDAH); 320×180/16px mantidos (48×48 cancelado: "resolução rica demais pode ser problema para TDAH") | Hipótese pedagógica do José — ⚠️ sem estudo formal citado | DIRETRIZES | ⚠️ anotar como hipótese a validar |
| Juice (poeira/brilho/squash/hit-stop/screenshake/shimmer/easing) — **cada efeito desligável no debug** p/ teste no hardware | GAG (efeitos desativáveis) + medição de custo | DIRETRIZES | ✅ commit `5e18fc0` |
| Juice × Movimento Reduzido (WCAG 2.3.3): partículas→`rm.particles`, cintilar→`rm.items`, tremor de tela→`rm.parallax` (categoria "movimento de câmera"), squash→`rmWalk` por jogador; **hit-stop não é movimento** (é pausa) e fica fora do RM | Mapeamento 1:1 com os alvos de RM já existentes; evita criar chave nova | game.js (bloco JUICE) | ✅ decisão anotada |
| Pós-processamento CRT (scanlines/vinheta/cantos 24px) como classes CSS no `#game-region`, **padrão DESLIGADO** (estética opt-in); z-index 5 = sobre o jogo e ABAIXO de pausa (6) e diálogos (60) → menus nunca perdem legibilidade; `prefers-reduced-transparency` desativa | GAG (efeitos desativáveis); legibilidade de menus > estética | style.css | ✅ commit `cf07b5a` |
| Realce de contraste **Linear→Quadrático** = 1 slider (0=off; começo=stretch linear α1,3; fim=curva S quadrática), GPU via feComponentTransfer sRGB, **global** (tela toda; por-viewport adiado — exigiria filtro WebGL por tela) | PESQUISA-ALTO-CONTRASTE §2.3 (contrast stretching clássico, SPIE TT92 cap. 9) | PESQUISA-ALTO-CONTRASTE.md | ✅ commit `78995de` |
| Paleta CB-safe opcional = **Okabe & Ito (2008)** (laranja/azul-céu/amarelo), aplicada SÓ a jogadores/itens/efeitos — cenário mantém cores naturais (decisão do José); HUD/menus já não carregam cor distintiva por jogador (nada a trocar lá) | Okabe M. & Ito K., *Color Universal Design*, 2008 — paleta distinguível em protan/deutan/tritan; a padrão (vermelho×verde claros) confunde protan/deutan | jfly.uni-koeln.de/color | ✅ commit `51df79c` |
| Color-blocking **customizável**: 4 papéis (perigo/escalável/água/portão) com picker + restaurar padrão; escada e portão derivam a cor do papel | GAG (cores configuráveis pelo jogador); cobre daltonismos não previstos pela paleta fixa | game.js (HC_ROLE) | ✅ commit `51df79c` |
| Itens na cor do dono = **opção** (padrão ligado); desligado mantém o esmaecido de dono no MP (alpha continua diferenciando) | Preferência/estímulo visual (TEA): reduzir cor não pode remover a INFORMAÇÃO de posse | game.js | ✅ commit `51df79c` |
| 4 camadas de cena (tileset+jogo / 3 parallax) | Profundidade visual barata (TilingSprite) | DIRETRIZES | ✅ estrutura · riqueza = José |

## 9. Agenda de estudos pendentes (ordem)

1. **Botões/ergonomia mm** — consolidar a pesquisa (feita no chat 2026-07-01) num doc com fontes: alvos de toque vs. botões virtuais SEGURADOS, antropometria de mão infantil, faixas por idade, riscos (tendinite/fadiga). → alimenta a linha §3.
2. **Políticas educacionais finlandesas/nórdicas** — critérios de qualidade, avaliação de jogos educativos, privacidade escolar (base p/ P3/P4).
3. **Políticas educacionais chinesas** — anti-addiction, aprovação de conteúdo, requisitos técnicos (base p/ P4; "aprovável" como meta).
4. **Mapa GAG completo** (item-a-item × status no jogo).
5. **Mapa WCAG 2.2 completo** (critério-a-critério, AA×AAA honesto).
6. **Psicogênese (Ferreiro & Teberosky)** — referências formais para os 5 níveis do quiz (§5).
7. **Protan×deutan além da luminância** (L8) e **Live2D p/ Libras** (L8).
