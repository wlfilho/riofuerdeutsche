-- Base pública Cadastur (MTur / dados.turismo.gov.br): guias de turismo (PF/PJ)
-- e agências. Carregada por scripts/cadastur_import.py via service role.
-- Contém dados pessoais (CPF, nascimento etc.) — RLS habilitado sem policies:
-- nenhum acesso anon/authenticated, somente service role.

create table public.cadastur_prestadores (
  id bigint generated always as identity primary key,
  -- controle
  categoria text not null check (categoria in ('guia_pf', 'guia_pj', 'agencia')),
  fonte_arquivo text,
  data_importacao timestamptz not null default now(),
  -- chave de negócio (número do certificado Cadastur; MEIs podem ter o mesmo
  -- certificado como guia PJ e agência, por isso o unique é composto)
  numero_certificado text not null,
  validade_do_certificado text,
  -- identificação
  cnpj text,
  cpf text,
  nome_pessoa_juridica text,
  nome_fantasia text,
  nome_completo text,
  nome_responsavel text,
  nome_social text,
  -- situação
  situacao_cadastral text,
  situacao_da_atividade text,
  situacao_tramite text,
  -- classificação
  atividade_turistica text,
  tipo_estabelecimento text,
  natureza_juridica text,
  porte text,
  cnaes text,
  categorias text,
  segmentos text,
  idiomas text,
  municipio_atuacao text,
  guia_motorista text,
  categoria_atuacao text,
  atividades_obrigatorias text,
  atividades_opcionais text,
  segmentos_turisticos text,
  quantidade_veiculos text,
  quantidade_embarcacoes text,
  embarcacoes_cruzeiro_maritimo text,
  embarcacoes_cruzeiro_fluvial text,
  -- contato
  telefone_institucional text,
  telefone_comercial text,
  email_institucional text,
  email_comercial text,
  email_usuario_administrador text,
  website text,
  endereco_receita_federal text,
  endereco_comercial text,
  -- localização
  uf text,
  municipio text,
  -- datas / documentos PF
  data_abertura text,
  data_nascimento text,
  sexo text,
  nacionalidade text,
  documento_identificacao text,
  carteira_estrangeiro text,
  orgao_expedidor text,
  validade text,
  data_validade text,
  tipo_sanguineo text,
  possui_empregado text,
  unique (numero_certificado, categoria)
);

comment on table public.cadastur_prestadores is
  'Base pública Cadastur (MTur/dados.turismo.gov.br): guias de turismo (PF/PJ) e agências. Contém dados pessoais — acesso somente via service role.';

alter table public.cadastur_prestadores enable row level security;

create index cadastur_prestadores_categoria_idx
  on public.cadastur_prestadores (categoria);
create index cadastur_prestadores_uf_municipio_idx
  on public.cadastur_prestadores (uf, municipio);
