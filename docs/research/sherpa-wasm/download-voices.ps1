# SPDX-License-Identifier: GPL-3.0-or-later
# Baixa vozes vits-piper (csukuangfj) para ARQUIVOS REAIS em sherpa-wasm/models/<X>/.
# O sherpa-lab.html carrega dessa pasta PRIMEIRO (mesma origem, offline); o HF é só fallback.
# Baixa só o que estiver em $VOICES — edite à vontade (baixar todas as ~50 = vários GB).
# Uso:  pwsh docs/research/sherpa-wasm/download-voices.ps1

$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot 'models'
New-Item -ItemType Directory -Force -Path $root | Out-Null

# Sufixo do repo (= nome do .onnx). Adicione/remova conforme o que quiser hospedar localmente:
$VOICES = @(
  'pt_BR-faber-medium', 'pt_BR-cadu-medium', 'pt_BR-miro-high', 'pt_BR-dii-high',
  'pt_PT-tugao-medium', 'pt_PT-miro-high', 'pt_PT-dii-high'
)

$hf = 'https://huggingface.co/csukuangfj/vits-piper-'
foreach ($x in $VOICES) {
  try {
    $dir = Join-Path $root $x; New-Item -ItemType Directory -Force -Path $dir | Out-Null
    foreach ($f in @("$x.onnx", 'tokens.txt')) {
      $out = Join-Path $dir $f
      if (Test-Path $out) { Write-Host "[skip] $x/$f (já existe)"; continue }
      Write-Host "[baixando] $x/$f ..."
      Invoke-WebRequest -Uri "$hf$x/resolve/main/$f" -OutFile $out
    }
    Write-Host "[ok] $x"
  } catch { Write-Warning "[falhou] $x : $($_.Exception.Message)" }
}
Write-Host ""
Write-Host "Pronto. Vozes em: $root  (o sherpa-lab carrega de lá primeiro)"
