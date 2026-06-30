# Plano de Acessibilidade — The Inclusionist (v4)

Decisões fechadas com o José. Implementação em fases (A→B→C→E→F).

## Estratégia de cor (revisada com o José)
**Grupos por importância** (não por luminância): **G1** personagem/HUD/itens/NPC especial · **G2** plataforma/chão onde piso/escada/porta/secundário · **G3** fundo.
**Conformidade WCAG 2.2 AA via CONTORNO** (preserva a arte, não repinta): contorno **G1↔fundo 7:1**, **G2↔fundo 4.5:1**, condução de caminho **3:1**, **texto↔fundo 7:1** (HUD no DOM). Contorno **bicolor** (claro+escuro) → visível sobre qualquer fundo. As 4 variações de repintura dark foram **removidas** (repintar não é exigência WCAG); as 13 paletas + motor de matiz ficam para os modos de cor abaixo.

## Modos de cor (menu)
1. **Normal** — arte crua.
2. **Normal AA · Bordas** — ✅ feito: adiciona contornos de contraste (G1 grosso, G2 fino) em player/itens/power-ups/porta e nas bordas das plataformas. Arte e fundo intactos.
3. **Normal AA · Cores** — (a fazer) deslocamento **leve**: fundo + escuro/lavado, G1/G2 + vivos.
4. **Simular daltonismo** — ✅ feito: 3 filtros **`feColorMatrix`** (Protanopia/Deuteranopia/Tritanopia) aplicados na própria `<canvas>` via `filter:url(#…)`. Preserva a arte (transformação linear na GPU), não posteriza. **Auditoria + demo a stakeholders.** ⚠️ É **simulação** (mostra como o daltônico vê), não **correção**: o que ajuda o jogador de fato é **daltonização** (a fazer, se desejado).
   - (Tentativa anterior de "CB-safe" por recolor a 20 cores Okabe–Ito foi descartada: posterizava a arte.)
5. **Pessoa cega** = **tela apagada + pistas sonoras** (Fase F) — para enxergantes sentirem como é jogar cego.

**Papéis das paletas (José):** P1 luz direta · P2 muito claras · P3 claras · P4–P5 lavadas · P6 vivas/saturadas · P7 quentes vivas + apagadas · P8 azul/rosa/vermelho vivos + resto apagado · P9–P10 escuras · P11–P13 bem escuras. Uso: contorno claro de P1/P2 (sobre fundo escuro) ou escuro de P12/P13 (sobre claro); interiores vivos de P6; fundo lavado de P4/P5. Grupos-base para o modo Cores: **P1×P6×P11**, **P2×P7×P12**, **P3×P8×P13** (adjacentes ~3:1).

## Modo Fácil (deficiência motora)
- Gravidade **×2/3**; pulo **×8/7**; andar/escada/nado **×0.7** (ajuste fino depois).
- Hitbox de coleta **+4px** por lado, desenhada como **retângulo translúcido**.
- **Moedas rebaixadas ao chão** (só no Fácil; revertem ao desligar).
- **Sem perigos** (herda do antigo "Assistência", que vira "Fácil").
- **Pula-pula = quique fixo suave** (sem cadeia de carga); segurar = descer flutuando devagar.
- **Proteção de borda:** andar não derruba em fosso; só cai apertando **baixo**.
- **Controles enxutos:** **interagir = qualquer botão de pulo** (não só Espaço); Ctrl=especial; Shift=trocar poder; sem correr.

## Movimento por alternância (1 dedo / acesso sequencial) — ✅ FEITO (toggle no painel Movimento)
- Tocar direção → anda **contínuo** naquele sentido (~1/3 da velocidade); segurar → ~2/3.
- **Pulo é momentâneo e NÃO interrompe a caminhada** (aperta pular perto do obstáculo, pula pra frente e segue andando).
- Acoplado ao **Fácil** (herda proteção de borda + gravidade menor + coyote-time → pulo de fosso tolerante). GAG-OK (sem exigir segurar+mover simultâneos). Sequencial multi-botão basta (não precisa varredura/scanning).

## Animação reduzida (WCAG 2.3.3) + Pause/Stop/Hide (2.2.2)
> Terminologia: **Movimento** = como o jogador anda (GAG, alternância). **Animação** = movimento na tela (WCAG, redução). Painel "Mov./Anim." separa as duas seções.
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
