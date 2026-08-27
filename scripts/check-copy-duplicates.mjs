#!/usr/bin/env node
/**
 * Detecta texto alemão duplicado que DIVERGIU entre as cópias.
 *
 * Por que isso existe: várias páginas guardam a mesma frase em dois lugares —
 * o bloco JSON-LD (que o Google e as IAs leem) e o JSX visível (que o visitante
 * lê). A FAQ da home vive no FaqAccordion E num JSON-LD dentro de page.tsx; as
 * descrições de tour aparecem em AndereTouren.tsx E em touren/page.tsx; a FAQ
 * da Rocinha vive no RocinhaFaq E na página.
 *
 * Editar uma cópia e esquecer a outra não quebra build, não quebra tsc e não
 * aparece na tela: o visitante continua vendo o texto novo enquanto o
 * structured data serve o antigo. Foi o que aconteceu em 27/08/2026 numa
 * limpeza de pontuação — 5 textos divergiram e ninguém teria notado.
 *
 * Como funciona: agrupa strings alemãs longas por uma chave normalizada, que
 * ignora a pontuação de junção (traço, ponto, vírgula, dois pontos). Duas
 * formas diferentes na mesma chave = cópia que divergiu.
 *
 * Limitação consciente: só compara literais entre aspas duplas com 45+
 * caracteres. Texto JSX solto (sem aspas) não é comparado — casos assim
 * precisam de conferência manual.
 *
 * Uso:  npm run check:copy
 * Sai com código 1 se achar divergência.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIN_LEN = 45;
const ALEMAO = /[äöüßÄÖÜ]|\b(der|die|das|und|mit|von|für|auf|ist|du|ein|eine)\b/;

function listarArquivos(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      // O admin é em português e não tem cópia duplicada em structured data.
      if (e.name === 'admin' || e.name === 'node_modules') continue;
      listarArquivos(p, acc);
    } else if (/\.(tsx|ts)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

/** Ignora o que distingue as cópias: só a pontuação de junção. */
function chave(s) {
  return s
    .replace(/\s*[—–]\s*|\s*\.\s+|\s*,\s*|\s*:\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function main() {
  const grupos = new Map();
  for (const arquivo of listarArquivos(path.join(repoRoot, 'src'))) {
    const rel = path.relative(repoRoot, arquivo);
    for (const linha of fs.readFileSync(arquivo, 'utf8').split('\n')) {
      for (const m of linha.matchAll(/"([^"]{45,})"/g)) {
        const s = m[1];
        if (s.length < MIN_LEN || !ALEMAO.test(s)) continue;
        const k = chave(s);
        if (!grupos.has(k)) grupos.set(k, { formas: new Map() });
        grupos.get(k).formas.set(s, rel);
      }
    }
  }

  const divergentes = [...grupos.values()].filter(g => g.formas.size > 1);
  if (divergentes.length === 0) {
    console.log('✓ Nenhuma cópia divergente: todo texto duplicado está idêntico.');
    return;
  }

  console.error(`✗ ${divergentes.length} texto(s) duplicado(s) com forma divergente:\n`);
  for (const g of divergentes) {
    for (const [forma, arq] of g.formas) {
      console.error(`   ${arq}`);
      console.error(`     ${forma.slice(0, 120)}`);
    }
    console.error('');
  }
  console.error('Corrija para que as cópias fiquem idênticas — o JSON-LD e o');
  console.error('visível precisam dizer a mesma coisa.');
  process.exit(1);
}

main();
