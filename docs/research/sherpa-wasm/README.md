<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
# sherpa-wasm — assets locais para o `sherpa-lab.html`

Roda VITS/Piper pt-BR no navegador via **sherpa-onnx-wasm**, **sem compilar Emscripten**: reusamos o bundle WASM
pronto do Space inglês do k2-fsa (motor + `espeak-ng-data` já assados no `.data`) e escrevemos o modelo pt-BR no FS
virtual em runtime (`FS.writeFile`). Base da decisão: **[ADR-0022](../../2-Architecture/adr/ADR-0022-tts-sherpa-onnx-wasm-runtime.yaml)**.

Nada aqui é versionado (é grande) — o `.gitignore` só mantém o script + este README.

## Como usar (você roda — eu não tenho Node/WASM no sandbox)

```powershell
pwsh docs/research/sherpa-wasm/fetch-sherpa-wasm.ps1   # baixa o bundle wasm + miro/faber/jeff (curl, sem compilar)
npx serve docs/research                                 # serve a pasta
# abra http://localhost:3000/sherpa-lab.html  (a porta pode variar)
```

Na página: escolha a voz → **Carregar** (baixa o `.onnx` local + escreve no FS) → ▶ nas tarefas. Ajuste a velocidade.

## Se der erro, o que o Log diz

- **`FS "/" contém: …`** — mostra o que o `.data` do bundle assou. Confirme que existe um `espeak-ng-data` aí; se o
  nome/caminho for outro, é só ajustar `dataDir` no `sherpa-lab.html`.
- **`HTTP 404 em sherpa-wasm/…`** — o download não trouxe o arquivo (nome do modelo/asset mudou); ajusto o script.
- **erro ao criar `OfflineTts`** — provável divergência no *shape* do config vs. a versão do `sherpa-onnx-tts.js`
  baixado; me diga a mensagem e eu alinho ao wrapper local.

## Por que reusar o bundle inglês

O `espeak-ng-data` é **multilíngue** (contém pt); só o `.onnx` + `tokens.txt` são específicos da voz. Então o motor +
data do bundle inglês servem para qualquer voz pt-BR escrita por cima. Para produção (jogo), os `.onnx` irão pro **R2**
e o build entra no Vite (ADR-0022) — isto aqui é o banco de provas.
