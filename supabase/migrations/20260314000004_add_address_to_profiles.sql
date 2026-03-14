-- ==============================================================================
-- ADOTE PET — Adiciona campos de endereço à tabela profiles
-- Os dados de endereço da conta PJ vivem no mesmo registro profiles
-- (regra de negócio: conta PJ = organização)
-- ==============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cep             VARCHAR(8),
  ADD COLUMN IF NOT EXISTS address_state   VARCHAR(2),
  ADD COLUMN IF NOT EXISTS city            VARCHAR(100),
  ADD COLUMN IF NOT EXISTS neighborhood    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS street          VARCHAR(200),
  ADD COLUMN IF NOT EXISTS address_number  VARCHAR(20),
  ADD COLUMN IF NOT EXISTS complement      VARCHAR(100);
