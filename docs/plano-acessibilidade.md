# Plano de Acessibilidade — The Inclusionist (v4)

Decisões fechadas com o José. Implementação em fases (A→B→C→E→F).

## Modos de visualização (4)
1. **Normal**
2. **CB-safe** (Okabe–Ito, daltonismo)
3. **Alto contraste** (WCAG): 3 grupos discerníveis — **player · itens de interação (moeda, escada, porta, NPC) · fundo** — com **≥7:1 entre grupos** (excede o 1.4.11/3:1 de gráfico; é melhoria pró-baixa-visão). HUD: **7:1 contra o próprio fundo** (1.4.6 AAA de texto). Fundo↔decoração animada: ~3:1 (baixo de propósito). Paleta melhor virá de estudo do José; aplicar a melhor encontrada por ora.
4. **Pessoa cega** = **tela apagada + pistas sonoras** (para jogadores enxergarem como é jogar cego). Áudio é ortogonal: liga as pistas; a tela apaga neste modo.

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
- 6 toggles: **parallax · fundo decorativo (nuvens/grama) · itens (moedas) · personagem em movimento · respiração/gracinhas · partículas/cintilação**.
  - **Personagem em movimento** congela TODA a locomoção num quadro único: andar/correr, escalar parede (ventosa), subir escada, nadar e pular.
  - **Respiração/gracinhas** congela o idle (sem respiração nem as animações de descanso).
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
