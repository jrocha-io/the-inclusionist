# Plano de Execução — fechamento do MVP (2026-07-02)

> Consolidação da auditoria de pendências + decisões do José (sessão 2026-07-02).
> Regras permanentes: commits atômicos em `main`, pt-BR, trailer Co-Authored-By; verificar via
> Claude_Preview antes de dizer "pronto". Hardware-alvo (Positivo/Chromebook) segue bloqueado até
> pós-aprovação; **teste com CONTROLE FÍSICO no PC de dev está LIBERADO** (o José está com o controle).

## Decisões desta rodada (registradas)

- **E5 (canvas separado por jogador): CANCELADO.**
- **Lava na Cidade: deixar como está** (decisão adiada permanece adiada).
- **Pilares/infra (LTI/xAPI, LAN, Tauri, i18n): adiados até terminar o MVP.**
- **Libras: zdog INVIÁVEL** (Libras exige expressões faciais; modelar isso em zdog não compensa).
  Nova direção: **Live2D Cubism** com personagem PRÓPRIO (samples oficiais Live2D não podem ser
  redistribuídos — licença Free Material). Estudo antes de codar.
- **Quiz ganha 5 níveis de dificuldade** (espec. do José, psicogênese da língua escrita):
  1. *Pré-silábico → silábico sem valor sonoro*: 3 PALAVRAS ESCRITAS (1 correta + 2 distratores
     malformados: longa demais, curta demais, letras repetidas…); o sistema SOLETRA (não lê) —
     objetivo: perceber o padrão da escrita.
  2. *Silábico s/ valor → c/ valor sonoro*: grade de sílabas; o sistema LÊ a sílaba sob o cursor
     (cego ou não) — objetivo: sílaba tem valor sonoro.
  3. *Silábico c/ valor → alfabético*: o sistema SOLETRA AS LETRAS da sílaba sob o cursor.
  4. *Alfabético → escritor*: grade de LETRAS; o sistema fala o NOME das letras.
  5. *Alfabético → escritor cego*: o sistema soletra a CELA BRAILLE de cada letra (treina a malha).
- **Paleta CB-safe**: NÃO recolorir o cenário (árvore continua cor de árvore para o daltônico);
  a paleta CB-safe vale para **HUD, menus, itens e elementos de jogo** (opção do jogador).

## Divisão de trabalho

**Tarefas do José (Aseprite)** — bloqueiam as minhas dependentes:
tileset profissional · riqueza dos parallax · paleta/luz/contorno unificados · árvores da Floresta
Brasileira · personagens (bases, silhueta feminina, teto/escada/parede, bengala como roupa) ·
20 ambientes (decisão e direção).
→ Minhas tarefas travadas por ele: conversão PNG→procedural; sistema de camadas (pele/cabelo/roupa).

**Tarefas minhas** — lotes abaixo, em ordem.

## Lotes (ordem de execução)

