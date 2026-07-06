<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
# sherpa-wasm — assets locais para o `sherpa-lab.html`

Roda VITS/Piper pt-BR no navegador via **sherpa-onnx-wasm**. Os artefatos WASM são **gerados por você** (o build oficial
exige um modelo em `assets/` — não há bundle público reaproveitável), e as vozes pt-BR são escritas no FS virtual em
runtime (`FS.writeFile`). Base da decisão: **[ADR-0022](../../2-Architecture/adr/ADR-0022-tts-sherpa-onnx-wasm-runtime.yaml)**.

Nada aqui é versionado (é grande) — o `.gitignore` só mantém o script + este README.

## Como usar (você roda — eu não tenho Node/WSL/WASM no sandbox)

**1. Gerar os artefatos WASM (WSL + emscripten 4.0.23, uma vez):**
```bash
# emsdk ativo no MESMO bash:  source ~/emsdk/emsdk_env.sh  &&  emcc -v  (deve dizer 4.0.23)
cd ~/sherpa-onnx/wasm/tts/assets
wget -q https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-pt_BR-faber-medium.tar.bz2
tar xf vits-piper-pt_BR-faber-medium.tar.bz2
cp vits-piper-pt_BR-faber-medium/*.onnx model.onnx && cp vits-piper-pt_BR-faber-medium/tokens.txt . && cp -r vits-piper-pt_BR-faber-medium/espeak-ng-data .
cd ~/sherpa-onnx/wasm/tts && ./build-wasm-simd-tts.sh
# copie os 4 artefatos p/ ESTA pasta:
cp ~/sherpa-onnx/build-wasm-simd-tts/install/bin/wasm/tts/{sherpa-onnx-wasm-main-tts.js,sherpa-onnx-wasm-main-tts.wasm,sherpa-onnx-wasm-main-tts.data,sherpa-onnx-tts.js} /mnt/c/Users/candi/Claude/SP-the-inclusionist-tracer/docs/research/sherpa-wasm/
```

**2. Baixar os modelos pt-BR + servir (Windows):**
```powershell
pwsh docs/research/sherpa-wasm/fetch-sherpa-wasm.ps1   # miro/faber/jeff (só .onnx + tokens.txt)
npx serve docs/research                                 # abra /sherpa-lab.html (porta pode variar)
```

Na página: escolha a voz → **Carregar** (baixa o `.onnx` local + escreve no FS) → ▶ nas tarefas. Ajuste a velocidade.

## Se der erro, o que o Log diz

- **`FS "/" contém: …`** — mostra o que o `.data` do bundle assou. Confirme que existe um `espeak-ng-data` aí; se o
  nome/caminho for outro, é só ajustar `dataDir` no `sherpa-lab.html`.
- **`HTTP 404 em sherpa-wasm/…`** — o download não trouxe o arquivo (nome do modelo/asset mudou); ajusto o script.
- **erro ao criar `OfflineTts`** — provável divergência no *shape* do config vs. a versão do `sherpa-onnx-tts.js`
  baixado; me diga a mensagem e eu alinho ao wrapper local.

## Por que um modelo de "recheio" + troca em runtime

O build assa `model.onnx` + `tokens.txt` + `espeak-ng-data` no `.data`. O `espeak-ng-data` é **multilíngue** (contém pt)
e o motor é **agnóstico de voz** — então o modelo assado (faber) serve de padrão offline, e qualquer outra voz pt-BR é
escrita por cima em runtime (`FS.writeFile`). Para produção (jogo), os `.onnx` irão pro **R2** e o build entra no Vite
(ADR-0022) — isto aqui é o banco de provas.
