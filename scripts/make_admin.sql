-- ============================================================
-- Script: make_admin.sql
-- Promove um usuário para ADMIN diretamente no banco.
-- Rode este script MANUALMENTE no SQL Editor do Supabase.
-- NUNCA exponha este script ou credentials no frontend.
-- ============================================================

-- Substitua o valor abaixo pelo email ou UUID do usuário:
-- Exemplo por email:

BEGIN;

  -- 1. Desabilita temporariamente o trigger de proteção
  ALTER TABLE public.profiles
    DISABLE TRIGGER trg_prevent_admin_promotion;

  -- 2. Promove o usuário para ADMIN
  --    Substitua 'email@dominio.com' pelo email do usuário alvo:
  UPDATE public.profiles
  SET
    user_type  = 'ADMIN',
    updated_at = NOW()
  WHERE email = 'email@dominio.com';   -- ← altere aqui

  -- Alternativa por UUID (descomente se preferir):
  -- UPDATE public.profiles
  -- SET user_type = 'ADMIN', updated_at = NOW()
  -- WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

  -- 3. Reabilita o trigger de proteção
  ALTER TABLE public.profiles
    ENABLE TRIGGER trg_prevent_admin_promotion;

COMMIT;

-- ── Verificação ──────────────────────────────────────────────
-- Após rodar, confirme com:
-- SELECT id, email, user_type FROM public.profiles WHERE user_type = 'ADMIN';
