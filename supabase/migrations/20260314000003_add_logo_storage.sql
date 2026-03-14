-- ==============================================================================
-- ADOTE PET — LOGO UPLOAD
-- Adiciona suporte a logo de perfil para contas PJ
-- ==============================================================================

-- 1. Adiciona coluna logo_url na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Cria o bucket de logos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas RLS para o bucket "logos"

-- Qualquer pessoa pode VER as logos (públicas)
CREATE POLICY "Logos são públicas" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'logos');

-- Usuário autenticado pode fazer UPLOAD no próprio folder (userId/*)
CREATE POLICY "Upload de logo pelo próprio usuário" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuário autenticado pode ATUALIZAR sua própria logo
CREATE POLICY "Atualização de logo pelo próprio usuário" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuário autenticado pode DELETAR sua própria logo
CREATE POLICY "Deleção de logo pelo próprio usuário" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
