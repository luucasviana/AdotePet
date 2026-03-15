-- ==============================================================================
-- ADOTE PET — Adoption Flow
-- Criação da tabela adoptions, índices, RLS e triggers de negócio
-- ==============================================================================

-- ==============================================================================
-- 1. Adicionar campo adopted_adoption_id na tabela pets
-- ==============================================================================
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS adopted_adoption_id UUID;

-- ==============================================================================
-- 2. TABELA: public.adoptions
-- ==============================================================================
CREATE TABLE public.adoptions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  pet_id              UUID        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  adopter_user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_account_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  status              TEXT        NOT NULL DEFAULT 'interview',

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  created_by_user_id  UUID        NOT NULL REFERENCES public.profiles(id),
  updated_by_user_id  UUID        REFERENCES public.profiles(id),

  cancel_reason       TEXT,
  finished_at         TIMESTAMPTZ,

  CONSTRAINT chk_adoption_status CHECK (
    status IN ('interview', 'visit_scheduled', 'adopted', 'cancelled')
  )
);

-- ==============================================================================
-- 3. Índices de performance
-- ==============================================================================
CREATE INDEX idx_adoptions_pet_id           ON public.adoptions(pet_id);
CREATE INDEX idx_adoptions_adopter_user_id  ON public.adoptions(adopter_user_id);
CREATE INDEX idx_adoptions_owner_account_id ON public.adoptions(owner_account_id);
CREATE INDEX idx_adoptions_status           ON public.adoptions(status);
CREATE INDEX idx_adoptions_created_at       ON public.adoptions(created_at DESC);

-- ==============================================================================
-- 4. Trava de Duplicidade Ativa
-- Somente uma adoção ativa (interview ou visit_scheduled) por pet + adotante
-- ==============================================================================
CREATE UNIQUE INDEX uq_adoptions_active_per_pet_adopter
  ON public.adoptions(pet_id, adopter_user_id)
  WHERE status IN ('interview', 'visit_scheduled');

-- ==============================================================================
-- 5. Trigger: atualizar updated_at automaticamente
-- ==============================================================================
CREATE TRIGGER trg_adoptions_updated_at
  BEFORE UPDATE ON public.adoptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 6. Trigger: efeitos colaterais ao mudar status
--    - cancelled  → preenche finished_at
--    - adopted    → preenche finished_at, atualiza o pet e cancela outras adoções ativas
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_adoption_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Transições permitidas
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'adopted' AND NEW.status != 'adopted' THEN
    RAISE EXCEPTION 'Adoção já concluída não pode ser revertida.';
  END IF;

  IF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
    RAISE EXCEPTION 'Adoção já cancelada não pode ser reativada.';
  END IF;

  -- Transições permitidas explicitamente
  IF NOT (
    (OLD.status = 'interview'       AND NEW.status IN ('visit_scheduled', 'adopted', 'cancelled')) OR
    (OLD.status = 'visit_scheduled' AND NEW.status IN ('adopted', 'cancelled'))
  ) THEN
    RAISE EXCEPTION 'Transição de status inválida: % → %', OLD.status, NEW.status;
  END IF;

  -- Efeitos ao cancelar
  IF NEW.status = 'cancelled' THEN
    NEW.finished_at = now();
  END IF;

  -- Efeitos ao concluir adoção
  IF NEW.status = 'adopted' THEN
    NEW.finished_at = now();

    -- Atualizar o pet para adopted e vincular esta adoção
    UPDATE public.pets
    SET
      status                = 'adopted',
      adopted_at            = now(),
      adopted_adoption_id   = NEW.id
    WHERE id = NEW.pet_id;

    -- Cancelar outras adoções ativas do mesmo pet (exceto esta)
    UPDATE public.adoptions
    SET
      status      = 'cancelled',
      updated_at  = now(),
      finished_at = now(),
      cancel_reason = 'Pet adotado por outro interessado.'
    WHERE
      pet_id = NEW.pet_id
      AND id != NEW.id
      AND status IN ('interview', 'visit_scheduled');
  END IF;

  -- Registrar evento no log do pet
  INSERT INTO public.pet_events (pet_id, event_type, actor_profile_id, metadata)
  VALUES (
    NEW.pet_id,
    CASE NEW.status
      WHEN 'visit_scheduled' THEN 'adoption_visit_scheduled'
      WHEN 'adopted'         THEN 'adoption_completed'
      WHEN 'cancelled'       THEN 'adoption_cancelled'
      ELSE 'adoption_status_changed'
    END,
    auth.uid(),
    jsonb_build_object(
      'adoption_id', NEW.id,
      'old_status',  OLD.status,
      'new_status',  NEW.status
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_adoption_status_change
  BEFORE UPDATE OF status ON public.adoptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_adoption_status_change();

-- ==============================================================================
-- 7. Trigger: registrar evento ao criar adoção (interesse)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_adoption_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.pet_events (pet_id, event_type, actor_profile_id, metadata)
  VALUES (
    NEW.pet_id,
    'adoption_interest_created',
    auth.uid(),
    jsonb_build_object(
      'adoption_id',      NEW.id,
      'adopter_user_id',  NEW.adopter_user_id,
      'status',           NEW.status
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_adoption_insert
  AFTER INSERT ON public.adoptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_adoption_insert();

-- ==============================================================================
-- 8. Atualizar política de insert de pet_events para aceitar adotante também
-- ==============================================================================
DROP POLICY IF EXISTS "pet_events_insert" ON public.pet_events;

CREATE POLICY "pet_events_insert"
  ON public.pet_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (
          p.created_by_profile_id   = auth.uid()
          OR p.responsible_profile_id = auth.uid()
        )
    )
    -- Permite a trigger SECURITY DEFINER inserir eventos de adoção (via adoptions trigger)
    OR current_setting('role') = 'service_role'
  );

-- ==============================================================================
-- 9. RLS: adoptions
-- ==============================================================================
ALTER TABLE public.adoptions ENABLE ROW LEVEL SECURITY;

-- SELECT: adotante envolvido OU responsável/gestor do pet
CREATE POLICY "adoptions_select"
  ON public.adoptions FOR SELECT
  USING (
    auth.uid() = adopter_user_id
    OR auth.uid() = owner_account_id
    OR EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (
          p.responsible_profile_id = auth.uid()
          OR p.created_by_profile_id = auth.uid()
        )
    )
    -- membros da equipe da ONG dona do pet
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.pj_id = owner_account_id
        AND tm.pf_id = auth.uid()
        AND tm.status = 'active'
    )
  );

-- INSERT: qualquer usuário autenticado PF que não seja o dono do pet e não seja PJ
CREATE POLICY "adoptions_insert"
  ON public.adoptions FOR INSERT
  WITH CHECK (
    auth.uid() = adopter_user_id
    AND auth.uid() = created_by_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (
          p.responsible_profile_id = auth.uid()
          OR p.created_by_profile_id = auth.uid()
        )
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
        AND pr.user_type = 'PJ'
    )
  );

-- UPDATE: apenas o responsável pelo pet (PJ dona ou membro da equipe com acesso)
CREATE POLICY "adoptions_update"
  ON public.adoptions FOR UPDATE
  USING (
    auth.uid() = owner_account_id
    OR EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND p.responsible_profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.pj_id = owner_account_id
        AND tm.pf_id = auth.uid()
        AND tm.status = 'active'
    )
  )
  WITH CHECK (
    auth.uid() = owner_account_id
    OR EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND p.responsible_profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.pj_id = owner_account_id
        AND tm.pf_id = auth.uid()
        AND tm.status = 'active'
    )
  );
