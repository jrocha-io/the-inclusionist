# Pesquisa — Modos de Alto Contraste (v4.0.0)

> Research-first: estudo das técnicas + tabela de resultados esperados **com fontes**, ANTES de codar.
> Motivação: os modos atuais `hc1..hc4` (recolor de tiles por paleta de grupo + variação de fundo) são
> considerados ruins e serão substituídos. O José pediu para tentar: **CLAHE**, **Realce Linear e
> Quadrático**, **VCEA** e **Técnicas de Renderização Direta**.

## 1. O que já existe no jogo (`VIZ_MODES`, `game.js`)

| Modo | `kind` | O que faz | Avaliação |
|------|--------|-----------|-----------|
| `normal` | normal | Arte crua | — |
| `bordas` | bordas | Contorno escuro em personagem/itens/bordas de plataforma (preserva a arte, alvo WCAG AA) | **Base boa** — é renderização direta |
| `hc1..hc4` | hc | Recolor dos tiles pela paleta do grupo (gradient-map por matiz) + 4 fundos progressivamente mais escuros | **Ruins** (a substituir) |
| `sim-*` / `fix-*` | filter | Simulação / correção de daltonismo (filtro SVG linear na GPU) | OK (fix-* refeito com Machado 2009) |
| `lv-*` / `blind` | lowvision/blind | Simulação de baixa visão / cegueira (empatia) | OK (são simulação, não correção) |

O motor renderiza em **PixiJS/WebGL**, arte **pixel art 320×180** (NEAREST), e no multiplayer aplica
filtro **por viewport** (RenderTexture). Hardware-alvo: **Positivo/Chromebook de escola pública** (o pilar).

## 2. As quatro técnicas — origem e para que foram feitas

### 2.1 CLAHE — Contrast Limited Adaptive Histogram Equalization
- **Fonte:** K. Zuiderveld, *"Contrast Limited Adaptive Histogram Equalization"*, Graphics Gems IV, Academic Press, 1994.
- **Mecanismo:** divide a imagem em *tiles* (ex.: 8×8), equaliza o histograma **local** de cada tile com um **clip limit** (limita a amplificação de ruído em áreas uniformes) e faz **interpolação bilinear** entre tiles.
- **Feito para:** imagens de **tom contínuo** com iluminação não-uniforme (médicas, fotográficas). Realça textura/detalhe local.

### 2.2 VCEA — Visual Contrast Enhancement Algorithm (baseado em HE)
- **Fonte:** *"Visual Contrast Enhancement Algorithm Based on Histogram Equalization"*, Sensors 2015, 15(7):16981, MDPI (doi:10.3390/s150716981).
- **Mecanismo:** variante de **equalização de histograma global** que **ajusta os espaços entre níveis de cinza adjacentes** para evitar super-realce e perda de detalhe, mirando a percepção visual humana.
- **Feito para:** melhorar contraste de **imagens fotográficas** com resultado mais agradável que a HE clássica.

### 2.3 Realce Linear e Quadrático (transformação de nível de cinza)
- **Fonte:** literatura clássica de processamento de imagem (grayscale transformation / contrast stretching); ex.: SPIE *Image Enhancement Processing* (TT92, cap. 9).
- **Mecanismo:**
  - **Linear:** `I' = α·(I − μ) + μ` (α = ganho de contraste, μ = média) — esticamento/compressão de contraste, **por pixel**.
  - **Quadrático:** curva de tom **não-linear** (realça sombras/altas-luzes tipo gama) — **por pixel**.
- **Feito para:** ajuste global de brilho/contraste. Barato, mas **não separa elementos** nem cria bordas.

### 2.4 Técnicas de Renderização Direta
- **Fonte / prática da indústria:** Access-Ability, *"2024: The Year of High Contrast Visuals"* (2024); template de 1ª-parte da PlayStation (God of War Ragnarök, Spider-Man, Horizon Forbidden West); Saints Row (2022) com **contorno de alto contraste + color-blocking**.
- **Mecanismo:** desenhar a apresentação de alto contraste **direto no pipeline**: **contorno brilhante por entidade**, **color-blocking por papel** (jogador / inimigo-perigo / item / plataforma cada um numa cor distinta), **fundo em tons de cinza/escurecido** para o primeiro plano saltar, tudo **customizável** e **alternável ao vivo**.
- **Feito para:** exatamente **acessibilidade de baixa visão em jogos** — identificar e separar elementos de interação, não "melhorar uma foto".

## 3. Análise crítica — fotográfico × pixel art de jogo

O ponto central: **CLAHE, VCEA e realce linear/quadrático são técnicas FOTOGRÁFICAS** (tom contínuo,
iluminação natural). A arte do Inclusionista é **pixel art chapada, hand-authored, poucos níveis, 320×180
já em alto contraste por design**. Consequências esperadas de jogar filtro fotográfico por cima:

- **Equalização de histograma (CLAHE/VCEA)** sobre paleta chapada → **remapeia/posteriza a paleta**, muda
  matizes, realça *dithering*/serrilhado, e **não distingue papéis** (jogador vs. inimigo vs. item continuam
  "iguais" para quem tem baixa visão — o filtro não sabe o que é importante).