| # | Lote | Conteúdo | Critério de pronto |
|---|------|----------|--------------------|
| **L0** | **Registro de Decisões** (EXTRA, mais importante) | `docs/REGISTRO-DE-DECISOES.md`: toda decisão + estudo que a embasa (daltonização, botões mm, alto contraste, tipografia, GAG, WCAG 2.2 AA/AAA, compliance). Lacunas viram estudos agendados: **consolidar pesquisa dos botões mm em doc** (hoje só no chat), **políticas educacionais finlandesas/nórdicas**, **políticas educacionais chinesas**, **mapa GAG item-a-item**, **mapa WCAG critério-a-critério** | Registro navegável; cada decisão com fonte ou "estudo pendente" agendado |
| **L1** | **Controle físico + mapeamento** | Roteiro de teste p/ o José (JÁ — abaixo); assistente de mapeamento DirectInput (apertar → clicar na tela, por controle); botões do hub "Mapear gamepad/olhos/setores/fala" funcionais (gamepad real; olhos/fala apontam p/ L7); navegação de MENU por gamepad; ajustes do que o teste físico revelar (índices, deadzone, RB/RT) | José joga uma partida inteira só no controle, incluindo menus |
| **L2** | **Opções visuais rápidas** | Juice (poeira, brilho de coleta, squash&stretch, hit-stop, screenshake, shimmer, easing de câmera — **cada um com toggle no debug**); CRT scanlines + vinheta + cantos arredondados (CSS, desligáveis); slider Linear/Quadrático de brilho-contraste; cores dos itens por dono (opção por usuário); color-blocking com papéis/cores CUSTOMIZÁVEIS; paleta CB-safe p/ HUD/menus/itens | Cada efeito liga/desliga individualmente; screenshots |
| **L3** | **Quiz** | 5 níveis de dificuldade (espec. acima) + quiz POR JOGADOR no multiplayer (hoje só P1) | 2 jogadores fazem quizzes independentes; 5 níveis navegáveis por teclado e TTS |
| **L4** | **TTS neural (F5)** | Piper (primário pt-BR) + Kokoro + Kitten + eSpeak NG WASM embutido; Web Speech continua fallback; seleção de motor/voz + teste já existentes no menu | Narração neural funcionando offline-capaz no preview |
| **L5** | **Cidade viva** | Calçada/placas/lojas/letreiros/lâmpadas; adultos (parallax E plano do jogo); cachorros/gatos/pombos (pombos voam ao aproximar; no alto só gatos/pombos); carros em layer À FRENTE + semáforo funcional; chuva no ciclo garoa5s→chuva5s→garoa5s→bom45s (início aos 30s); água = caixa d'água com azulejos; interior de prédio acima da entrada; passagem secreta = construção abandonada. Lava fica | Cena confere com o plano-cenario-cidade.md |
| **L6** | **Temas v3** | Portar: Campo de dia, Campo de noite, Campo no fim da noite (Cemitério), Floresta — com peculiaridades vivas (plantas ao vento, borboletas, pássaros, neblina) | 4 temas selecionáveis com decoração viva |
| **L7** | **Webcam + Voz** | Subsistema C: MediaPipe tasks-vision — "webcam rosto" (blendshapes) e "webcam olhos" (8 setores, dwell configurável), calibração, remapeável, exige WebGL/WebGPU; Subsistema D: comando de voz (palavras→ações; sim/não nos menus) | Ícones 🧑👀👄 deixam de ser "em construção" |
| **L8** | **Refinos + estudos** | Cadeirante: auditar plano mellow-questing-riddle (maioria FEITA: rampSurfaceY, faixa amarela, wcFreeze, elevadores A–E) → fazer o que faltar + elevador largo×fino distinção + polish da cadeira + auditoria de percurso completável; pose de vitória (integrar se a arte existir); chiptunes (estudo MIDI×procedural + implementar o possível); estudo protan×deutan (o que dá pra fazer além de luminância); estudo Live2D Cubism p/ Libras | Cada item entregue ou com estudo/lista de opções |
| **L9** | **Auditoria final WCAG/GAG (R5)** | Auditoria completa pós-tudo (axe/Lighthouse + manual GAG + gates ADR-001), com relatório honesto AA×AAA | Relatório em docs/ |

## Roteiro de teste do controle físico (tarefa do José, JÁ)

Com o servidor em `http://localhost:8190/?debug=true`:
1. Console do navegador (F12): `navigator.getGamepads()` após apertar qualquer botão — **anotar o
   `id`** do controle e se `mapping` diz `"standard"` ou vazio.
2. Iniciar 1 jogador no teclado → apertar **START (ou botão 0)** no controle → deve abrir a 2ª tela
   com o controle jogando.
3. Testar e anotar o que cada botão FÍSICO faz: mover (analógico e D-pad), pular, correr, trocar
   poder, especial. Anotar divergências (ex.: pulo caiu no botão errado).
4. "Sair do jogo" na tela do controle → apertar START/0 → deve recomeçar aquela tela.
5. Reportar: id do controle, mapping, divergências, sensação do deadzone (anda sozinho? duro?).
