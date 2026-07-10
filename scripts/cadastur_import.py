#!/usr/bin/env python3
"""Importa a base pública do Cadastur para a tabela `cadastur_prestadores` no Supabase.

Fonte: Portal de Dados Abertos do Ministério do Turismo (CKAN), somente API pública:
  - Guias de Turismo (abas PF e PJ): dataset `prestadores-de-servicos-turisticos-guia-turismo_2`
  - Agências de Turismo: dataset `agencia-de-turismo`

Para cada dataset, baixa o recurso com a data de modificação mais recente,
normaliza colunas, filtra por UF/município, deduplica por (número do
certificado, categoria) e faz UPSERT no Supabase
(on_conflict=numero_certificado,categoria), permitindo reimportações
mensais sem duplicar.

Uso:
  pip install -r scripts/requirements.txt
  python scripts/cadastur_import.py                # Brasil inteiro (default)
  python scripts/cadastur_import.py --uf RJ --municipio "Rio de Janeiro"  # recorte
  python scripts/cadastur_import.py --dry-run      # processa e loga, sem gravar

Credenciais: lê NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY do
ambiente ou, se ausentes, do .env.local na raiz do repo.
"""

import argparse
import json
import os
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import requests

CKAN_BASES = [
    "https://dados.gov.br/api/3/action",          # pode exigir chave (401) — tentamos primeiro
    "https://dados.turismo.gov.br/api/3/action",  # fallback validado (mesmo CKAN, aberto)
]

DATASETS = {
    "guia": "prestadores-de-servicos-turisticos-guia-turismo_2",
    "agencia": "agencia-de-turismo",
}

TABLE = "cadastur_prestadores"
# MEIs podem ter o mesmo certificado como guia PJ e agência → chave composta
UPSERT_KEYS = ["numero_certificado", "categoria"]
BATCH_SIZE = 500

# Correções aplicadas depois da normalização genérica (snake_case sem acento)
# para casar com os nomes de coluna da tabela.
COLUMN_FIXES = {
    "numero_de_inscricao_do_cnpj": "cnpj",
    "nome_da_pessoa_juridica": "nome_pessoa_juridica",
    "endereco_completo_receita_federal": "endereco_receita_federal",
    "endereco_completo_comercial": "endereco_comercial",
    "data_de_abertura": "data_abertura",
    "cnae_s_relacionados_a_atividade": "cnaes",
    "nome_do_responsavel": "nome_responsavel",
    "e_mail_do_usuario_administrador": "email_usuario_administrador",
    "e_mail_institucional": "email_institucional",
    "e_mail_comercial": "email_comercial",
    "numero_do_certificado": "numero_certificado",
    "categoria_s": "categorias",
    "segmento_s": "segmentos",
    "nome_social_tratamento": "nome_social",
    "documento_de_identificacao": "documento_identificacao",
    "carteira_de_estrangeiro": "carteira_estrangeiro",
    "data_de_validade": "data_validade",
    "data_de_nascimento": "data_nascimento",
    "municipio_de_atuacao": "municipio_atuacao",
    "categoria_de_atuacao": "categoria_atuacao",
    "tipo_de_estabelecimento": "tipo_estabelecimento",
    "quantidade_de_veiculos": "quantidade_veiculos",
    "quantidade_de_embarcacoes": "quantidade_embarcacoes",
    "embarcacoes_cruzeiro_fluvial_barco_hotel": "embarcacoes_cruzeiro_fluvial",
}

# Colunas existentes na tabela (além das de controle). Colunas da fonte fora
# desta lista são descartadas com aviso — sinaliza mudança de layout na fonte.
TABLE_COLUMNS = {
    "numero_certificado", "validade_do_certificado", "cnpj", "cpf",
    "nome_pessoa_juridica", "nome_fantasia", "nome_completo",
    "nome_responsavel", "nome_social", "situacao_cadastral",
    "situacao_da_atividade", "situacao_tramite", "atividade_turistica",
    "tipo_estabelecimento", "natureza_juridica", "porte", "cnaes",
    "categorias", "segmentos", "idiomas", "municipio_atuacao",
    "guia_motorista", "categoria_atuacao", "atividades_obrigatorias",
    "atividades_opcionais", "segmentos_turisticos", "quantidade_veiculos",
    "quantidade_embarcacoes", "embarcacoes_cruzeiro_maritimo",
    "embarcacoes_cruzeiro_fluvial", "telefone_institucional",
    "telefone_comercial", "email_institucional", "email_comercial",
    "email_usuario_administrador", "website", "endereco_receita_federal",
    "endereco_comercial", "uf", "municipio", "data_abertura",
    "data_nascimento", "sexo", "nacionalidade", "documento_identificacao",
    "carteira_estrangeiro", "orgao_expedidor", "validade", "data_validade",
    "tipo_sanguineo", "possui_empregado",
}

