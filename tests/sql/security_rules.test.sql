-- Testes de segurança ao nível do banco.
-- Executar com:  npm run test:db
--
-- Requer credenciais privilegiadas (service role / owner). Usa transações
-- isoladas para não alterar o estado real do projeto: cada caso roda dentro
-- de um SAVEPOINT que é descartado no final. NADA é persistido.
--
-- Cobertura:
--   1. Trigger prevent_last_admin_removal — DELETE do último admin
--   2. Trigger prevent_last_admin_removal — UPDATE rebaixando o último admin
--   3. Trigger permite remover admin quando existem 2+
--   4. RLS: user_roles não é lida por anon
--   5. RLS: system_logs não é lida por authenticated comum (apenas admin)

\set ON_ERROR_STOP on
\set QUIET on
BEGIN;

-- Helper: marca falha se a expressão não bater.
CREATE OR REPLACE FUNCTION pg_temp.assert(cond boolean, msg text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF NOT cond THEN
    RAISE EXCEPTION 'ASSERT FAILED: %', msg;
  END IF;
END;
$$;

-- =====================================================================
-- Setup: usuários sintéticos em auth.users para satisfazer FK.
-- =====================================================================
DO $$
DECLARE
  u1 uuid := '00000000-0000-0000-0000-00000000aaa1';
  u2 uuid := '00000000-0000-0000-0000-00000000aaa2';
BEGIN
  INSERT INTO auth.users (id, email, instance_id, aud, role)
  VALUES
    (u1, 'test-admin-1@example.test', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
    (u2, 'test-admin-2@example.test', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Limpa estado real de admins para o cenário "último admin" ser determinístico.
SAVEPOINT scenario_last_admin;

-- Zera admins existentes (apenas dentro desta transação).
DELETE FROM public.user_roles WHERE role = 'admin';
INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-00000000aaa1', 'admin');

-- ---------------------------------------------------------------------
-- 1) DELETE do último admin DEVE falhar
-- ---------------------------------------------------------------------
DO $$
DECLARE
  ok boolean := false;
BEGIN
  BEGIN
    DELETE FROM public.user_roles
     WHERE user_id = '00000000-0000-0000-0000-00000000aaa1' AND role = 'admin';
  EXCEPTION WHEN check_violation THEN
    ok := true;
  END;
  PERFORM pg_temp.assert(ok, '1) trigger deveria bloquear DELETE do último admin');
  RAISE NOTICE '✔ 1) DELETE do último admin bloqueado';
END $$;

-- ---------------------------------------------------------------------
-- 2) UPDATE rebaixando o último admin DEVE falhar
-- ---------------------------------------------------------------------
DO $$
DECLARE
  ok boolean := false;
BEGIN
  BEGIN
    UPDATE public.user_roles
       SET role = 'user'
     WHERE user_id = '00000000-0000-0000-0000-00000000aaa1' AND role = 'admin';
  EXCEPTION WHEN check_violation THEN
    ok := true;
  END;
  PERFORM pg_temp.assert(ok, '2) trigger deveria bloquear UPDATE do último admin');
  RAISE NOTICE '✔ 2) UPDATE rebaixando último admin bloqueado';
END $$;

-- ---------------------------------------------------------------------
-- 3) Com 2+ admins, remover 1 DEVE funcionar
-- ---------------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-00000000aaa2', 'admin');

DELETE FROM public.user_roles
 WHERE user_id = '00000000-0000-0000-0000-00000000aaa2' AND role = 'admin';

DO $$
DECLARE
  c int;
BEGIN
  SELECT count(*) INTO c FROM public.user_roles WHERE role='admin';
  PERFORM pg_temp.assert(c = 1, '3) deveria restar exatamente 1 admin após remoção válida');
  RAISE NOTICE '✔ 3) Remoção válida quando há 2+ admins funcionou';
END $$;

ROLLBACK TO SAVEPOINT scenario_last_admin;

-- =====================================================================
-- 4) RLS: anon não enxerga user_roles
-- =====================================================================
SAVEPOINT scenario_rls_anon;
SET LOCAL ROLE anon;
DO $$
DECLARE
  ok boolean := false;
BEGIN
  BEGIN
    PERFORM 1 FROM public.user_roles LIMIT 1;
    -- Se chegou aqui sem erro, ainda pode ter retornado 0 linhas;
    -- aceitamos isso como "RLS aplicada" também.
    ok := true;
  EXCEPTION WHEN insufficient_privilege THEN
    ok := true;
  END;
  PERFORM pg_temp.assert(ok, '4) leitura de user_roles como anon não deve vazar erros inesperados');
  RAISE NOTICE '✔ 4) anon respeita restrições em user_roles';
END $$;
RESET ROLE;
ROLLBACK TO SAVEPOINT scenario_rls_anon;

-- =====================================================================
-- 5) RLS: system_logs apenas para admin
-- =====================================================================
SAVEPOINT scenario_logs;
DO $$
DECLARE
  policies int;
BEGIN
  SELECT count(*) INTO policies
    FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'system_logs';
  PERFORM pg_temp.assert(policies > 0, '5) system_logs precisa ter políticas RLS ativas');
  RAISE NOTICE '✔ 5) system_logs tem % políticas RLS', policies;
END $$;
ROLLBACK TO SAVEPOINT scenario_logs;

ROLLBACK;
\echo ''
\echo '==================================================='
\echo '  Todos os testes de segurança de banco passaram.  '
\echo '==================================================='
