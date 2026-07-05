# Fase F — Áudio / Sonoplastia (estratégia)

Documento de estratégia **antes de codar** (pedido do José). Torna o **modo tela apagada** (cegueira) *jogável* por som e melhora a experiência para todos. Offline (PWA, hardware de escola pública), **GPL-clean** e sem depender de arquivos grandes.

## 0. Princípios
- **Síntese procedural (WebAudio)** como base: earcons, passos, ambiente e pistas são gerados por osciladores/ruído filtrado → **KB, não MB**, offline, sem IP de terceiros (GPL-clean). Amostras reais só entram depois **se** houver licença livre.
- **TTS** via **Web Speech API** (`speechSynthesis`) — nativo do navegador, offline no Chrome/Edge para vozes instaladas; degrada com elegância se ausente.
- **Não substitui as legendas** (1.4 / GAG): legendas continuam; o áudio é canal paralelo. Nada depende **só** de som.
- **Aproveita o que existe:** já há um **nó mestre** (`_masterGain`, criado na perda auditiva) e uma tabela de earcons (`SFX`). O barramento de áudio pendura no mestre.
- ⚠️ **Validar com a comunidade cega** (AudioGames.net, associações, Base do jogo *A Blind Legend* / *The Vale* como referência) antes de cravar timbres e a curva do sonar.

## 1. Arquitetura do barramento (WebAudio)
```
osc/ruído de cada som → gainCategoria[cat] → panner(StereoPanner) → _masterGain → [perda auditiva?] → destino
```
- **Um gain por CATEGORIA** (abaixo). O menu de áudio controla **toggle + volume** de cada uma (WCAG **1.4.2 Audio Control**).
- **Espacialização:** `StereoPannerNode` (esquerda/direita pela posição relativa do alvo) + **atenuação por distância** (volume) + **tom/andamento pela distância** (mais perto = mais agudo/rápido). Implementa o pedido "só escuta elementos muito próximos" (corte por distância) — o mesmo eixo usado na simulação de perda auditiva.
- Persistência dos volumes por `localStorage`.

