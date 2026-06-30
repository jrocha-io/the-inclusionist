# Plano de Acessibilidade — The Inclusionist (v4)

Decisões fechadas com o José. Implementação em fases (A→B→C→E→F).

## Modos de visualização (4)
1. **Normal**
2. **CB-safe** (Okabe–Ito, daltonismo)
3. **Alto contraste** — **4 variações** (ciclo `🎨 Cores`: claro/médio/escuro/noturno) para o jogador escolher. Fundo **escuro porém colorido** (não preto — preto vira "buraco" assustador). Recolor **procedural por PALETA**: cada elemento mantém seu claro-escuro (sombreado) e tem as cores remapeadas para o **matiz mais próximo** dentro da PALETA do seu grupo (jogador/item/fundo) — preserva a riqueza de cor.
   - Baseado nas **13 paletas do José** (tiers de luminância; gap 5≈3:1, 7≈4.5:1, 9≈7:1). Por variação: Fundo P_n, Jogador P_(n−9) (**7:1**), Itens P_(n−7) (**4.5:1**), n∈{10,11,12,13}.
   - Jogador↔itens ~1.5:1 de luminância → resolvido por **forma + matiz + contorno** (1.4.1/1.4.11 OK). Plataformas no grupo fundo (textura do tileset + contraste do player dão legibilidade).
   - `PALETTES` e `HC_VARIATIONS` em game.js. **Achado WCAG:** ≥7:1 entre os 3 grupos é impossível (luminância apenas) → por isso player↔itens vai por forma/matiz, não luminância.
   - ⚠️ A 1ª troca para um modo HC tem pico de FPS (mapeamento por matiz, HSL por pixel); cacheado depois. Otimizar se incomodar no hardware-alvo.
   - HUD: **7:1 contra o próprio fundo** (1.4.6 AAA de texto, já no DOM).
4. **Pessoa cega** = **tela apagada + pistas sonoras** (para jogadores enxergarem como é jogar cego). Áudio é ortogonal: liga as pistas; a tela apaga neste modo.

### Pendências de cor (próximas)
- **Normal (cores normais) = WCAG 2.2 AA (3:1)**: garantir 3:1 entre grupos adjacentes (personagem/itens/escada/perigo/NPC/fundo/plataforma). Correção do José: o requisito real p/ componentes/ícones é **3:1** (1.4.11), não 7:1 (7:1 é texto×fundo, 1.4.6 AAA). Grupos-base: **P1×P6×P11**, **P2×P7×P12**, **P3×P8×P13** (pares adjacentes ~3:1); intermediárias quando a adjacência não atrapalha.
- **CB-safe**: paleta p/ daltonismo derivada de **Okabe–Ito** (pequena; começar nela e expandir), também gerida por contraste.

## Modo Fácil (deficiência motora)
- Gravidade **×2/3**; pulo **×8/7**; andar/escada/nado **×0.7** (ajuste fino depois).
- Hitbox de coleta **+4px** por lado, desenhada como **retângulo translúcido**.
- **Moedas rebaixadas ao chão** (só no Fácil; revertem ao desligar).
- **Sem perigos** (herda do antigo "Assistência", que vira "Fácil").
- **Pula-pula = quique fixo suave** (sem cadeia de carga); segurar = descer flutuando devagar.
- **Proteção de borda:** andar não derruba em fosso; só cai apertando **baixo**.
- **Controles enxutos:** **interagir = qualquer botão de pulo** (não só Espaço); Ctrl=especial; Shift=trocar poder; sem correr.

## Movimento por alternância (1 dedo / acesso sequencial)
- Tocar direção → anda **contínuo** naquele sentido (~1/3 da velocidade); segurar → ~2/3.
- **Pulo é momentâneo e NÃO interrompe a caminhada** (aperta pular perto do obstáculo, pula pra frente e segue andando).
- Acoplado ao **Fácil** (herda proteção de borda + gravidade menor + coyote-time → pulo de fosso tolerante). GAG-OK (sem exigir segurar+mover simultâneos). Sequencial multi-botão basta (não precisa varredura/scanning).

## Movimento reduzido (WCAG 2.3.3) + Pause/Stop/Hide (2.2.2)
- Reduced-motion **ligado por padrão** (respeita `prefers-reduced-motion`).
- 7 toggles: **parallax · fundo decorativo (nuvens/grama) · itens (moedas) · personagem em movimento · respiração · gracinhas · partículas/cintilação**.
  - **Personagem em movimento** congela TODA a locomoção num quadro único: andar/correr, escalar parede (ventosa), subir escada, nadar e pular.
  - **Respiração** e **gracinhas** são toggles separados (há quem se incomode com as gracinhas e queira mantê-las desligadas sem congelar a respiração).
- **1 botão mestre** (Pause/Stop/Hide) congela todos.
- Hoje agem: parallax, personagem em movimento, respiração/gracinhas. Decoração/itens/partículas ficam prontos e ligam quando a Cidade animar.

## Modo Áudio (Fase F) — spec detalhado
Botão de áudio **abre um menu** com **toggle + barra de volume** para cada grupo:
- **Música**
- **Sons ambiente:** água, conversas de rua, trânsito, folhas ao vento, chuva
- **Efeitos de interação com o ambiente:** passos por superfície (grama/piso/pedra/areia), portas (madeira/ferro), escada (madeira)/escalada em parede
- **Earcons** (sons simbólicos das ações: pulo, coleta de moeda, dano, etc.)
- **Outros efeitos sonoros**
- **TTS** (narração)
- **Sonar** (botão de interação + no menu) — varredura que anuncia a moeda/alvo mais próximo (direção + distância)
- **Guarda de beirada sonoro** (aviso ao chegar em fosso/borda)
- **Pista em laço / trilha de navegação / guia auditivo** (loop que orienta o caminho)
- Pistas espaciais: panorâmica L/R pela direção; tom/altura pela distância.
- **Som de perigo** (queda de fosso, lava) e **som de barreira/parede**.
- ⚠️ Validar com a **comunidade cega** (AudioGames.net, associações) antes de cravar detalhes.

## Já feito
- Som de **vitória 8-bit** (jingle + 4 fogos de artifício).
