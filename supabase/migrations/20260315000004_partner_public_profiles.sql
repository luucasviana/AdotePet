-- ==============================================================================
-- ADOTE PET — partner_public_profiles
-- Perfis públicos de parceiros do ecossistema pet
-- Categoria derivada de profiles.org_type (sem enum paralelo)
-- ==============================================================================

-- ── 1. Tabela ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partner_public_profiles (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       UUID        UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_published     BOOLEAN     NOT NULL DEFAULT false,
  slug             TEXT        UNIQUE NOT NULL,
  cover_image_url  TEXT,
  logo_image_url   TEXT,
  headline         TEXT,
  description      TEXT,
  services         JSONB,
  phone            TEXT,
  whatsapp         TEXT,
  instagram        TEXT,
  website          TEXT,
  city             TEXT,
  state            TEXT,
  display_order    INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Índices ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_partner_profiles_account_id    ON public.partner_public_profiles(account_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_slug          ON public.partner_public_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_is_published  ON public.partner_public_profiles(is_published);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_display_order ON public.partner_public_profiles(display_order);

-- ── 3. Trigger: updated_at automático ────────────────────────────────────────
CREATE TRIGGER trg_partner_profiles_updated_at
  BEFORE UPDATE ON public.partner_public_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE public.partner_public_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: qualquer usuário pode ler perfis publicados
CREATE POLICY "partner_profiles_select_published"
  ON public.partner_public_profiles FOR SELECT
  USING (is_published = true);

-- UPDATE: apenas a própria conta PJ pode atualizar seu perfil público
CREATE POLICY "partner_profiles_update_own"
  ON public.partner_public_profiles FOR UPDATE
  USING (auth.uid() = account_id)
  WITH CHECK (auth.uid() = account_id);

-- INSERT: conta PJ pode criar seu próprio perfil público
CREATE POLICY "partner_profiles_insert_own"
  ON public.partner_public_profiles FOR INSERT
  WITH CHECK (
    auth.uid() = account_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.user_type = 'PJ'
    )
  );

-- ── FIM DA MIGRATION ──────────────────────────────────────────────────────────
