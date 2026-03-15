-- ==============================================================================
-- ADOTE PET — PF PROFILE FIELDS & AVATARS
-- Adiciona campos específicos de pessoa física e cria bucket para foto de perfil
-- ==============================================================================

-- 1. Campos adicionais para Pessoa Física
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS social_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Atualizar a trigger de cadastro para capturar o nome do user_metadata da PF 
-- (Caso já venha completo de provedores ou do formulário)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type user_type_enum;
  v_cnpj VARCHAR(14);
  v_company_name VARCHAR(100);
  v_fantasy_name VARCHAR(100);
  v_org_type VARCHAR(50);
  v_full_name VARCHAR(100);
BEGIN
  IF lower(NEW.raw_user_meta_data->>'tipo') = 'pj' THEN
    v_user_type := 'PJ';
    v_cnpj := NEW.raw_user_meta_data->>'cnpj';
    v_company_name := NEW.raw_user_meta_data->>'nome_organizacao';
    v_fantasy_name := NEW.raw_user_meta_data->>'nome_fantasia';
    v_org_type := NEW.raw_user_meta_data->>'tipo_organizacao';
  ELSE
    v_user_type := 'PF';
    -- Tenta capturar "nome" (padrão do app) ou "full_name" (OAuth)
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name');
  END IF;

  INSERT INTO public.profiles (
    id, email, user_type, cnpj, company_name, fantasy_name, org_type, full_name
  )
  VALUES (
    NEW.id, NEW.email, v_user_type, v_cnpj, v_company_name, v_fantasy_name, v_org_type, v_full_name
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    cnpj = EXCLUDED.cnpj,
    company_name = EXCLUDED.company_name,
    fantasy_name = EXCLUDED.fantasy_name,
    org_type = EXCLUDED.org_type,
    full_name = EXCLUDED.full_name;

  RETURN NEW;
END;
$$;

-- 3. Cria o bucket de avatares PF (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Políticas RLS para o bucket "avatars"

-- Qualquer pessoa pode VER os avatares (públicos)
CREATE POLICY "Avatares são públicos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Usuário autenticado pode fazer UPLOAD no próprio folder (userId/*)
CREATE POLICY "Upload de avatar pelo próprio usuário" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuário autenticado pode ATUALIZAR seu próprio avatar
CREATE POLICY "Atualização de avatar pelo próprio usuário" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuário autenticado pode DELETAR seu próprio avatar
CREATE POLICY "Deleção de avatar pelo próprio usuário" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
