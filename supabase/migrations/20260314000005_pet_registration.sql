-- ==============================================================================
-- ADOTE PET — Pet Registration
-- Dropa tabelas legadas e cria a modelagem completa de pets
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DROP DAS TABELAS E TIPOS LEGADOS (criados na migration 20260314000001)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.pet_activity_logs CASCADE;
DROP TABLE IF EXISTS public.adoptions          CASCADE;
DROP TABLE IF EXISTS public.pets               CASCADE;

DROP TYPE IF EXISTS pet_status      CASCADE;
DROP TYPE IF EXISTS adoption_status CASCADE;


-- ==============================================================================
-- 2. HELPER: trigger reutilizável para updated_at
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ==============================================================================
-- 3. TABELA PRINCIPAL: public.pets
-- ==============================================================================
CREATE TABLE public.pets (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quem executou o cadastro vs. quem é o responsável real
  created_by_profile_id UUID        NOT NULL REFERENCES public.profiles(id),
  responsible_profile_id UUID       NOT NULL REFERENCES public.profiles(id),

  -- Dados principais do pet
  name                  VARCHAR(120) NOT NULL,
  species               VARCHAR(20)  NOT NULL,
  sex                   VARCHAR(20)  NOT NULL,
  size                  VARCHAR(20)  NOT NULL,
  breed                 VARCHAR(120) NOT NULL,
  age_range             VARCHAR(40)  NOT NULL,
  neutered_status       VARCHAR(20)  NOT NULL,
  description           TEXT,

  -- Status do pet
  status                VARCHAR(20)  NOT NULL DEFAULT 'available',
  adopted_at            TIMESTAMPTZ,
  removed_at            TIMESTAMPTZ,
  removal_reason        TEXT,

  -- Snapshot do endereço do responsável no momento do cadastro
  cep                   VARCHAR(8),
  address_state         VARCHAR(2),
  city                  VARCHAR(100),
  neighborhood          VARCHAR(100),
  street                VARCHAR(200),
  address_number        VARCHAR(20),
  complement            VARCHAR(100),

  -- Controle
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- CHECK constraints (enums via VARCHAR)
  CONSTRAINT chk_pets_species         CHECK (species         IN ('dog', 'cat')),
  CONSTRAINT chk_pets_sex             CHECK (sex             IN ('male', 'female')),
  CONSTRAINT chk_pets_size            CHECK (size            IN ('mini', 'small', 'medium', 'large')),
  CONSTRAINT chk_pets_age_range       CHECK (age_range       IN (
                                         'up_to_1_year',
                                         'from_1_to_3_years',
                                         'from_3_to_6_years',
                                         'over_6_years'
                                       )),
  CONSTRAINT chk_pets_neutered_status CHECK (neutered_status IN ('yes', 'no', 'unknown')),
  CONSTRAINT chk_pets_status          CHECK (status          IN ('available', 'adopted', 'removed'))
);

-- Trigger updated_at
CREATE TRIGGER trg_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Índices
CREATE INDEX idx_pets_responsible_profile_id ON public.pets(responsible_profile_id);
CREATE INDEX idx_pets_created_by_profile_id  ON public.pets(created_by_profile_id);
CREATE INDEX idx_pets_status                 ON public.pets(status);
CREATE INDEX idx_pets_species                ON public.pets(species);
CREATE INDEX idx_pets_size                   ON public.pets(size);
CREATE INDEX idx_pets_created_at             ON public.pets(created_at DESC);

-- RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode ver pets disponíveis
CREATE POLICY "pets_select_available"
  ON public.pets FOR SELECT
  USING (status = 'available');

-- O responsável e quem criou podem ver todos os pets (inclusive adopted/removed)
CREATE POLICY "pets_select_own"
  ON public.pets FOR SELECT
  USING (
    auth.uid() = responsible_profile_id
    OR auth.uid() = created_by_profile_id
  );

-- Somente o responsável pode inserir pets (a action usa SECURITY DEFINER para contornar isso se necessário)
CREATE POLICY "pets_insert"
  ON public.pets FOR INSERT
  WITH CHECK (auth.uid() = created_by_profile_id);

-- Somente o responsável pode atualizar
CREATE POLICY "pets_update"
  ON public.pets FOR UPDATE
  USING (auth.uid() = responsible_profile_id)
  WITH CHECK (auth.uid() = responsible_profile_id);


-- ==============================================================================
-- 4. TABELA: public.pet_photos
-- ==============================================================================
CREATE TABLE public.pet_photos (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id      UUID    NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  file_url    TEXT    NOT NULL,
  sort_order  INTEGER NOT NULL,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_pet_photos_sort_order UNIQUE (pet_id, sort_order)
);

-- Garante exatamente 1 foto principal por pet no nível de banco
CREATE UNIQUE INDEX uq_pet_photos_primary
  ON public.pet_photos(pet_id)
  WHERE is_primary = true;

CREATE INDEX idx_pet_photos_pet_id ON public.pet_photos(pet_id);

-- RLS: acompanha a visibilidade do pet
ALTER TABLE public.pet_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pet_photos_select"
  ON public.pet_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (
          p.status = 'available'
          OR p.responsible_profile_id = auth.uid()
          OR p.created_by_profile_id  = auth.uid()
        )
    )
  );

