'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export type CampaignHistoryRow = {
  campaign: string;
  templateSlug: string;
  sent: number;
  failed: number;
  lastAt: string;
};

type Recipient = { leadId: string; email: string; name: string; firstName: string; pax: number | null };
type Skipped = { email: string; name: string; reason: 'already_sent' | 'opt_out' | 'duplicate' | 'no_email' };
type Preview = { eligible: Recipient[]; skipped: Skipped[]; subject: string; previewHtml: string };
type SendSummary = { sent: number; failed: number; errors: string[] };

const SKIP_REASON: Record<Skipped['reason'], string> = {
  already_sent: 'Já recebeu este e-mail',
  opt_out: 'Descadastrado',
  duplicate: 'E-mail duplicado',
  no_email: 'Sem e-mail',
};

/** Janela do segundo clique antes de o botão voltar ao estado normal. */
const CONFIRM_WINDOW_MS = 5000;

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function CampanhasClient({
  campaigns,
  templates,
  history,
}: {
  campaigns: { slug: string; label: string }[];
  templates: { slug: string; name: string; subject: string }[];
  history: CampaignHistoryRow[];
}) {
  const router = useRouter();
  const [campaign, setCampaign] = useState(campaigns[0]?.slug ?? '');
  const [templateSlug, setTemplateSlug] = useState(templates[0]?.slug ?? '');

  const [preview, setPreview] = useState<Preview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [summary, setSummary] = useState<SendSummary | null>(null);

  // Primeiro clique arma; se o segundo não vier em 5 s, desarma sozinho.
  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [confirming]);

  const campaignLabel = (slug: string) => campaigns.find(c => c.slug === slug)?.label ?? slug;
  const templateLabel = (slug: string) => templates.find(t => t.slug === slug)?.name ?? slug;

  async function call(mode: 'preview' | 'test' | 'send', extra: Record<string, unknown> = {}) {
    const res = await fetch('/api/admin/campaigns/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign, templateSlug, mode, ...extra }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? `Erro ${res.status}`);
    return json;
  }

  async function loadPreview({ keepError = false } = {}) {
    setLoadingPreview(true);
    if (!keepError) setError(null);
    setConfirming(false);
    try {
      setPreview((await call('preview')) as Preview);
    } catch (e) {
      setPreview(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingPreview(false);
    }
  }

  async function sendTest() {
    setTesting(true);
    setTestMessage(null);
    setError(null);
    try {
      const { to } = await call('test');
      setTestMessage(`Teste enviado para ${to}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setTesting(false);
    }
  }

  async function handleSendClick() {
    if (!preview || sending) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    setSending(true);
    setError(null);
    setSummary(null);
    try {
      setSummary((await call('send', { confirmCount: preview.eligible.length })) as SendSummary);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
    }
    // Com sucesso ou erro, a lista real mudou (ou pode ter mudado): recarrega a
    // prévia e o histórico do servidor.
    await loadPreview({ keepError: true });
    router.refresh();
  }

  // Trocar campanha ou template invalida a prévia: o botão de envio só vale
  // para a lista que está na tela.
  function resetPreview() {
    setPreview(null);
    setSummary(null);
    setTestMessage(null);
    setError(null);
    setConfirming(false);
  }

  const count = preview?.eligible.length ?? 0;
  const canSend = !!preview && count > 0 && !sending && !loadingPreview;

  const selectClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none';
  const secondaryBtn =
    'rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="space-y-6">
      {/* Seleção */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">Campanha</span>
            <select
              className={selectClass}
              value={campaign}
              onChange={e => { setCampaign(e.target.value); resetPreview(); }}
            >
              {campaigns.map(c => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">Template</span>
            <select
              className={selectClass}
              value={templateSlug}
              onChange={e => { setTemplateSlug(e.target.value); resetPreview(); }}
            >
              {templates.length === 0 && <option value="">Nenhum template na categoria Campanha</option>}
              {templates.map(t => (
                <option key={t.slug} value={t.slug}>{t.name} ({t.slug})</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadPreview()}
            disabled={!campaign || !templateSlug || loadingPreview || sending}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPreview ? 'Carregando…' : 'Carregar destinatários'}
          </button>
          <button
            type="button"
            onClick={sendTest}
            disabled={!preview || testing || sending}
            className={secondaryBtn}
          >
            {testing ? 'Enviando teste…' : 'Enviar teste para mim'}
          </button>
        </div>

        {testMessage && <p className="mt-3 text-sm text-green-700">{testMessage}</p>}
        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </div>

      {/* Resultado do envio */}
      {summary && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            summary.failed > 0 || summary.errors.length > 0
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-green-200 bg-green-50 text-green-900'
          }`}
        >
          <p className="font-semibold">✓ {summary.sent} enviados · {summary.failed} com erro</p>
          {summary.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {summary.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Prévia */}
      {preview && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-2xl font-bold text-gray-900">
              {count} {count === 1 ? 'destinatário' : 'destinatários'}
            </p>
            <button
              type="button"
              onClick={handleSendClick}
              disabled={!canSend}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                confirming ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {sending
                ? 'Enviando…'
                : confirming
                  ? `Confirmar envio para ${count} ${count === 1 ? 'pessoa' : 'pessoas'}`
                  : `Enviar para ${count} ${count === 1 ? 'pessoa' : 'pessoas'}`}
            </button>
          </div>

          {count > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                    <th className="py-2 pr-4 font-medium">Nome</th>
                    <th className="py-2 pr-4 font-medium">E-mail</th>
                    <th className="py-2 font-medium text-right">Pax</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.eligible.map(r => (
                    <tr key={r.leadId} className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-900">{r.name}</td>
                      <td className="py-2 pr-4 text-gray-600 break-all">{r.email}</td>
                      <td className="py-2 text-right text-gray-600">{r.pax ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {preview.skipped.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                Pulados ({preview.skipped.length})
              </h3>
              <ul className="space-y-1 text-sm">
                {preview.skipped.map((s, i) => (
                  <li key={`${s.email}-${i}`} className="flex flex-wrap gap-x-2 text-gray-600">
                    <span className="text-gray-900">{s.name || '(sem nome)'}</span>
                    {s.email && <span className="break-all">{s.email}</span>}
                    <span className="text-gray-400">· {SKIP_REASON[s.reason]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm text-gray-500">
              Assunto: <span className="font-medium text-gray-900">{preview.subject}</span>
            </p>
            <iframe
              title="Prévia do e-mail"
              srcDoc={preview.previewHtml}
              sandbox=""
              className="h-[600px] w-full rounded-lg border border-gray-200 bg-white"
            />
          </div>
        </div>
      )}

      {/* Histórico */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-700">Histórico</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum envio ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="py-2 pr-4 font-medium">Campanha</th>
                  <th className="py-2 pr-4 font-medium">Template</th>
                  <th className="py-2 pr-4 font-medium text-right">Enviados</th>
                  <th className="py-2 pr-4 font-medium text-right">Com erro</th>
                  <th className="py-2 font-medium">Último envio</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={`${h.campaign}|${h.templateSlug}`} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-900">{campaignLabel(h.campaign)}</td>
                    <td className="py-2 pr-4 text-gray-600">{templateLabel(h.templateSlug)}</td>
                    <td className="py-2 pr-4 text-right text-gray-900">{h.sent}</td>
                    <td className={`py-2 pr-4 text-right ${h.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>{h.failed}</td>
                    <td className="py-2 text-gray-600 whitespace-nowrap">{formatDateTime(h.lastAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
