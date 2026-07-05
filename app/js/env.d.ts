// SPDX-License-Identifier: GPL-3.0-or-later
// Tipos de ambiente do build. __BUILD__ é injetado pelo Vite (define) em vite.config.ts — carimbo de versão.
declare const __BUILD__: { version: string; sha: string; date: string; env: string };
