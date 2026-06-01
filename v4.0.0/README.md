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

## Limites desta build (propositais)
- Mundo **gerado** (representativo p/ teste de perf), não o `buildWorld()` final.
- **Sem** inversão de escuridão, temas, 2 jogadores, Libras, telemetria — entram depois.
- Aparência do personagem **fixa** (recolor/customização Mii-like = próxima fase).
