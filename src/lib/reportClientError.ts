// Manda a exceção de client pro log da Vercel.
//
// Sem isso, erro de client não deixa rastro em lugar nenhum: o log de runtime
// da Vercel só enxerga o que passa pelo servidor, e o de erros agrupados idem.
// Um POST vazio para uma rota de API resolve, porque aí o console.error acontece
// dentro da função e entra no `get_runtime_errors` como qualquer outro erro.
//
// `keepalive` porque o caso comum é o usuário recarregar ou fechar a aba logo
// depois de ver a tela de erro; sem ele o request morre com a página.

const REPORTED = new Set<string>();

export function reportClientError(error: Error & { digest?: string }) {
  if (typeof window === 'undefined') return;

  // Mesmo erro renderizado de novo (React tenta duas vezes) não vira dois logs.
  const key = `${error.digest ?? ''}|${error.message}`;
  if (REPORTED.has(key)) return;
  REPORTED.add(key);

  const payload = {
    message: String(error.message ?? '').slice(0, 500),
    digest: error.digest ?? null,
    stack: String(error.stack ?? '').slice(0, 2000),
    url: window.location.href.slice(0, 500),
    userAgent: navigator.userAgent.slice(0, 300),
  };

  try {
    fetch('/api/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Relatar o erro nunca pode gerar outro erro.
  }
}
