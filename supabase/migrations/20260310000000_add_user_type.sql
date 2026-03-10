-- ============================================================
-- Migration: add_user_type
-- Cria a tabela public.profiles com enum user_type_enum.
-- Trigger automático em auth.users para criar profile no signup.
-- Proteção contra promoção indevida para ADMIN via app.
-- ============================================================

-- ── 1. Enum user_type_enum ───────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type_enum') THEN
    CREATE TYPE user_type_enum AS ENUM ('PF', 'PJ', 'ADMIN');
  END IF;
END$$;

-- ── 2. Tabela public.profiles ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  email       TEXT,
  user_type   user_type_enum NOT NULL DEFAULT 'PF',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- ── 3. Row Level Security ────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas o próprio perfil
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuário pode atualizar o próprio perfil (exceto user_type — vide trigger)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── 4. Trigger: criar profile automaticamente no signup ──────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER          -- roda como superuser, passa pelo RLS
SET search_path = public
AS $$
DECLARE
  v_user_type user_type_enum;
BEGIN
  -- Mapeia o campo "tipo" dos metadados do signup para o enum
  -- "pj" → PJ | qualquer outro (pf, null, Google OAuth) → PF
  IF lower(NEW.raw_user_meta_data->>'tipo') = 'pj' THEN
    v_user_type := 'PJ';
  ELSE
    v_user_type := 'PF';
  END IF;

  INSERT INTO public.profiles (id, email, user_type)
  VALUES (NEW.id, NEW.email, v_user_type)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- ── 5. Trigger: bloquear promoção para ADMIN via app ─────────
-- Impede que qualquer UPDATE via aplicação altere user_type para ADMIN.
-- Para promover um ADMIN, use o script scripts/make_admin.sql.
CREATE OR REPLACE FUNCTION public.prevent_admin_promotion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_type = 'ADMIN' AND OLD.user_type <> 'ADMIN' THEN
    RAISE EXCEPTION
      'Promoção para ADMIN deve ser feita diretamente no banco (scripts/make_admin.sql).';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_admin_promotion ON public.profiles;
CREATE TRIGGER trg_prevent_admin_promotion
  BEFORE UPDATE OF user_type ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_promotion();

-- ── 6. Backfill: garantir que registros antigos tenham user_type ─
-- Se já existem rows em public.profiles sem user_type (improvável com NOT NULL + DEFAULT),
-- este UPDATE garante que nenhuma row fique sem valor.
UPDATE public.profiles
SET user_type = 'PF'
WHERE user_type IS NULL;

-- ── FIM DA MIGRATION ─────────────────────────────────────────
