-- ==============================================================================
-- LIMPEZA TOTAL DO BANCO DE DADOS (RESET DE TESTES)
-- CUIDADO: Este script apaga TODOS os usuários, perfis, pets e configurações.
-- Use apenas em ambiente de desenvolvimento/testes para recomeçar do zero.
-- ==============================================================================

-- 1. Esvaziar todas as tabelas transacionais e operacionais
-- O uso do CASCADE garante que qualquer dependência também seja limpa.
TRUNCATE TABLE public.pet_activity_logs CASCADE;
TRUNCATE TABLE public.adoptions CASCADE;
TRUNCATE TABLE public.pets CASCADE;
TRUNCATE TABLE public.team_invites CASCADE;
TRUNCATE TABLE public.team_members CASCADE;

-- 2. Esvaziar a tabela de Perfis
TRUNCATE TABLE public.profiles CASCADE;

-- 3. Apagar todas as contas de autenticação (Desloga todo mundo e remove os logins)
-- No Supabase SQL Editor, DELETE funciona melhor que TRUNCATE para o schema auth.
DELETE FROM auth.users;

-- Script concluído! O banco está limpo e pronto para novos cadastros de teste.