- **Custo:** histograma por frame (CLAHE ainda por *tile* + interpolação) × até 4 viewports × 60fps é **caro
  no Positivo/Chromebook** — briga com o pilar de hardware. Precisa de múltiplos passes de shader.
- **Linear/Quadrático:** baratos e triviais na GPU (ColorMatrix/shader), mas a arte já ocupa a faixa toda →
  **ganho pequeno**; não criam bordas nem separação de papel. Servem no máximo como **slider pessoal de
  brilho/contraste**.

Em contraste, **Renderização Direta** ataca a necessidade real de baixa visão (distinguir e separar
elementos), **atinge WCAG por construção** (as cores/contornos são escolhidos p/ ≥7:1), é **barata** no
hardware-alvo, e é o que a **indústria e a área de acessibilidade adotam**. O jogo já tem meio caminho no
modo `bordas`.

## 4. Tabela de resultados esperados

| Técnica | Onde roda | Custo (Positivo/Chromebook, 4 viewports) | Efeito esperado na pixel art | Separa papéis? | WCAG AAA (7:1) | Artefato/risco | Veredito p/ este jogo |
|---------|-----------|------------------------------------------|------------------------------|----------------|----------------|----------------|------------------------|
| **CLAHE** | Post-proc, multi-pass GPU | **Alto** (histograma/tile + interp × viewport) | Posteriza paleta, realça serrilhado, contraste local "fotográfico" | ❌ | Não garantido | Mudança de matiz, ruído, over-enhance | ❌ Mismatch + caro |
| **VCEA** | Post-proc, HE global | Médio (histograma/frame × viewport) | Remapeia paleta global, shift de cor | ❌ | Não garantido | Feature loss, cor alterada | ❌ Mismatch |
| **Linear** | Shader por pixel | **Baixo** | Estica contraste (pouco — já saturado) | ❌ | Não por si só | Clipping de altas/baixas | ⚠️ Só como slider pessoal |
| **Quadrático** | Shader por pixel | **Baixo** | Curva de tom (aprofunda sombra/luz) | ❌ | Não por si só | Perde detalhe nas pontas | ⚠️ Só como slider pessoal |
| **Renderização Direta** | No pipeline (contorno + palette-swap por papel + fundo dessat.) | **Baixo** | Contorno espesso + color-blocking por papel; fundo apagado | ✅ | **Sim, por construção** | Precisa de bom design de paleta | ✅ **Recomendado** |

## 5. Recomendação

**Refazer o alto contraste como Renderização Direta**, evoluindo o `bordas` existente para um modo de
acessibilidade de baixa visão de verdade, com:

1. **Contorno configurável** (espessura em px lógico) em torno de personagem, itens, perigos e bordas de
   plataforma — o realce que a indústria usa.
2. **Color-blocking por papel** (paleta de alto contraste, colorblind-safe): jogador / item / perigo /
   plataforma / fundo cada um numa cor distinta e com contraste ≥7:1 entre vizinhos importantes.
3. **Fundo dessaturado/escurecido** (não recolorido de forma barulhenta como hc1-4) para o primeiro plano
   saltar.
4. **Presets + ajuste fino**: 2–3 presets (claro/escuro/noturno) + toggles; e — se o José quiser — um
   **slider Linear/Quadrático** de brilho-contraste como controle **pessoal secundário** (barato, opcional),
   já que essas duas são as únicas das quatro que fazem sentido em tempo real aqui.
5. **CLAHE/VCEA**: manter **fora do núcleo**. Se o José quiser experimentar mesmo assim, dá para prototipar
   um shader e comparar lado a lado — mas a expectativa (tabela acima) é custo alto e ganho baixo/negativo
   em arte chapada. Decisão dele.

## 6. Saída esperada e onde avaliar (antes de testes caros)

- **Saída esperada:** em cada preset, medir o **contraste real** (razão de luminância WCAG) entre
  personagem×fundo, item×fundo e perigo×fundo — meta **≥7:1** (AAA) para os pares críticos; contorno visível
  a 640×360 (viewport mínimo).
- **Onde avaliar:** Claude_Preview headless — screenshot por preset + amostragem de cor via `eval`
  (calcular razão de contraste dos pares). Nada de teste em hardware-alvo agora (regra do projeto).
- **Colorblind-safe:** validar a paleta do color-blocking passando pelos `sim-*` (deuter/protan/tritan) já
  existentes — os papéis devem continuar distinguíveis.

## 7. Fontes

- [CLAHE — Zuiderveld 1994 (via ImageMagick CLAHE docs)](https://imagemagick.org/clahe/)
- [VCEA — Sensors 2015, MDPI (doi:10.3390/s150716981)](https://doi.org/10.3390/s150716981) · [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4541917/)
- [Realce de nível de cinza — SPIE, Image Enhancement Processing (TT92, cap. 9)](https://spie.org/samples/TT92.pdf)
- [Prática de jogos — Access-Ability, "2024: The Year of High Contrast Visuals"](https://access-ability.uk/2024/01/26/2024-the-year-of-high-contrast-visuals/)
- [High Tech Aids Low Vision: A Review of Image Processing for the Visually Impaired — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4539202/)
- [Embedded system for contrast enhancement in low-vision (CLAHE + retina bio-inspirado) — ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S1383762112001002)
