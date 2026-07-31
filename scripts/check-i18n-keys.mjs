#!/usr/bin/env node
/**
 * Verifica que toda chave usada em t('...') existe em src/i18n/messages/pt-BR.json.
 *
 * Por que isso existe: `tsc` e `next build` NÃO detectam chave inexistente —
 * next-intl só falha em runtime, quando a tela é aberta. Sem esta checagem, uma
 * chave errada só aparece como erro na cara do usuário.
 *
 * Resolução de namespace: um arquivo pode declarar `t` várias vezes, uma por
 * componente (ContactProfile.tsx declara 6). Cada chamada é resolvida pelo
 * binding MAIS PRÓXIMO ACIMA dela — o que aproxima escopo léxico sem precisar
 * de um parser completo. Resolver pelo primeiro binding do arquivo dá falso
 * positivo em massa.
 *
 * Limitações conhecidas (conscientes — a heurística é linha-a-linha, não AST):
 *  - Chaves dinâmicas (`t(\`periodos.${x}\`)`) não são verificáveis estaticamente;
 *    são contadas e reportadas, não checadas.
 *  - Um binding em escopo irmão declarado acima pode ser escolhido no lugar do
 *    correto. Na prática isso não ocorre aqui porque os componentes são
 *    declarados em sequência no arquivo.
 *
 * Uso:  npm run check:i18n
 * Sai com código 1 se alguma chave não resolver.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CATALOG = 'src/i18n/messages/pt-BR.json';
const SCAN_DIRS = ['src/app/admin', 'src/components/admin'];

/** Captura `const X = useTranslations('ns')` e a variante `await getTranslations('ns')`. */
const BINDING_RE =
  /const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*['"]([^'"]+)['"]/;

/** Captura `x('k')`, `x.rich('k')`, `x.has('k')` — inclusive com template literal. */
const CALL_RE = /\b(\w+)(?:\.rich|\.has)?\(\s*(['"`])([^'"`]*)\2/g;

function listTsxFiles(dir) {
  const abs = path.join(repoRoot, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listTsxFiles(rel));
    else if (entry.name.endsWith('.tsx')) out.push(rel);
  }
  return out;
}

function main() {
  const catalogPath = path.join(repoRoot, CATALOG);
  if (!fs.existsSync(catalogPath)) {
    console.error(`✗ Catálogo não encontrado: ${CATALOG}`);
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const hasKey = (dotted) =>
    dotted
      .split('.')
      .reduce((node, k) => (node && typeof node === 'object' ? node[k] : undefined), catalog) !==
    undefined;

  const files = SCAN_DIRS.flatMap(listTsxFiles);
  const missing = [];
  const dynamic = [];
  let checked = 0;

  for (const file of files) {
    const lines = fs.readFileSync(path.join(repoRoot, file), 'utf8').split('\n');

    // Todos os bindings do arquivo, com a linha em que foram declarados.
    const bindings = [];
    lines.forEach((line, i) => {
      const m = line.match(BINDING_RE);
      if (m) bindings.push({ name: m[1], namespace: m[2], line: i });
    });
    if (bindings.length === 0) continue;

    lines.forEach((line, i) => {
      for (const m of line.matchAll(CALL_RE)) {
        const [, name, , key] = m;

        // binding mais próximo ACIMA desta chamada
        let resolved;
        for (const b of bindings) {
          if (b.name === name && b.line <= i) resolved = b;
        }
        if (!resolved) continue;

        if (key.includes('${')) {
          dynamic.push(`${file}:${i + 1}  ${name}(\`${key}\`) -> ${resolved.namespace}.${key}`);
          continue;
        }

        checked++;
        const full = `${resolved.namespace}.${key}`;
        if (!hasKey(full)) missing.push(`${file}:${i + 1}  ${name}('${key}') -> ${full}`);
      }
    });
  }

  console.log(
    `i18n: ${checked} referências estáticas verificadas em ${files.length} arquivos ` +
      `(${dynamic.length} dinâmicas ignoradas)`,
  );

  if (dynamic.length) {
    console.log('\nChaves dinâmicas (verifique manualmente que os valores existem):');
    for (const d of dynamic) console.log(`  ${d}`);
  }

  if (missing.length) {
    console.error(`\n✗ ${missing.length} chave(s) sem entrada em ${CATALOG}:`);
    for (const m of missing) console.error(`  ${m}`);
    process.exit(1);
  }

  console.log('\n✓ Todas as chaves estáticas resolvem.');
}

main();
