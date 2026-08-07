-- Grupos de atividades do Proposal Builder: um "tour" pré-montado que, ao ser
-- clicado no builder, expande em suas atividades individuais no dia. O grupo é
-- só um atalho de montagem — a proposta salva continua referenciando cada
-- atividade separadamente, e nada muda no preço, PDF ou link público.
-- Ferramenta interna do admin: o nome não é traduzido nem aparece pro cliente.

CREATE TABLE proposal_service_groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE proposal_service_group_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    uuid NOT NULL REFERENCES proposal_service_groups(id) ON DELETE CASCADE,
  service_id  uuid NOT NULL REFERENCES proposal_services(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0,
  UNIQUE (group_id, service_id)
);

CREATE INDEX idx_service_group_items_group ON proposal_service_group_items(group_id);

ALTER TABLE proposal_service_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_service_group_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only" ON proposal_service_groups
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "admin_only" ON proposal_service_group_items
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
