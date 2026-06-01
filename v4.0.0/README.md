# The Inclusionist · v4.0.0 (esqueleto PixiJS)

Reescrita do motor em **PixiJS** (decisão do José), modo **validação-primeiro**: prova render
PixiJS + física autêntica (TUNE portado do v3.1.100) + modo **Lúdico** (colete 10 moedas), e
**mede FPS** para validar no hardware-alvo (tablets Positivo, Chromebook). Texto/UI no **DOM**
(acessibilidade AAA). **PWA** offline. Single-player.

## Rodar
```bash
cd v4.0.0
python -m http.server 8132
# abrir http://127.0.0.1:8132/   (precisa de HTTP p/ service worker; file:// não registra PWA)
```

## O que validar nos tablets
1. Abrir no **Chrome do Chromebook** e no **tablet Positivo**.
2. Mover/pular/coletar e **ler o FPS** no topo (atual + mínimo). Meta: **≥ 60** (ou ≥ 30 estável).
3. **Instalar como PWA** (menu → instalar) e abrir **offline** (modo avião) — deve rodar.
4. Anotar: modelo do aparelho, navegador/WebView, FPS médio/mínimo, se WebGL ativou
   (`window.__incl.app.renderer.type` — 1=WebGL, 2=Canvas).

## Stack / licença
- **Renderer:** PixiJS v7 (vendorizado em `vendor/`; WebGL com fallback Canvas → compat. WebView antigo).
- **Empacotamento:** PWA (Tauri/Tauri Mobile = pós-MVP).
- **Código:** **GPL-3.0-or-later** (ver `../LICENSE`). **Arte:** não-FOSS (ver pilares).

## ⚠️ Dev gotcha — service worker cacheia (cache-first)
O SW serve os assets do cache (offline). Ao **editar** `game.js`/`style.css` e recarregar, você
pode ver a **versão antiga**. Soluções: (a) **bumpar `CACHE`** em `sw.js` a cada versão (o
`activate` apaga caches antigos automaticamente — já implementado); (b) em dev, DevTools →
Application → Service Workers → *Update on reload* / *Unregister* + *Clear storage*.

## Libras
**Interino:** widget **VLibras** (gov.br) embutido (online, carregado sob demanda). Traduz o
texto do DOM (HUD, instruções, quizzes) para Libras. **Offline** o widget não carrega e o jogo
segue normal.
**Layout:** o jogo escala em **múltiplos inteiros de 320×180** e fica **centralizado** (H e V).
Ao abrir o VLibras, reserva-se espaço à direita: o jogo desloca à esquerda e o intérprete fica
**ao lado, sem cobrir** o jogo. **Limite honesto:** o encaixe *pixel-exato* 16:9+5:9 (21:9) é
difícil com o widget de terceiros (ele resiste a reposicionar); a versão exata virá no **motor
próprio em zdog** (painel 420×180, P2/P5).

## O que já tem (E1–E11)
Mundo Clarity portado · iluminação de área secreta · prompts de início · perigos/susto/respawn ·
decoração de fundo · minimapa Metroid · modos **Soma-Sub** e **Sílabas** (maiúsc/minúsc) ·
modo **Braille** (ditado de cela) · **áudio + legendas (C1) + assistência (C2)** · **remap de
controles + persistência (B2)** · **multiplayer 1–4 telas lado a lado** (render-to-texture,
física por jogador) · **VLibras** interino.

### Multiplayer (E11)
Uma única página, **N viewports 320×180** independentes (render-to-texture), simulação
compartilhada — todos se veem no mesmo mundo (corrida pelas moedas). Layout: 1 tela 320×180 ·
2 telas 640×180 (lado a lado) · 3–4 telas 640×360 (grade 2×2). Keysets sem conflito —
**P1** WASD+Espaço, **P2** setas+Enter, **P3** FTGH+R, **P4** IJKL+U. MP só no **Lúdico**.

### Power-ups + chave/portão (E12)
Itens-bônus (não obrigatórios p/ vencer): 🟢 **super-corrida** (correr = `hTurbo`), 🔵 **ultra-pulo**
(`ultraJumpVel`) e 🔑 **chave** que abre o 🚪 **portão** (barreira sólida dinâmica). Power-ups são
**por jogador** (cada um pega o seu em MP); o portão é **compartilhado**. Feedback por som+legenda
(E9) e narração para leitor de tela. Resetam a cada rodada.

### Toque mobile + auditoria (E13)
**Controles de toque** (D-pad + correr/pular, alvos 56px ≥ AAA 2.5.5) que aparecem só em telas de
toque e não cobrem o centro. **Auditoria axe-core: 0 violações WCAG A/AA** no nosso app — ver
[`AUDITORIA-E13.md`](AUDITORIA-E13.md) (inclui o status dos 5 gates do ADR-001; gates de hardware
real / leitores de tela / crianças são `[JOSE]`).

## Limites desta build (propositais)
- Mundo **gerado** (representativo p/ teste de perf), não o `buildWorld()` final.
- **Sem** temas múltiplos, telemetria — entram depois. Selo "AAA + GAG complete" só após os 5 gates.
- Aparência do personagem **fixa** (recolor/customização Mii-like = próxima fase); em MP, distinção por **tint** por jogador.
- VLibras: encaixe pixel-exato adiado ao motor zdog (ver acima).
