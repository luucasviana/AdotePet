-- ==============================================================================
-- ADOTE PET — partner_banners
-- Banners publicitários exibidos na Home PF pública
-- ==============================================================================

-- ── 1. Tabela ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partner_banners (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT,
  image_url        TEXT        NOT NULL,
  mobile_image_url TEXT,
  link_url         TEXT,
  link_type        TEXT        NOT NULL DEFAULT 'external',
  cta_label        TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  display_order    INTEGER     NOT NULL DEFAULT 0,
  starts_at        TIMESTAMPTZ,
  ends_at          TIMESTAMPTZ,
  target_audience  TEXT        NOT NULL DEFAULT 'pf_public',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Índices ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_partner_banners_is_active      ON public.partner_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_partner_banners_display_order  ON public.partner_banners(display_order);
CREATE INDEX IF NOT EXISTS idx_partner_banners_starts_at      ON public.partner_banners(starts_at);
CREATE INDEX IF NOT EXISTS idx_partner_banners_ends_at        ON public.partner_banners(ends_at);
CREATE INDEX IF NOT EXISTS idx_partner_banners_target         ON public.partner_banners(target_audience);

-- ── 3. Trigger: updated_at automático ────────────────────────────────────────
-- Reutiliza a função set_updated_at já criada na migration de pets
CREATE TRIGGER trg_partner_banners_updated_at
  BEFORE UPDATE ON public.partner_banners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE public.partner_banners ENABLE ROW LEVEL SECURITY;

-- SELECT público: qualquer usuário (anon/auth) pode ler banners ativos da home PF
CREATE POLICY "partner_banners_select_public"
  ON public.partner_banners FOR SELECT
  USING (
    is_active = true
    AND target_audience = 'pf_public'
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at   IS NULL OR ends_at   >= now())
  );

-- Sem INSERT/UPDATE/DELETE via app — gestão feita direto no Supabase Dashboard

-- ── FIM DA MIGRATION ──────────────────────────────────────────────────────────
