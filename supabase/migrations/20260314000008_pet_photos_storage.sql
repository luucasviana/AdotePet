-- ==============================================================================
-- ADOTE PET — Pet photos storage bucket
-- Cria o bucket de fotos de pets com acesso público de leitura
-- ==============================================================================

-- 1. Cria o bucket "pets" como público (se ainda não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pets', 'pets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Qualquer pessoa pode VER as fotos de pets (necessário para o catálogo público)
DROP POLICY IF EXISTS "Fotos de pets são públicas" ON storage.objects;
CREATE POLICY "Fotos de pets são públicas" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'pets');

-- 3. Usuário autenticado pode fazer UPLOAD de fotos de pets
DROP POLICY IF EXISTS "Upload de foto de pet pelo usuário autenticado" ON storage.objects;
CREATE POLICY "Upload de foto de pet pelo usuário autenticado" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'pets'
    AND auth.role() = 'authenticated'
  );

-- 4. Usuário autenticado pode DELETAR fotos que ele mesmo fez upload
DROP POLICY IF EXISTS "Deleção de foto de pet pelo usuário autenticado" ON storage.objects;
CREATE POLICY "Deleção de foto de pet pelo usuário autenticado" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'pets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
