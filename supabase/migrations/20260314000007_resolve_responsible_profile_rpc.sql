-- ==============================================================================
-- ADOTE PET — Resolve Responsible Profile RPC
-- Função segura (SECURITY DEFINER) para identificar o perfil responsável
-- ao cadastrar ou gerenciar um pet, contornando a RLS restrita de profiles.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.resolve_responsible_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_uid UUID;
  v_creator_type VARCHAR;
  v_responsible_id UUID;
  v_responsible_profile RECORD;
BEGIN
  -- 1. Pega o ID do usuário autenticado
  v_auth_uid := auth.uid();
  IF v_auth_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  -- 2. Busca o tipo do perfil de quem está logado
  SELECT user_type INTO v_creator_type
  FROM public.profiles
  WHERE id = v_auth_uid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil do usuário criador não encontrado.';
  END IF;

  -- 3. Descobre quem é o responsável real
  v_responsible_id := v_auth_uid;

  IF v_creator_type = 'PF' THEN
    -- Verifica se está vinculado ativo a alguma PJ
    SELECT pj_id INTO v_responsible_id
    FROM public.team_members
    WHERE pf_id = v_auth_uid AND status = 'active'
    LIMIT 1;
    
    -- Se não encontrar, v_responsible_id continua sendo v_auth_uid (PF independente)
    IF v_responsible_id IS NULL THEN
      v_responsible_id := v_auth_uid;
    END IF;
  END IF;

  -- 4. Busca os dados do perfil responsável
  SELECT 
    id, user_type, company_name, fantasy_name, email,
    cep, address_state, city, neighborhood, street, address_number, complement
  INTO v_responsible_profile
  FROM public.profiles
  WHERE id = v_responsible_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil responsável não encontrado no banco de dados.';
  END IF;

  -- 5. Retorna tudo como JSONB estruturado
  RETURN jsonb_build_object(
    'creator_id', v_auth_uid,
    'responsible_id', v_responsible_profile.id,
    'user_type', v_responsible_profile.user_type,
    'company_name', v_responsible_profile.company_name,
    'fantasy_name', v_responsible_profile.fantasy_name,
    'email', v_responsible_profile.email,
    'cep', v_responsible_profile.cep,
    'address_state', v_responsible_profile.address_state,
    'city', v_responsible_profile.city,
    'neighborhood', v_responsible_profile.neighborhood,
    'street', v_responsible_profile.street,
    'address_number', v_responsible_profile.address_number,
    'complement', v_responsible_profile.complement
  );
END;
$$;
