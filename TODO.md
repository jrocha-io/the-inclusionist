---
title: TODO compartilhado — The Inclusionist (demo)
type: shared-task-list
status: active
created: 2026-05-23
updated: 2026-05-23
authors: [José, Claude]
---

# TODO · The Inclusionist (demo)

> Lista compartilhada de ações pendentes do demo (tracer ratificador do EdSP). Cada item começa com **`[JOSE]`**, **`[CLAUDE]`** ou **`[JOSE+CLAUDE]`** indicando quem executa. Marcar `[x]` ao concluir, mover para §Feito com data.

**Convenções:**

- 🔥 Crítico — bloqueador de uso real em sala
- 🎯 Próximo — próximo trabalho substantivo
- 💤 Backlog — pausado ou de baixa prioridade
- `[JOSE]` — só José pode (acesso a hardware, escolas, screen readers locais, sua interpretação)
- `[CLAUDE]` — Claude faz, José só aprova/aplica
- `[JOSE+CLAUDE]` — iterativo, Claude prepara patch, José valida no fluxo (tsc + sim + node-canvas + jsdom)

---

## 🔥 Crítico (bloqueador)

- [ ] **[JOSE+CLAUDE] B2 — persistir remap de controle via localStorage**
  - **Por que crítico:** UI funciona mas remap perde a cada reload. Crianças com NEE motor que usam mapping adaptado precisam reconfigurar a cada sessão. Em sala com tablets compartilhados, é proibitivo.
  - **Patch sugerido:** ver [[../../Documentation/audit-2026-05-23-r0-bugs-a11y#b2-—-remap-de-controle-·-falha-real|auditoria B2]] — `loadControls()` no init + `saveControls()` após cada remap + try/catch (Chromebook pode ter Storage desabilitado) + chave versionada `inclusionist.controls.v1` + limpeza no botão "Restaurar padrão".
  - **Versão alvo:** v3.1.101
  - **Critério de pronto:** remap persiste após F5; restaurar padrão limpa localStorage; try/catch silencia falha em Storage desabilitado.
  - **Estimativa:** ~30 min código (Claude) + ~10 min validação (José).

---

## 🎯 Próximo (em ordem sugerida)

- [ ] **[JOSE+CLAUDE] R3 — Caminho B: evoluir ASCII paramétrico**
  - **Decisão tomada (2026-05-23):** caminho B, tamanho 16×32 ("Mario"), arte Nanobanana preservada para outro uso (não vai pro jogo).
  - **Subtarefas (uma por versão):**
    - [ ] **[CLAUDE] R3.1** — refinar os 4 frames ASCII atuais com mais detalhe/sombreamento, mantendo 16×32 e ASCII map. Mostra render node-canvas pro José aprovar antes de embed.
    - [ ] **[CLAUDE] R3.2** — expandir paleta com camadas opcionais: olhos (formato, cor), boca (sorriso, neutra, surpresa), sobrancelha.
    - [ ] **[CLAUDE] R3.3** — biblioteca de penteados via overlay: ondulado, afro, trança, careca, etc.
    - [ ] **[CLAUDE] R3.4** — biblioteca de acessórios: óculos (3-4 modelos), boné, chapéu, brinco, fone, capa.
    - [ ] **[CLAUDE] R3.5** — biblioteca de roupas: padrões (listrado, xadrez, liso), variações de gola, manga.
    - [ ] **[JOSE+CLAUDE] R3.6** — UI de customização (telas de criação de personagem) — opt-in, fica em menu. José define UX, Claude implementa.
    - [ ] **[CLAUDE] R3.7** — persistir aparência escolhida em localStorage (chave `inclusionist.appearance.v1`).
  - **Cuidado:** uma mudança coesa por versão (não fazer todas as 7 de uma vez).
  - **Versão alvo:** v3.2.x série (1 patch por subtarefa).

- [ ] **[JOSE] Lighthouse Performance ≥ 90 em emulação Tablet Positivo**
  - Rodar Lighthouse mobile + 3G + CPU 4× throttling contra v3.1.100. Documentar score e iterar se necessário.
  - **Ratifica:** ADR-001 §validation item 1.

- [ ] **[JOSE] Acessar Tablet Positivo + Chromebook reais e testar v3.1.100**
  - Abrir o jogo em hardware real, validar performance e a11y (NVDA não disponível em Chromebook — usar ChromeVox).
  - **Ratifica:** ADR-001 §validation item 2.

- [ ] **[CLAUDE] Auditoria automatizada axe-core + Lighthouse + WAVE**
  - Rodar axe-core via Playwright contra v3.1.100, capturar violações, listar.
  - **Critério de pronto:** zero violações axe + Lighthouse a11y ≥ 95 + WAVE 0 errors.

- [ ] **[JOSE] Auditoria manual NVDA + JAWS + VoiceOver desktop + VoiceOver iOS**
  - Jogar v3.1.100 só por screen reader (sem olhar a tela). Documentar pontos de fricção.

- [ ] **[JOSE] Testar com 5 crianças incluindo 1 com NEE relevante**
  - Mom Test pós-teste. Observar sem dirigir. Anotar quais minigames engajam mais.
  - **Ratifica:** ADR-001 §validation item 5 (último para `fully_ratified`).

- [ ] **[JOSE] VLibras — diagnosticar toast que aparece**
  - Abrir o site hospedado e reportar qual toast/erro aparece quando VLibras é ativado.

- [ ] **[CLAUDE] Painel `?debug` — cravar valores TUNE como padrão**
  - Depois que José confirmar valores finais do TUNE, atualizar `buildDebugPanel()` para usar esses valores como default. Valores atuais já são os afinados pelo José (CLAUDE.md §4 TUNE).

---

## 💤 Backlog / pausado

- [ ] **[CLAUDE] R2 — Tema Caverna**
  - 1 versão por tema. Gradiente + decoração-assinatura (estalactites? cogumelos bioluminescentes?) + inversão genérica.

- [ ] **[CLAUDE] R2 — Tema Deserto**
  - Gradiente areia + decoração (cactos, ossos, dunas) + inversão.

- [ ] **[CLAUDE] R2 — Tema Fábrica/Esgoto**
  - Industrial. Gradiente cinza-amarelo + decoração (tubos, vapor) + inversão.

- [ ] **[CLAUDE] R2 — Tema Castelo**
  - Genérico (não Disney). Pedra + tochas + bandeiras + inversão.

- [ ] **[CLAUDE] R4 — A1: navegação de menu por controle**
  - GAG. Suportar gamepad para navegar menus (D-pad + A/B). Não confundir com teclado (B1, já fechado).

- [ ] **[CLAUDE] R4 — C1: legendas de SFX via `aria-live`**
  - Cada efeito sonoro tem legenda visual + screen reader: "Você coletou uma chave", "Plataforma cai", "Inimigo derrotado".

- [ ] **[CLAUDE] R4 — C2: modo assistência**
  - Pulo automático, velocidade reduzida, invencibilidade opcional, timer infinito, dicas explícitas. Liga/desliga em Opções.

- [ ] **[JOSE+CLAUDE] R4 — Botões de toque na tela (mobile)**
  - D-pad virtual + botões A/B na tela quando detectar touch. Não cobrir o gameplay. José valida ergonomia em tablet real.

- [ ] **[JOSE+CLAUDE] R5 — Auditoria final WCAG 2.2 + GAG completo + revisão sênior**
  - Quando R0–R4 estiverem fechados. Documento final consolidado.

- [ ] **[JOSE] Árvores da Floresta Brasileira — decisões pendentes**
  - **(a)** Ajustes de arte por espécie? (catálogo já renderizado em `assets/catalogo-arvores-floresta-v1.png`)
  - **(b)** Alturas literais (troncos no chão, copas altas) OU "copas visíveis no chão" (reduzir alturas proporcionalmente)?

- [ ] **[CLAUDE] Árvores da Floresta Brasileira — integração** (depende do item acima)
  - Quando José responder: Claude integra no tema `floresta`, renomeia para "Floresta Brasileira", desenha em `drawFloraBack` (sobre o ar, atrás do player). Posicionamento pré-computado (colunas com sólido abaixo).
  - **Catálogo:** Grupo 1 (Cerejeira, Jacarandá, Salgueiro, Sumaúma); Grupo 2 (Canafístula, Araucária, Castanheira, Ipê, Quaresmeira, Pau-Ferro, Aroeira, Peroba, Guapuruvu).

- [ ] **[CLAUDE] Caverna enriquecida (opcional)**
  - Vigas de madeira (escoramento de mina), cristais maiores, brilho de lanterna no player.

- [ ] **[CLAUDE] ADR-002 — toast VLibras causa-raiz** (depende do JOSE diagnosticar acima)
  - Após José reportar, Claude investiga e propõe correção. Atualizar §validation da ADR-002.

---

## ✅ Feito recentemente

- [x] **2026-05-23 [JOSE] Decisão R3: caminho B (ASCII paramétrico)** — escolha registrada em CLAUDE.md §6 e Roadmap.md.
- [x] **2026-05-23 [CLAUDE] Auditoria R0 completa** — B1 ✅, B2 ❌ (vira crítico), C3 ✅. Relatório em [[../../Documentation/audit-2026-05-23-r0-bugs-a11y]].
- [x] **2026-05-23 [CLAUDE] Taxonomia A/B/C formalizada** — [[../../Documentation/a11y-task-codes]].
- [x] **2026-05-23 [CLAUDE] ADR-002 (VLibras) + ADR-003 (sprites como dados)**.
- [x] **2026-05-23 [CLAUDE] CLAUDE.md do produto EdSP criado** — [[../../CLAUDE.md]] + `.claude/rules/` + `.claude/skills/apply-principles/`.
- [x] **2026-05-23 [CLAUDE] Repo git do tracer empacotado** — 103 commits + 7 tags em `outputs/the-inclusionist-tracer.tar.gz`.
- [x] **2026-05-23 [JOSE] Decisão tamanho dos personagens: 16×32 ("Mario")**.

---

## Convenções deste TODO

- **Atualizar a cada sessão** — quem trabalha (José ou Claude) marca progresso.
- **Items em §Crítico têm prioridade absoluta** — não começar R3 antes de B2 fechado.
- **Items `[JOSE]` não dependem do Claude** — Claude não pode fazer (acesso a hardware, escolas, screen readers locais, sua interpretação).
- **Items `[CLAUDE]` podem ser feitos sem o José** — Claude prepara, José só aprova/aplica.
- **Items `[JOSE+CLAUDE]` são iterativos** — Claude prepara patch, José valida, ciclo curto.
- Versões do jogo seguem SemVer (CLAUDE.md §2). Cada item fechado normalmente bumpa MINOR ou PATCH.
