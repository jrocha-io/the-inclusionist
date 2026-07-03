# The Inclusionist

Jogo educativo de plataforma **acessível-primeiro**, em PixiJS, feito para escolas públicas
brasileiras. Alfabetização (base psicogenética de Ferreiro & Teberosky) e matemática dentro de
um platformer que mira **WCAG 2.2 (AAA aspiracional) + Game Accessibility Guidelines (GAG)**:
alto contraste, simulação/correção de daltonismo, baixa visão, modo cego (navegação sonora),
narração TTS, modo cadeirante, um-botão, controles remapeáveis (teclado/gamepad/toque em mm reais),
Libras (VLibras) e tipografia para dislexia. Roda 100% offline como PWA.

Licença: **GPL-3.0-or-later**. Mecânicas de plataforma portadas do
[Clarity, de Adam Brooks (dissimulate)](https://github.com/dissimulate/Clarity) (MIT).

## Estrutura do repositório

```
app/            # o jogo (raiz publicável — é o que o Cloudflare Pages serve)
├─ index.html   #   página única
├─ js/          #   código (em modularização para ES Modules nativos — docs/plano-modularizacao.md)
├─ css/         #   estilos
├─ assets/      #   sprites e cenários (arte GPL-clean)
├─ vendor/      #   PixiJS (MIT) e fontes (SIL OFL)
├─ sw.js        #   service worker (offline/PWA)
└─ manifest.webmanifest
docs/           # ADRs, planos, pesquisas, registro de decisões (não é publicado)
tools/          # scripts de dev (não é publicado)
legacy/         # v3.1.100.html — protótipo histórico (não é publicado)
```

## Rodar localmente

Não há passo de build (ES Modules nativos servidos direto). Basta um servidor estático
apontando para `app/`:

```powershell
python -m http.server 8190 --directory app
# abra http://localhost:8190
```

> É preciso servir por HTTP (não abrir o `index.html` via `file://`), senão o service worker
> e os ES Modules não carregam.

## Deploy — Cloudflare Pages (plano gratuito)

Site estático, **sem build**. No painel do Cloudflare Pages, conecte este repositório do GitHub e:

| Configuração | Valor |
|---|---|
| Framework preset | **None** |
| Build command | *(vazio)* |
| Build output directory | **`app`** |
| Root directory | *(raiz do repo)* |

Cada push na `main` publica automaticamente; branches/PRs geram *preview deployments*. O cache é
controlado por `app/_headers` (sw.js/html sem cache; `vendor/` e `assets/` imutáveis), somado ao
bump do `CACHE` do service worker a cada versão. HTTPS e subdomínio `*.pages.dev` são gratuitos.

## Acessibilidade — o que o jogo demonstra

- **WCAG 2.2 (POUR)** e **GAG** como pilares inegociáveis (ver `docs/PILARES-INEGOCIAVEIS.md`).
- Operação 100% por teclado via `e.code` (ABNT/QWERTY/alternativos), gamepad e toque; remapeável.
- Visão: alto contraste, daltonismo (simulação Machado 2009 + correção), baixa visão, modo cego.
- Áudio como reforço, nunca requisito; narração TTS neural offline; legendas.
- Motora: cadeirante, um-botão, modo fácil, botões de toque dimensionados em milímetros reais.
- Surdez: Libras via VLibras (interino/online; motor próprio planejado).

## Status

Protótipo (MVP em construção). Ratificações pendentes: Lighthouse mobile, hardware-alvo real
(tablet/Chromebook de escola), auditoria automatizada (axe-core/Lighthouse/WAVE) e manual
(NVDA/JAWS/VoiceOver), e teste com crianças (incluindo NEE). **Não se alega conformidade
"completa" até o MVP validado.**

## Origem

Antecedido por um *tracer bullet* de 102 versões (v1.0.0 → v3.1.100) que ratificou empiricamente a
arquitetura acessível; o monólito final está preservado em `legacy/v3.1.100.html`. A v4 é a
reescrita sobre PixiJS.