## 2. Categorias (cada uma: toggle + barra de volume)
| Categoria | Conteúdo | Síntese |
|---|---|---|
| **Música** | trilha de fundo | melodia 8-bit em loop (osciladores) |
| **Ambiente** | água, conversas de rua, trânsito, folhas ao vento, chuva | camadas de ruído filtrado em loop, posicionais (água = perto da caixa d'água; chuva segue o ciclo do cenário Cidade) |
| **Interação c/ ambiente** | passos por superfície (**grama/piso/pedra/areia**), portas (**madeira/ferro**), escada (**madeira**)/**escalada em parede** | ruído filtrado + envelope curto; timbre por material |
| **Earcons** | pulo, coleta de moeda, dano, poder, portão, vitória | migra a tabela `SFX` atual |
| **Outros efeitos** | sustos, respingos, etc. | — |
| **TTS** | narração (moedas restantes, evento, tutorial) | `speechSynthesis`, pt-BR |
| **Sonar** | botão de interação + no menu | varredura que anuncia a **moeda/alvo mais próximo**: direção (pan) + distância (tom) |
| **Guarda de beirada** | aviso ao chegar em fosso/borda | tom de alerta pulsado, intensifica ao aproximar |
| **Pista em laço / guia** | trilha de navegação | tom suave em loop que orienta o caminho/objetivo (pan+tom pela direção) |
| **Perigo / barreira** | queda de fosso, lava; parede/bloqueio | earcon grave (perigo) / "toc" abafado (barreira) |

## 3. Modelo de sonoplastia espacial (o "jogar às cegas")
- Cada objeto de interesse (moeda, porta, escada, borda, parede, perigo) emite **eventos** que o motor de áudio traduz:
  - **Direção** → `pan` (−1 esquerda … +1 direita) pela diferença de x objeto↔jogador.
  - **Distância** → volume (queda com a distância; corte além de ~N tiles = "só o que está perto") e **tom** (perto = agudo).
  - **Altura (y)** → pequeno viés de timbre (mais grave abaixo, mais agudo acima).
- **Guarda de beirada:** varredura à frente do jogador; se o próximo tile no sentido do movimento é vazio (fosso), toca alerta crescente. Casa com a proteção de borda do Fácil/alternância.
- **Sonar (botão):** aperta → varre os alvos num arco à frente e "pinga" o mais próximo (pan+tom). Também disponível no menu.
- **Pista em laço:** loop contínuo que aponta o caminho recomendado (próxima moeda/porta), para o jogador seguir a direção do som.

## 4. Integração com o modo tela apagada (cegueira)
- No `viz='blind'`, ligar um **preset "jogo em áudio"** (todas as pistas espaciais + guarda de beirada + sonar + pista em laço ON) automaticamente, já que a tela é preta.
- Fora do blind, tudo é opcional (bom para baixa visão, TDAH, alfabetização — e para todos).

## 5. Etapas de implementação (incrementais, cada uma testável)
- **F1 — Barramento + menu de áudio + earcons.** Gain por categoria, menu (toggle+volume), migra `SFX` para earcons. Base de tudo.
- **F2 — Passos por superfície + portas/escada.** Detecção do material sob o pé; timbre por material.
- **F3 — Espacialização + sonar + guarda de beirada.** Pan/distância; sonar no botão; alerta de fosso.
- **F4 — Ambiente + pista em laço.** Camadas de ambiente posicionais; guia auditivo.
- **F5 — TTS.** Narração de eventos e menu.
- (F6 — amostras reais licenciadas, se e quando houver.)

## 6. Conformidade
- **WCAG:** 1.4.2 (controle de áudio) ✓ via menu; 1.2.x (mídia) — legendas já existem; 1.4.7 (áudio de fundo baixo) — ambiente sempre abaixo dos earcons; oferecer **volume por categoria** cobre "sem áudio de fundo".
- **GAG:** pistas sonoras redundantes com o visual (nunca só cor/só som); volumes independentes; opção **mono** (acessibilidade a surdez unilateral) a avaliar.

## 7. Decisões (fechadas com o José)
1. ✅ **Síntese procedural agora** (GPL-clean, KB, offline). Amostras licenciadas só depois, se houver.
2. ✅ **TTS = neural, não robótico** (vozes robóticas causam fadiga auditiva/cognitiva → **fora** `speechSynthesis`/eSpeak NG).
   - **Primária: Piper TTS** (qualidade + rapidez em tablets Positivo do governo). **Secundária: Kitten TTS** (rápida, low-cost). **Opção: Kokoro-82M** (qualidade superior, lenta — para jogos sem exigência de rapidez; nunca a primária).
   - **Implicação:** TTS roda **no navegador** (ONNX Runtime Web/WASM + modelo em **MB**) → **carregado sob demanda** (lazy), não embarcado no bundle base. Pesa no hardware-alvo → fica na **etapa F5** (última) e é opcional.
   - **TTS e Legendas são toggles SEPARADOS e independentes** (não há fallback de um para o outro; cada um liga por conta própria).
3. ✅ **Blind liga o preset "jogo em áudio" automaticamente** (todas as pistas espaciais + sonar + guarda-de-beirada + guia).
4. ✅ **Sonar = segurar "trocar poder"** (hold; o tap curto ainda troca o poder) **ou** o acorde **troca + especial** juntos (para quem prefere rapidez). Evita disparar ação indesejada (lançar objeto / interagir com porta/pessoa/interruptor). Exige detectar *hold vs tap* no swap.
5. Modo "jogo em áudio" = o próprio **blind** (tela preta) com o preset ligado; fora do blind as pistas são opcionais (baixa visão/TDAH/todos).
6. **Ordem:** F1 (barramento + menu + earcons) → F2 → F3 → F4 → **F5 (TTS neural, lazy)**.
