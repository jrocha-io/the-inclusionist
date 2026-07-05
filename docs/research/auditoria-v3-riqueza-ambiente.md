# Auditoria — riqueza de ambiente da v3 (`legacy/v3.1.100.html`)

> Anexo à auditoria de créditos. Catálogo do material da v3 (tilemap + animações por cenário),
> para **reaproveitar técnicas** na v4 em vez de regerar imagens.

## Achado central
A v3 produzia toda a riqueza visual **proceduralmente em `<canvas>` — ZERO geração de imagem (0 créditos PixelLab).**
Tiles e ambiente são desenhados por código, por tema. Isso casa com o pilar "runtime mais enxuto"
e é a referência certa de custo: **a v3 inteira, com 4 cenários animados, custou 0 gerações.**

## Temas/cenários (cada um com peculiaridades)
| Tema | Céu | Nuvem | Montanhas | Decoração ambiente | Caverna (segredo invertido) |
|---|---|---|---|---|---|
| **Dia no Campo** (`campo`) | azul→verde claro | branco | verdes | nuvens, pássaros, **borboletas**, grama+flores ao vento | rocha marrom, veio dourado |
| **Amanhecer no Campo** (`cemiterio`) | roxo→lilás | lilás | verde-acinzentado | nuvens, pássaros, sparkles, **minhocas**, **névoa** | rocha arroxeada, veio ametista |
| **Noite no Campo** (`espaco`) | quase preto→azul | cinza-escuro | azul-escuro | nuvens, sparkles, **vagalumes** | rocha azulada, cristal ciano |
| **Floresta** (`floresta`) | verde-escuro→verde | verde claro | verdes escuros | nuvens, pássaros, **borboletas**, grama+flores | rocha terrosa, veio âmbar |

Estruturas: `THEMES` (céu/nuvem/montanha/decor), `THEME_FLORA` (grama/flor por tema), `CAVE_PAL` (mina revelada na inversão), `SCENE_THEMES` (sorteio aleatório).

## Sistemas de animação ambiente (todos procedurais)
| Sistema | Técnica | Âncora |
|---|---|---|
| **Grama+flores ao vento** (`drawSurfaceGrass`) | tufo por coluna, ponta inclina com `sin(frame)`; flor balança mais que a grama; **determinístico por coluna (sem cintilar)** | mundo (no topo do chão) |
| **Nuvens** (`drawClouds`) | 3 nuvens "puff" derivando devagar, cor por tema | tela |
| **Pássaros** (`drawBirds`) | 3 silhuetas em "V" batendo asa, cruzam a tela | tela |
| **Sparkles/estrelas** (`drawSparkles`) | 22 pontos piscando suave, atrás das montanhas | tela |
| **Vagalumes** (`drawFireflies`) | grade de células do mundo (~1/3), vagueiam e pulsam, **só no ar**, halo+núcleo | mundo |
| **Borboletas** (`drawButterflies`) | ancoradas a ~1/5 das colunas de chão (perto da flora), esvoaçam subindo/voltando, asas batendo | mundo |
| **Névoa** (`drawFog`) | 3 camadas baixas, topo ondulante que deriva, **opacidade baixa (não esconde o jogador)** | tela |
| **Minhocas** (`drawMinhocas`) | ~1/4 das colunas, no chão, segmentos ondulando | mundo |
| **Montanhas** (`drawHills`) | camadas de morros por tema (parallax de fundo) | tela/parallax |
| **Fogos** (vitória) | partículas; **respeita reduced-motion** | tela |

## Acessibilidade (a v3 já fazia o que propus pra v4)
- `viewDecor` — liga/desliga animação decorativa **por jogador**; **auto-off** se `prefers-reduced-motion` (`opt-decor` desmarca sozinho).
- `viewHC` — alto contraste **esconde a decoração** (clareza).
- **Nada pisca forte** (< 3 Hz; WCAG 2.3.1/2.3.3) — declarado no próprio relatório da v3.
- Determinismo por *hash* de coluna/célula → **sem cintilação** entre quadros.
- World-anchored (rola com a cena) vs screen-anchored (céu) bem separados.

## Implicação para a v4 (cidade)
**Portar os sistemas procedurais da v3 em vez de gerar sprites** para o ambiente:
- **Pombos voando ≈ `drawButterflies`** (mesma âncora-no-chão + esvoaçar; trocar forma/movimento p/ revoada ao se aproximar).
- **Letreiros/lâmpadas com brilho ≈ `drawFireflies`/sparkles** (pulso suave, sem piscar).
- **Névoa/poeira do interior abandonado ≈ `drawFog`**.
- **Nuvens** reaproveitáveis direto (camada de céu da cidade).
- **`viewDecor` + `prefers-reduced-motion` + `viewHC`** → reusar o mesmo gate (já é o toggle "Vida & animação" que propus).

→ Gerar imagem só onde procedural não resolve: **tileset (5)** + **poucos props/criaturas "herói"** (caixa d'água, gato, cachorro, adulto, placa). Estimativa cai de ~46 para **~20–25 gerações**, com ambiente mais rico e 100% acessível.
