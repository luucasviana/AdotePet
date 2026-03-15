-- ==============================================================================
-- ADOTE PET — FIX: PROFILES PUBLIC READ
-- Permite que usuários autenticados possam ver os perfis uns dos outros
-- Necessário para buscar o telefone da ONG na adoção e os dados do adotante.
-- PJs são globalmente leituráveis, mesmo por usuários anônimos na vitrine.
-- ==============================================================================

-- A política existente "profiles_select_own" fica mantida, 
-- o Postgres soma as políticas com a cláusula OR.

CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_select_pj_anon"
  ON public.profiles FOR SELECT
  TO anon
  USING (user_type = 'PJ');