CONTACT_COLUMNS = [
    "telefone_institucional", "telefone_comercial", "email_institucional",
    "email_comercial", "email_usuario_administrador", "website",
]


def log(msg: str) -> None:
    print(f"[cadastur] {msg}", flush=True)


def load_env(repo_root: Path) -> tuple[str, str]:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    env_file = repo_root / ".env.local"
    if (not url or not key) and env_file.exists():
        for line in env_file.read_text().splitlines():
            m = re.match(r"^([A-Z_]+)=(.*)$", line.strip())
            if not m:
                continue
            name, value = m.group(1), m.group(2).strip().strip('"').strip("'")
            if name == "NEXT_PUBLIC_SUPABASE_URL" and not url:
                url = value
            if name == "SUPABASE_SERVICE_ROLE_KEY" and not key:
                key = value
    if not url or not key:
        sys.exit("Erro: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (env ou .env.local).")
    return url.rstrip("/"), key


def ckan_package_show(dataset_id: str) -> dict:
    last_error = None
    for base in CKAN_BASES:
        try:
            resp = requests.get(
                f"{base}/package_show", params={"id": dataset_id},
                headers={"Accept": "application/json"}, timeout=180,
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("success"):
                log(f"CKAN ok: {base} → {dataset_id}")
                return data["result"]
            last_error = f"success=false em {base}"
        except (requests.RequestException, json.JSONDecodeError) as exc:
            last_error = f"{base}: {exc}"
            log(f"CKAN falhou ({last_error}), tentando próximo endpoint…")
    sys.exit(f"Erro: nenhuma API CKAN respondeu para {dataset_id}. Último erro: {last_error}")


def newest_resource(package: dict) -> dict:
    resources = [r for r in package.get("resources", []) if r.get("url")]
    if not resources:
        sys.exit(f"Erro: dataset {package.get('name')} sem recursos com URL.")
    return max(resources, key=lambda r: r.get("last_modified") or r.get("created") or "")


def download(url: str, dest_dir: Path) -> Path:
    dest = dest_dir / Path(url).name
    log(f"Baixando {url}")
    with requests.get(url, stream=True, timeout=600) as resp:
        resp.raise_for_status()
        with open(dest, "wb") as fh:
            for chunk in resp.iter_content(chunk_size=1 << 20):
                fh.write(chunk)
    log(f"Salvo em {dest} ({dest.stat().st_size / 1e6:.1f} MB)")
    return dest


def read_sheets(path: Path) -> dict[str, pd.DataFrame]:
    """Lê todas as abas de um XLSX, ou um CSV (utf-8 → latin-1, separador ';')."""
    if path.suffix.lower() in (".xlsx", ".xls"):
        return pd.read_excel(path, sheet_name=None, dtype=str)
    for encoding in ("utf-8", "latin-1"):
        try:
            return {path.stem: pd.read_csv(path, sep=";", encoding=encoding, dtype=str)}
        except UnicodeDecodeError:
            continue
    sys.exit(f"Erro: não foi possível ler {path} como CSV (utf-8/latin-1).")


def snake_case(name: str) -> str:
    name = unicodedata.normalize("NFKD", str(name)).encode("ascii", "ignore").decode()
    name = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
    return COLUMN_FIXES.get(name, name)


def normalize(df: pd.DataFrame, categoria: str, fonte_arquivo: str) -> pd.DataFrame:
    df = df.rename(columns={c: snake_case(c) for c in df.columns})
    unknown = [c for c in df.columns if c not in TABLE_COLUMNS]
    if unknown:
        log(f"AVISO ({categoria}): colunas da fonte sem correspondência na tabela, descartadas: {unknown}")
    df = df[[c for c in df.columns if c in TABLE_COLUMNS]].copy()
    # Strings vazias/nan → None (não inventamos dado que não veio da fonte)
    df = df.apply(lambda col: col.str.strip() if col.dtype == object else col)
    df = df.replace({"": None, "nan": None, "None": None}).where(pd.notna(df), None)
    df["categoria"] = categoria
    df["fonte_arquivo"] = fonte_arquivo
    df["data_importacao"] = datetime.now(timezone.utc).isoformat()
    return df


def contact_report(df: pd.DataFrame, label: str) -> None:
    log(f"--- {label}: {len(df)} linhas após filtro")
    for col in CONTACT_COLUMNS:
        if col in df.columns:
            filled = int(df[col].notna().sum())
            pct = 100 * filled / len(df) if len(df) else 0
            log(f"    contato {col}: {filled}/{len(df)} preenchidos ({pct:.0f}%)")
        else:
            log(f"    contato {col}: CAMPO AUSENTE na fonte")


def upsert(rows: list[dict], supabase_url: str, service_key: str) -> None:
    endpoint = f"{supabase_url}/rest/v1/{TABLE}?on_conflict={','.join(UPSERT_KEYS)}"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    for start in range(0, len(rows), BATCH_SIZE):
        batch = rows[start:start + BATCH_SIZE]
        resp = requests.post(endpoint, headers=headers, json=batch, timeout=120)
        if resp.status_code >= 400:
            sys.exit(f"Erro no upsert (lote {start // BATCH_SIZE + 1}): {resp.status_code} {resp.text[:500]}")
        log(f"Upsert lote {start // BATCH_SIZE + 1}: {len(batch)} linhas ok")


def main() -> None:
    parser = argparse.ArgumentParser(description="Importa base Cadastur (guias + agências) para o Supabase.")
    parser.add_argument("--uf", default="", help="UF para filtrar (vazio = todas). Default: todas")
    parser.add_argument("--municipio", default="",
                        help="Município para filtrar (vazio = todos). Default: todos")
    parser.add_argument("--download-dir", default="/tmp", help="Diretório de download. Default: /tmp")
    parser.add_argument("--dry-run", action="store_true", help="Processa e loga sem gravar no Supabase.")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    download_dir = Path(args.download_dir)
    download_dir.mkdir(parents=True, exist_ok=True)

    supabase_url = service_key = None
    if not args.dry_run:
        supabase_url, service_key = load_env(repo_root)

    frames: list[pd.DataFrame] = []
    for kind, dataset_id in DATASETS.items():
        package = ckan_package_show(dataset_id)
        resource = newest_resource(package)
        log(f"Dataset {dataset_id}: recurso mais recente '{resource.get('name')}' "
            f"({resource.get('format')}, modificado {resource.get('last_modified')})")
        path = download(resource["url"], download_dir)
        for sheet_name, df in read_sheets(path).items():
            if kind == "guia":
                categoria = "guia_pf" if "PF" in sheet_name.upper() else "guia_pj"
            else:
                categoria = "agencia"
            log(f"Aba '{sheet_name}' → categoria {categoria}: {len(df)} linhas, "
                f"{len(df.columns)} colunas: {list(df.columns)}")
            frames.append(normalize(df, categoria, path.name))

    data = pd.concat(frames, ignore_index=True)
    log(f"Total bruto: {len(data)} linhas")

    if args.uf:
        data = data[data["uf"].fillna("").str.strip().str.upper() == args.uf.strip().upper()]
    if args.municipio:
        data = data[data["municipio"].fillna("").str.strip().str.lower() == args.municipio.strip().lower()]

    before = len(data)
    data = data[data["numero_certificado"].notna()]
    if len(data) < before:
        log(f"AVISO: {before - len(data)} linhas sem numero_certificado descartadas")
    data = data.drop_duplicates(subset=UPSERT_KEYS, keep="last")
    log(f"Após filtro UF/município e dedup por {UPSERT_KEYS}: {len(data)} linhas")

    for categoria, group in data.groupby("categoria"):
        contact_report(group, categoria)

    if args.dry_run:
        log("Dry-run: nada gravado no Supabase.")
        return

    rows = data.where(pd.notna(data), None).to_dict(orient="records")
    upsert(rows, supabase_url, service_key)

    log("=== Resumo ===")
    for categoria, group in data.groupby("categoria"):
        log(f"{categoria}: {len(group)} registros gravados/atualizados")
    log("Importação concluída.")


if __name__ == "__main__":
    main()
