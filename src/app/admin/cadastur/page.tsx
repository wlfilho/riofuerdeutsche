import { getAdminTranslations } from '@/i18n/admin';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { fmtNumber } from '@/lib/adminFormat';

export async function generateMetadata() {
  const t = await getAdminTranslations('admin.cadastur');
  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

// Tabela cadastur_prestadores tem RLS sem policies (contém CPF e dados
// pessoais): só é legível com a service role, nunca no browser.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAGE_SIZE = 50;

const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS',
  'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC',
  'SE', 'SP', 'TO',
];

// Idiomas presentes na base (campo existe só para guias), por frequência.
// Na fonte vêm pipe-separated e com variações ("| Português"), por isso ilike.
const IDIOMAS = [
  'Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Alemão',
  'Libras', 'Japonês', 'Mandarim', 'Russo', 'Coreano', 'Hebraico', 'Árabe',
  'Holandês', 'Guarani', 'Polonês', 'Turco', 'Sueco', 'Esperanto', 'Catalão',
  'Grego', 'Ucraniano', 'Húngaro', 'Suiço', 'Eslovaco', 'Tcheco', 'Norueguês',
  'Dinamarquês', 'Sérvio', 'Persa', 'Armênio', 'Finlandês', 'Vietnamita',
  'Búlgaro', 'Azeri', 'Hindi',
];

// Bandeira representativa de cada idioma da base. Sem bandeira possível
// (Libras, Esperanto, Catalão, Guarani…) cai no nome por extenso.
const IDIOMA_FLAGS: Record<string, string> = {
  'Português': '🇧🇷', 'Inglês': '🇬🇧', 'Espanhol': '🇪🇸', 'Francês': '🇫🇷',
  'Italiano': '🇮🇹', 'Alemão': '🇩🇪', 'Libras': '🤟', 'Japonês': '🇯🇵',
  'Mandarim': '🇨🇳', 'Russo': '🇷🇺', 'Coreano': '🇰🇷', 'Hebraico': '🇮🇱',
  'Árabe': '🇸🇦', 'Holandês': '🇳🇱', 'Guarani': '🇵🇾', 'Polonês': '🇵🇱',
  'Turco': '🇹🇷', 'Sueco': '🇸🇪', 'Grego': '🇬🇷', 'Ucraniano': '🇺🇦',
  'Húngaro': '🇭🇺', 'Suiço': '🇨🇭', 'Eslovaco': '🇸🇰', 'Tcheco': '🇨🇿',
  'Norueguês': '🇳🇴', 'Dinamarquês': '🇩🇰', 'Sérvio': '🇷🇸', 'Persa': '🇮🇷',
  'Armênio': '🇦🇲', 'Finlandês': '🇫🇮', 'Vietnamita': '🇻🇳', 'Búlgaro': '🇧🇬',
  'Azeri': '🇦🇿', 'Hindi': '🇮🇳',
};

function parseIdiomas(idiomas: string): string[] {
  return idiomas
    .split('|')
    .map(s => s.trim())
    .filter(s => s !== '' && s !== '-');
}

