-- ==============================================================================
-- ADOTE PET — REVISÃO: CONTA PJ = ORGANIZAÇÃO
-- Drop de Tabelas Antigas e Extensão da Tabela Profiles
-- ==============================================================================

-- 1. DROP DAS TABELAS REDUNDANTES (Rollback da versão desconectada da regra)
DROP TABLE IF EXISTS public.pet_activity_logs CASCADE;
DROP TABLE IF EXISTS public.adoptions CASCADE;
DROP TABLE IF EXISTS public.pets CASCADE;
DROP TABLE IF EXISTS public.organization_invites CASCADE;
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- Algumas tipagens que podem ter ficado
DROP TYPE IF EXISTS org_role CASCADE;
DROP TYPE IF EXISTS member_status CASCADE;
DROP TYPE IF EXISTS invite_status CASCADE;
DROP TYPE IF EXISTS pet_status CASCADE;
DROP TYPE IF EXISTS adoption_status CASCADE;

-- 2. EXTENSÃO DA TABELA PROFILES (A conta PJ carrega a organização)
-- Adicionamos as colunas institucionais na tabela profiles existente
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cnpj VARCHAR(14) UNIQUE,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS fantasy_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS org_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS total_capacity INTEGER DEFAULT 0;

-- 3. ATUALIZAÇÃO DA TRIGGER DE CADASTRO
-- O Profile agora já apanha os raw_user_meta_data da Conta PJ no Sign Up (RegisterForm)
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
BEGIN
  IF lower(NEW.raw_user_meta_data->>'tipo') = 'pj' THEN
    v_user_type := 'PJ';
    v_cnpj := NEW.raw_user_meta_data->>'cnpj';
    v_company_name := NEW.raw_user_meta_data->>'nome_organizacao';
    v_fantasy_name := NEW.raw_user_meta_data->>'nome_fantasia';
    v_org_type := NEW.raw_user_meta_data->>'tipo_organizacao';
  ELSE
    v_user_type := 'PF';
  END IF;

  INSERT INTO public.profiles (id, email, user_type, cnpj, company_name, fantasy_name, org_type)
  VALUES (NEW.id, NEW.email, v_user_type, v_cnpj, v_company_name, v_fantasy_name, v_org_type)
  ON CONFLICT (id) DO UPDATE 
  SET 
    cnpj = EXCLUDED.cnpj,
    company_name = EXCLUDED.company_name,
    fantasy_name = EXCLUDED.fantasy_name,
    org_type = EXCLUDED.org_type;

  RETURN NEW;
END;
$$;


-- 4. MEMBROS DA EQUIPE (team_members)
-- Relaciona usuários PF (pf_id) às contas PJ (pj_id) operacionais
CREATE TYPE team_role AS ENUM ('admin', 'member');
CREATE TYPE team_member_status AS ENUM ('invited', 'active');

CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pj_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pf_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role team_role DEFAULT 'member',
    status team_member_status DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.team_members ADD CONSTRAINT unique_team_member UNIQUE (pj_id, pf_id);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;


-- 5. CONVITES DA EQUIPE (team_invites)
CREATE TYPE team_invite_status AS ENUM ('pending', 'accepted', 'expired');

CREATE TABLE public.team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pj_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email VARCHAR(100) NOT NULL,
    token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    role team_role DEFAULT 'member',
    status team_invite_status DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '7 days',
    created_by UUID REFERENCES auth.users(id), -- Quem enviou o convite
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;


-- 6. PETS
-- Agora diretamente vinculados ao pj_id (conta da ONG)
CREATE TYPE pet_status AS ENUM ('available', 'in_progress', 'adopted');

CREATE TABLE public.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pj_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    status pet_status DEFAULT 'available',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;


-- 7. ADOÇÕES / ANDAMENTOS
CREATE TYPE adoption_status AS ENUM ('started', 'interview', 'document_analysis', 'visit_scheduled', 'completed', 'cancelled');

CREATE TABLE public.adoptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE RESTRICT,
    pj_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    adopter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- PF
    
    status adoption_status DEFAULT 'started',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.adoptions ENABLE ROW LEVEL SECURITY;


-- 8. ATIVIDADES RECENTES (Logs)
CREATE TABLE public.pet_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pj_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    
    action VARCHAR(100) NOT NULL,
    related_person VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pet_activity_logs ENABLE ROW LEVEL SECURITY;


-- 9. ÍNDICES ADICIONAIS PARA PERFORMANCE
CREATE INDEX idx_team_members_pf ON public.team_members(pf_id);
CREATE INDEX idx_pets_pj_id ON public.pets(pj_id);
CREATE INDEX idx_adoptions_pj_id ON public.adoptions(pj_id);
CREATE INDEX idx_logs_pj_id ON public.pet_activity_logs(pj_id);
CREATE INDEX idx_logs_pet_id ON public.pet_activity_logs(pet_id);