CREATE POLICY "pet_photos_insert"
  ON public.pet_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND p.created_by_profile_id = auth.uid()
    )
  );


-- ==============================================================================
-- 5. CATÁLOGO: public.pet_colors
-- ==============================================================================
CREATE TABLE public.pet_colors (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key        VARCHAR(40) NOT NULL UNIQUE,
  label      VARCHAR(60) NOT NULL,
  hex        VARCHAR(7)  NOT NULL,
  sort_order INTEGER     NOT NULL,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leitura pública do catálogo
ALTER TABLE public.pet_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pet_colors_select_all"
  ON public.pet_colors FOR SELECT
  USING (true);

-- Seed: 10 cores
INSERT INTO public.pet_colors (key, label, hex, sort_order) VALUES
  ('branco',   'Branco',   '#FFFFFF', 1),
  ('preto',    'Preto',    '#1F1F1F', 2),
  ('cinza',    'Cinza',    '#9CA3AF', 3),
  ('marrom',   'Marrom',   '#6B4F3A', 4),
  ('bege',     'Bege',     '#D6C2A1', 5),
  ('creme',    'Creme',    '#F3E7C9', 6),
  ('caramelo', 'Caramelo', '#C68642', 7),
  ('dourado',  'Dourado',  '#D4AF37', 8),
  ('amarelo',  'Amarelo',  '#F4C542', 9),
  ('laranja',  'Laranja',  '#E67E22', 10);


-- ==============================================================================
-- 6. RELAÇÃO: public.pet_color_assignments
-- ==============================================================================
CREATE TABLE public.pet_color_assignments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id     UUID        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  color_id   UUID        NOT NULL REFERENCES public.pet_colors(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_pet_color_assignments UNIQUE (pet_id, color_id)
);

CREATE INDEX idx_pet_color_assignments_pet_id ON public.pet_color_assignments(pet_id);

ALTER TABLE public.pet_color_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pet_color_assignments_select"
  ON public.pet_color_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (
          p.status = 'available'
          OR p.responsible_profile_id = auth.uid()
          OR p.created_by_profile_id  = auth.uid()
        )
    )
  );

CREATE POLICY "pet_color_assignments_insert"
  ON public.pet_color_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND p.created_by_profile_id = auth.uid()
    )
  );


-- ==============================================================================
-- 7. CATÁLOGO: public.pet_traits
-- ==============================================================================
CREATE TABLE public.pet_traits (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key        VARCHAR(40) NOT NULL UNIQUE,
  label      VARCHAR(60) NOT NULL,
  sort_order INTEGER     NOT NULL,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pet_traits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pet_traits_select_all"
  ON public.pet_traits FOR SELECT
  USING (true);

-- Seed: 16 traits (ordem alfabética)
INSERT INTO public.pet_traits (key, label, sort_order) VALUES
  ('ativo',        'Ativo',        1),
  ('amoroso',      'Amoroso',      2),
  ('brincalhao',   'Brincalhão',   3),
  ('calmo',        'Calmo',        4),
  ('carinhoso',    'Carinhoso',    5),
  ('confiante',    'Confiante',    6),
  ('curioso',      'Curioso',      7),
  ('docil',        'Dócil',        8),
  ('independente', 'Independente', 9),
  ('medroso',      'Medroso',      10),
  ('obediente',    'Obediente',    11),
  ('protetor',     'Protetor',     12),
  ('reservado',    'Reservado',    13),
  ('sociavel',     'Sociável',     14),
  ('territorial',  'Territorial',  15),
  ('timido',       'Tímido',       16);


-- ==============================================================================
-- 8. RELAÇÃO: public.pet_trait_assignments
-- ==============================================================================
CREATE TABLE public.pet_trait_assignments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id     UUID        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  trait_id   UUID        NOT NULL REFERENCES public.pet_traits(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_pet_trait_assignments UNIQUE (pet_id, trait_id)
);

CREATE INDEX idx_pet_trait_assignments_pet_id ON public.pet_trait_assignments(pet_id);

ALTER TABLE public.pet_trait_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pet_trait_assignments_select"
  ON public.pet_trait_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (
          p.status = 'available'
          OR p.responsible_profile_id = auth.uid()
          OR p.created_by_profile_id  = auth.uid()
        )
    )
  );

CREATE POLICY "pet_trait_assignments_insert"
  ON public.pet_trait_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND p.created_by_profile_id = auth.uid()
    )
  );


-- ==============================================================================
-- 9. TABELA: public.pet_events
-- ==============================================================================
CREATE TABLE public.pet_events (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id            UUID        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  event_type        VARCHAR(50) NOT NULL,
  actor_profile_id  UUID        REFERENCES public.profiles(id),
  metadata          JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pet_events_pet_created      ON public.pet_events(pet_id, created_at DESC);
CREATE INDEX idx_pet_events_event_type        ON public.pet_events(event_type);
CREATE INDEX idx_pet_events_actor_profile_id  ON public.pet_events(actor_profile_id);

ALTER TABLE public.pet_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pet_events_select"
  ON public.pet_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (
          p.status = 'available'
          OR p.responsible_profile_id = auth.uid()
          OR p.created_by_profile_id  = auth.uid()
        )
    )
  );

CREATE POLICY "pet_events_insert"
  ON public.pet_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND p.created_by_profile_id = auth.uid()
    )
  );
