<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
# sherpa-wasm — motor WASM local para o `sherpa-lab.html`

Roda VITS/Piper no navegador via **sherpa-onnx-wasm**. Só o **motor** é gerado por você (o build oficial exige um modelo
em `assets/` — não há bundle público reaproveitável); as **vozes** o `sherpa-lab.html` baixa **sob demanda do HF do
csukuangfj** e escreve no FS virtual em runtime (`FS.writeFile`). Decisão: **[ADR-0022](../../2-Architecture/adr/ADR-0022-tts-sherpa-onnx-wasm-runtime.yaml)**.

Só o `.gitignore` + este README são versionados; a pasta `tts/` (o motor, grande) fica ignorada.

## Como usar (você roda — eu não tenho Node/WSL/WASM no sandbox)

**1. Gerar os artefatos WASM (WSL + emscripten 4.0.23, uma vez):**

O `CMakeLists.txt` só valida a **existência** de `model.onnx` + `tokens.txt` + `espeak-ng-data/` em `assets/` — não lê o
conteúdo. Então, para a **Abordagem B** (motor genérico, voz em runtime), use **mocks de 0 byte** e o `.data` sai leve
(~5 MB, só o espeak-ng-data). O modelo real é escrito por cima em runtime pela página.

```bash
# rode a partir da RAIZ do clone do sherpa-onnx (onde fica build-wasm-simd-tts.sh), com emsdk ativo (emcc -v = 4.0.23)

# 1) FS exportado (Abordagem B): o build padrão NÃO exporta FS → Module.FS=undefined → sem FS.writeFile.
grep EXPORTED_RUNTIME_METHODS wasm/tts/CMakeLists.txt          # já tem 'FS'? pule o sed
sed -i "s/'ccall'/'ccall','FS','FS_createPath','FS_createDataFile','FS_unlink'/" wasm/tts/CMakeLists.txt

# 2) mock 0-byte (mantém espeak-ng-data REAL, ~5 MB; se faltar, pegue de qualquer modelo):
cd wasm/tts/assets && : > model.onnx && : > tokens.txt && ls && cd ../../..

# 3) rebuild LIMPO (apague o build p/ o CMake reler as flags):
rm -rf build-wasm-simd-tts && ./build-wasm-simd-tts.sh   # warnings de openfst/flags são normais; olhe o "[100%] Linking"

# 4) achar a saída e copiar os 4 artefatos por cima:
SRC=$(dirname "$(find build-wasm-simd-tts -name sherpa-onnx-wasm-main-tts.js | head -1)")
ls -lh "$SRC"/sherpa-onnx-wasm-main-tts.data              # ~5 MB (mock) = não assou modelo; ~60 MB = assou (refaça o mock)
cp "$SRC"/{sherpa-onnx-wasm-main-tts.js,sherpa-onnx-wasm-main-tts.wasm,sherpa-onnx-wasm-main-tts.data,sherpa-onnx-tts.js} \
   "$INCLUSIONIST/docs/research/sherpa-wasm/tts/"   # $INCLUSIONIST = seu checkout deste repo (ex.: export INCLUSIONIST=...)
```

> ⚠️ O 1º build (faber embutido, **sem** `FS` exportado) **não serve** para a página — ela escreve o modelo em runtime
> (`FS.writeFile`), e sem `FS` exportado dá `Module.FS undefined`. **Rebuild com o `FS` exportado é obrigatório.** Aproveite
> e use o mock (0 byte) → `.data` leve e todas as vozes em runtime.

**2. Servir (Windows):**
```powershell
npx serve docs/research   # lê o serve.json (COOP/COEP, exigido pelo build com pthreads); abra /sherpa-lab.html
```

Na página: escolha a voz no seletor → baixa **sob demanda do HF** (só ela; cacheada em Cache API) → ▶ nas tarefas. Trocar
para uma voz já baixada é **instantâneo** (sessão em memória). Sem pré-download — o lab busca cada `.onnx` de
`huggingface.co/csukuangfj/vits-piper-<X>/<X>.onnx`.

## Se der erro, o que o Log diz

- **`FS "/" : espeak-ng-data, …`** — confirma que o `.data` do motor tem o `espeak-ng-data` (o `dataDir` do config).
- **`Module.FS undefined`** — o build não exportou o `FS` → refaça o passo 1 (o `sed` do `EXPORTED_RUNTIME_METHODS`).
- **CORS/COEP no fetch do HF** — a isolação cross-origin bloqueou o download da voz; me avise (fallback: pré-download
  local, ou build single-thread sem COOP/COEP).
- **`HTTP 404` no `.onnx`** — o nome do repo/arquivo divergiu do padrão `vits-piper-<X>/<X>.onnx`; me diga qual voz.

## Por que o mock 0-byte + troca em runtime

O build assa `model.onnx` + `tokens.txt` + `espeak-ng-data` no `.data`, mas o CMake só checa a EXISTÊNCIA — então mocks
de 0 byte passam e o `.data` fica leve (~5 MB, só o `espeak-ng-data`, multilíngue). O motor é **agnóstico de voz**:
qualquer `.onnx` é escrito em runtime (`FS.writeFile`). Para produção (jogo), os `.onnx` irão pro **R2** (ou HF) e o build
entra no Vite (ADR-0022) — isto aqui é o banco de provas.
