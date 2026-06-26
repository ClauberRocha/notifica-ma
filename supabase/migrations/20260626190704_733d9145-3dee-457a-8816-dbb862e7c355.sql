
-- ============================================================
-- CRÍTICO 1: Endurecer RLS das 14 tabelas *_cases
--   - SELECT: mantém visível a autenticados (decisão de produto)
--   - INSERT: precisa de user_id = auth.uid()
--   - UPDATE: dono OU admin OU gestor
--   - DELETE: apenas admin
-- ============================================================

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'coqueluche_cases','dengue_chikungunya_cases','difteria_cases',
    'epizootia_cases','exantematica_cases','febre_amarela_cases',
    'hanseniase_cases','meningite_cases','raiva_humana_cases',
    'srag_cases','surto_dta_cases','tetano_acidental_cases',
    'tetano_neonatal_cases','tuberculose_cases'
  ];
  pol record;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- limpa políticas existentes
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname='public' AND tablename=t
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
    END LOOP;

    -- SELECT: qualquer autenticado (mantém decisão de produto)
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)',
      t || '_select_authenticated', t
    );

    -- INSERT: precisa cravar user_id = auth.uid()
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)',
      t || '_insert_own', t
    );

    -- UPDATE: dono OU admin OU gestor
    EXECUTE format($p$
      CREATE POLICY %I ON public.%I
      FOR UPDATE TO authenticated
      USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','gestor'))
      )
      WITH CHECK (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','gestor'))
      )
    $p$, t || '_update_owner_or_staff', t);

    -- DELETE: apenas admin
    EXECUTE format($p$
      CREATE POLICY %I ON public.%I
      FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
    $p$, t || '_delete_admin_only', t);
  END LOOP;
END $$;

-- ============================================================
-- CRÍTICO 3: Trigger que impede remover o último administrador
-- (corrige race condition do check "count(admin) <= 1" feito
-- no application code de updateUser/deleteUser)
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_last_admin_removal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count int;
BEGIN
  IF TG_OP = 'DELETE' AND OLD.role = 'admin' THEN
    SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Operação negada: é necessário pelo menos 1 administrador no sistema.'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.role = 'admin' AND NEW.role <> 'admin' THEN
    SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Operação negada: é necessário pelo menos 1 administrador no sistema.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_last_admin_removal ON public.user_roles;
CREATE TRIGGER trg_prevent_last_admin_removal
  BEFORE DELETE OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_last_admin_removal();
