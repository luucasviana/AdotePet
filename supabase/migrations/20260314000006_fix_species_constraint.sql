-- ==============================================================================
-- ADOTE PET — Fix species CHECK constraint
-- Amplia os valores aceitos de ('dog','cat') para ('dog','cat','bird','reptile')
-- ==============================================================================

-- 1. Remover o constraint antigo
ALTER TABLE public.pets
  DROP CONSTRAINT IF EXISTS chk_pets_species;

-- 2. Adicionar o constraint atualizado com os 4 valores de espécie
ALTER TABLE public.pets
  ADD CONSTRAINT chk_pets_species
  CHECK (species IN ('dog', 'cat', 'bird', 'reptile'));