// Chaveado pelo valor bruto de `categoria` no banco; o rótulo vem do catálogo
// (admin.cadastur.categorias), com fallback para o valor cru.
const CATEGORIA_CLASSES: Record<string, string> = {
  agencia: 'bg-green-50 text-green-700 border-green-200',
  guia_pf: 'bg-blue-50 text-blue-700 border-blue-200',
  guia_pj: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

interface CadasturRow {
  id: number;
  categoria: string;
  numero_certificado: string;
  nome_fantasia: string | null;
  nome_pessoa_juridica: string | null;
  nome_completo: string | null;
  uf: string | null;
  municipio: string | null;
  telefone_comercial: string | null;
  email_comercial: string | null;
  website: string | null;
  idiomas: string | null;
  situacao_cadastral: string | null;
}

function displayName(row: CadasturRow): string {
  return row.nome_fantasia || row.nome_pessoa_juridica || row.nome_completo || '—';
}

function websiteHref(website: string): string {
  return website.startsWith('http') ? website : `https://${website}`;
}

export default async function CadasturPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; uf?: string; municipio?: string; idioma?: string; page?: string }>;
}) {
  const t = await getAdminTranslations('admin.cadastur');
  const tCategorias = await getAdminTranslations('admin.cadastur.categorias');
  const tCommon = await getAdminTranslations('admin.common');
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  // Caracteres com significado na sintaxe .or() do PostgREST
  const q = (params.q ?? '').replace(/[,()%]/g, ' ').trim();

  let query = supabaseAdmin
    .from('cadastur_prestadores')
    .select(
      'id, categoria, numero_certificado, nome_fantasia, nome_pessoa_juridica, nome_completo, uf, municipio, telefone_comercial, email_comercial, website, idiomas, situacao_cadastral',
      { count: 'exact' }
    );

  if (params.categoria) query = query.eq('categoria', params.categoria);
  if (params.idioma && IDIOMAS.includes(params.idioma)) query = query.ilike('idiomas', `%${params.idioma}%`);
  if (params.uf) query = query.eq('uf', params.uf);
  if (params.municipio) query = query.ilike('municipio', `%${params.municipio.replace(/[,()%]/g, ' ').trim()}%`);
  if (q) {
    query = query.or(
      `nome_fantasia.ilike.%${q}%,nome_pessoa_juridica.ilike.%${q}%,nome_completo.ilike.%${q}%,email_comercial.ilike.%${q}%`
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const [{ data, count, error }, ...totals] = await Promise.all([
    query.order('id').range(from, from + PAGE_SIZE - 1),
    ...['agencia', 'guia_pf', 'guia_pj'].map(cat =>
      supabaseAdmin
        .from('cadastur_prestadores')
        .select('id', { count: 'exact', head: true })
        .eq('categoria', cat)
    ),
  ]);

  const rows = (data ?? []) as CadasturRow[];
  const filteredTotal = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));

  const metrics = [
    { label: t('agencias'), value: totals[0].count ?? 0 },
    { label: t('guiasPf'), value: totals[1].count ?? 0 },
    { label: t('guiasPj'), value: totals[2].count ?? 0 },
    { label: t('resultadoFiltro'), value: filteredTotal },
  ];

  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.categoria) sp.set('categoria', params.categoria);
    if (params.uf) sp.set('uf', params.uf);
    if (params.municipio) sp.set('municipio', params.municipio);
    if (params.idioma) sp.set('idioma', params.idioma);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return `/admin/cadastur${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
          <p className="text-gray-500 mt-1">
            {t('subtitulo')}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {metrics.map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{fmtNumber(card.value)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros (form GET — recarrega a página com searchParams) */}
        <form method="get" className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-48">
            <label htmlFor="q" className="block text-xs font-medium text-gray-500 mb-1">{tCommon('buscar')}</label>
            <input
              id="q"
              name="q"
              type="text"
              defaultValue={params.q ?? ''}
              placeholder={t('buscaPlaceholder')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="categoria" className="block text-xs font-medium text-gray-500 mb-1">{t('categoria')}</label>
            <select
              id="categoria"
              name="categoria"
              defaultValue={params.categoria ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{tCommon('todas')}</option>
              <option value="agencia">{tCategorias('agencia')}</option>
              <option value="guia_pf">{tCategorias('guia_pf')}</option>
              <option value="guia_pj">{tCategorias('guia_pj')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="uf" className="block text-xs font-medium text-gray-500 mb-1">{t('uf')}</label>
            <select
              id="uf"
              name="uf"
              defaultValue={params.uf ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{tCommon('todas')}</option>
              {UFS.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="idioma" className="block text-xs font-medium text-gray-500 mb-1">{t('idiomaGuias')}</label>
            <select
              id="idioma"
              name="idioma"
              defaultValue={params.idioma ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{tCommon('todos')}</option>
              {IDIOMAS.map(idioma => (
                <option key={idioma} value={idioma}>{idioma}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="municipio" className="block text-xs font-medium text-gray-500 mb-1">{t('municipio')}</label>
            <input
              id="municipio"
              name="municipio"
              type="text"
              defaultValue={params.municipio ?? ''}
              placeholder={t('municipioPlaceholder')}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {tCommon('filtrar')}
            </button>
            <Link
              href="/admin/cadastur"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {tCommon('limpar')}
            </Link>
          </div>
        </form>

        {/* Fetch error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {tCommon('erroPrefixo', { mensagem: error.message })}
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium">{tCommon('nome')}</th>
                <th className="px-4 py-3 font-medium">{t('categoria')}</th>
                <th className="px-4 py-3 font-medium">{t('colLocal')}</th>
                <th className="px-4 py-3 font-medium">{tCommon('telefone')}</th>
                <th className="px-4 py-3 font-medium">{tCommon('email')}</th>
                <th className="px-4 py-3 font-medium">{t('colWebsite')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    {t('nenhumRegistro')}
                  </td>
                </tr>
              )}
              {rows.map(row => {
                const badgeClassName =
                  CATEGORIA_CLASSES[row.categoria] ?? 'bg-gray-50 text-gray-600 border-gray-200';
                const badgeLabel = tCategorias.has(row.categoria)
                  ? tCategorias(row.categoria)
                  : row.categoria;
                return (
                  <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{displayName(row)}</p>
                      <p className="text-xs text-gray-400">
                        {t('certPrefixo')}{row.numero_certificado}
                        {row.idiomas && parseIdiomas(row.idiomas).length > 0 && (
                          <span title={parseIdiomas(row.idiomas).join(', ')} className="ml-1.5 text-sm align-middle">
                            {parseIdiomas(row.idiomas).map(i => IDIOMA_FLAGS[i] ?? i).join(' ')}
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClassName}`}>
                        {badgeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {row.municipio ?? '—'}{row.uf ? ` / ${row.uf}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {row.telefone_comercial ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {row.email_comercial ? (
                        <a href={`mailto:${row.email_comercial}`} className="text-green-700 hover:underline break-all">
                          {row.email_comercial}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 max-w-48">
                      {row.website ? (
                        <a
                          href={websiteHref(row.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:underline break-all"
                        >
                          {row.website}
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-sm text-gray-600">
            <p>
              {t('paginacao', { pagina: page, total: fmtNumber(totalPages), registros: fmtNumber(filteredTotal) })}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={pageHref(page - 1)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  {t('anterior')}
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={pageHref(page + 1)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  {t('proxima')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
