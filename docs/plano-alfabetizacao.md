# Plano — Redesenho pedagógico da Alfabetização (Ferreiro & Teberosky)

Pedido do José em 2026-07-04. Grande; executar em ETAPAS. Base psicogenética (Emília Ferreiro & Ana Teberosky).

## Decisões travadas (José)
- **Fonema** (jogo Grafema e fonema): **eSpeak em modo fonema** (emite /b/, /a/… reais; eSpeak já está no projeto).
- **VLibras** (modo surdo): **VIÁVEL** (pesquisa feita, código-fonte LGPLv3 dos repos `spbgovbr-vlibras/vlibras-web-browsers` e `vlibras-player-webjs`). NÃO é iframe — é Unity/canvas na PRÓPRIA origem, controle total por JS/CSS:
  - Gesticular sob demanda: `window.plugin.translate('gato')` (mesmo método da caixa "digitar" do widget). `window.plugin` só existe após abrir o painel 1×: `document.querySelector('[vw-access-button]').click()`.
  - Saber quando o sinal acabou: `window.plugin.player.on('gloss:end', cb)`. Outros: `stop/pause/repeat/setSpeed/changeAvatar`.
  - Entrada/saída animada: aplicar CSS no `document.querySelector('[vw]')` — ex.: `transform:translateX(120%);opacity:0` p/ sair pela direita. Fechar oficial: `dispatchEvent(new CustomEvent('vp-widget-close'))`; reposicionar: `'vp-widget-wrapper-set-side'` detail `'R'`.
  - **RESSALVA:** a tradução é REMOTA (`traducao2-dth`/`dicionario2-dth.vlibras.gov.br`) → NÃO funciona offline. Conflita com o pilar offline; no offline, cair no TTS/legenda. Self-host dos repos é possível mas a tradução PT→glosa é o ponto difícil de internalizar.
- **Fala sempre-ativa**: SIM. `gameSay()` fala as falas pedagógicas essenciais mesmo com o toggle 'Narração (TTS)' desligado, via voz nativa do navegador (fora do mixer). ✅ feito.

## Nova estrutura (6 jogos, nesta ordem)
| # | id | Jogo | Essência | Rodapé |
|---|---|---|---|---|
| 1 | alf1 | Descobrindo palavras | escolher a palavra certa (pré-silábico); distratores Ferreiro | "Elaborado para ajudar a superar as hipóteses pré-silábicas." |
| 2 | alf2 | Descobrindo sílabas | montar; **hover fala a sílaba + selecionar confirma e refala** | "…hipótese silábica sem/com valor sonoro…" |
| 3 | alf3 | Montando palavras | montar (SEM os sons de hover/select — é a diferença p/ o 2) | "…hipótese silábico-alfabética…" |
| 4 | **novo** | Grafema e fonema | ouve **fonema** (eSpeak), escolhe a letra; hover diz o NOME da letra | "…hipótese alfabética… associar grafema e fonema." |
| 5 | **novo** | Malha de Braille | ouve a **letra**; acha entre 8; **hover diz os PONTOS** da cela (A→"um") | (definir) |
| 6 | alf4 | Escrevendo palavras | escrever letra a letra; TTS diz as letras **só se ligado** | "Atividade com o objetivo de treinar ortografia." |

(O antigo alf5 "Escrevendo em Braille" some/vira o jogo 5 "Malha de Braille" — recognição, não escrita.)

## Comportamentos compartilhados (jogos 1–3)
- Ao abrir: fala a palavra (ou VLibras gesticula) **independente do TTS**. ✅ (openPre/openSilabas com `gameSay`)
- Poder **selecionar a palavra no topo** e apertar pulo p/ repetir a fala (ou VLibras).
- **Especial = apagar** a última sílaba/letra (exceto no jogo 1).
- Ao acertar: **som suave de vitória + refala a palavra + PAUSA → próxima palavra** (fala/gesticula a próxima).

## Etapas de execução
1. **Fundação (feita, v4.152.0):** `gameSay` sempre-ativa; rodapés 1/2/3/6 com os textos do José; fala da palavra ao abrir (jogos 1–3).
2. **Distratores Ferreiro** (jogo 1 Descobrindo palavras): a correta escrita normal; as erradas com (a) símbolo/emoji (refuta ícone), (b) 4-8 letras repetidas (falta de variedade), (c) emoji no meio, (d) 1 letra/sílaba ou menos, OU 4+ letras/sílaba (refuta tamanho=objeto). Substituir `malform()`.
3. **Sons de hover/select** (jogo 2 Descobrindo sílabas): hover→`gameSay(sílaba)`; select→som de confirmação + `gameSay(sílaba)`. Jogo 3 (Montando) NÃO tem esses sons.
4. **Especial=apagar** (jogos 2/3/6, não no 1) + **acerto: som suave + refala + pausa + próxima**.
5. **Selecionar a palavra do topo p/ repetir** (jogos 1–3).
6. **Grafema e fonema** (novo, jogo 4): eSpeak fonema; grade de letras; hover diz nome da letra.
7. **Malha de Braille** (novo, jogo 5): diz a letra; 8 letras; hover soletra os pontos da cela (`BRAILLE` map → "um", "um dois"…).
8. **Escrevendo palavras** (jogo 6): letras faladas só com TTS ligado (usa `narrate`, gated).
9. **VLibras** (modo surdo): conforme o veredito da pesquisa — gesticular a palavra ao abrir + ao tocar a palavra do topo; entrada/saída deslizando.
