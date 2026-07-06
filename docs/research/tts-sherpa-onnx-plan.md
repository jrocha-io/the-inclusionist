<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
# Neural TTS on sherpa-onnx-wasm — integration plan (ADR-0022)

Runtime decided in **[ADR-0022](../2-Architecture/adr/ADR-0022-tts-sherpa-onnx-wasm-runtime.yaml)**: run VITS/Piper
`.onnx` in the browser via **sherpa-onnx compiled to WebAssembly** (k2-fsa), replacing the discontinued
`@mintplex-labs/piper-tts-web`. This doc is the research-first plan the Dev builds from.

## Target voices (pt-BR, from k2-fsa `tts-models`)

| Voice | Tier | Use | Source |
|---|---|---|---|
| **`vits-piper-pt_BR-miro-high`** | high | primary (words + sentences) | k2-fsa releases `tts-models` |
| **`vits-piper-pt_BR-faber-medium`** | medium | fallback / A-B | idem |
| **`vits-piper-pt_BR-jeff-medium`** | medium | A-B (male voice) | idem |
| ~~`pt_BR-edresson-low`~~ | low | dropped (unusable) | — |
| ~~`pt_BR-dii-high`~~ | high | **pt-PT accent**, not BR | — |

> There is **no `dora-high` for pt-BR** (that name is Kokoro-Python only). The pt-BR *high* voice is **`miro-high`**.
> Each bundle (`.tar.bz2`) contains `model.onnx`, `tokens.txt` and an `espeak-ng-data/` dir (phonemization).
> Download: `https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/<name>.tar.bz2`
> Samples to pre-audition: <https://k2-fsa.github.io/sherpa/onnx/tts/all/> (Portuguese).

## Two build approaches (Dev's call — needs Node/Emscripten)

**A — `js-tts-wrapper` (`SherpaOnnxWasmTTSClient`), model baked at build time**
- A provided Node script downloads the WASM + one voice and bakes them into `public/sherpaonnx-wasm/{tts.js,.wasm,.data}`.
- Pros: fastest to a working demo; less glue. Cons: **one voice per `.data`** (A-B/high voices = multiple builds or a big `.data`); less runtime flexibility. Docs: <https://github.com/willwade/js-tts-wrapper/blob/main/docs/sherpaonnx-wasm.md>.

**B — raw sherpa-wasm engine + runtime model loading (the "universal loader")** ← matches the Dev's intent
- Build sherpa-onnx-wasm **without a baked model** (engine + `espeak-ng-data` only). At runtime, per chosen voice:
  `fetch(onnxUrl) → ArrayBuffer → Uint8Array → Module.FS.writeFile('/model.onnx', bytes)` (also `tokens.txt`), then
  `new OfflineTts({ model:'/model.onnx', tokens:'/tokens.txt', dataDir:'/espeak-ng-data' })` → `tts.generate(text)`.
- Pros: **any voice from any CORS URL**, switch at runtime, no rebuild to add a voice. Cons: more glue; must host the
  raw `.onnx`+`.json`+`tokens.txt` un-tarred (a build step un-packs the `.tar.bz2` once and hosts the files with
  `Access-Control-Allow-Origin: *`).

**Recommendation:** start with **B** for the *engine* (so voice/host stay free — the whole point), but reuse
`js-tts-wrapper` if its client already exposes runtime `mergedModelsUrl`/URL loading (it hints at it) to save glue.

## How it lands in the game (Vite + Dev build + PWA)

1. **Assets:** the sherpa `tts.js`/`.wasm`/`.data` (+ `espeak-ng-data`) live under `app/` (served by Vite, emitted to
   `dist/`). The Dev runs the build script once; the artifacts are committed or generated in CI (decide in impl).
2. **Models:** un-tarred `.onnx`+`tokens.txt` hosted on HF or our CDN (CORS `*`); fetched once, cached in
   **OPFS/Cache API** → offline afterwards (ADR-0022: no R2; weights fetched once, then 100% local; disclose to schools).
3. **`platform/tts.ts` rewrite:** replace the `@mintplex-labs` dynamic import with the sherpa client. Keep the closure-DI
   shape, the mixer gate, and the Web Speech immediate fallback. **Route by content type** (the layered decision):
   - phoneme · spell-letter · spell-syllable → **eSpeak** (meSpeak via esm.sh; raw `[[…]]` phonemes),
   - words · sentences → **sherpa (miro-high)**,
   - not-yet-loaded / failure → **Web Speech**.
4. **PWA:** `vite-plugin-pwa` must cache the WASM + `espeak-ng-data` (precache) and the model (runtime cache) so the 2nd
   launch is offline. Add a size budget note (WASM+data+model ≈ tens of MB).

## Open questions for the Dev
- **A vs B** (above) — which build approach?
- **Where do model files live** — HF re-host of the un-tarred files, or our own CDN?
- **Bundle vs runtime-fetch the default voice** — bundle miro-high for instant first-use offline, or lazy-fetch it?
- Keep the standalone lab (`tts-engine-lab.html`) for eSpeak/Web Speech A-B, or retire it now that the neural choice is settled?

## Status of the standalone lab
The CDN-only lab **cannot** run sherpa (needs a build), so it stays as-is for **eSpeak + Web Speech** comparison. The
neural A-B (miro vs faber vs jeff) happens **in-game** once the sherpa runtime is wired, or in a small Dev-built harness.
