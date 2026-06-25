-- Drop old owner-only policies and create updated RLS policies for case tables
-- to allow all authenticated users to read all notifications/fichas.

-- 1. coqueluche_cases
DROP POLICY IF EXISTS "Users manage own cases" ON public.coqueluche_cases;
CREATE POLICY "All authenticated can read coqueluche_cases" ON public.coqueluche_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own coqueluche_cases" ON public.coqueluche_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update coqueluche_cases" ON public.coqueluche_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete coqueluche_cases" ON public.coqueluche_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. dengue_chikungunya_cases
DROP POLICY IF EXISTS "Users manage own dengue/chik cases" ON public.dengue_chikungunya_cases;
CREATE POLICY "All authenticated can read dengue_chikungunya_cases" ON public.dengue_chikungunya_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own dengue_chikungunya_cases" ON public.dengue_chikungunya_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update dengue_chikungunya_cases" ON public.dengue_chikungunya_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete dengue_chikungunya_cases" ON public.dengue_chikungunya_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. difteria_cases
DROP POLICY IF EXISTS "Users manage their own difteria cases" ON public.difteria_cases;
CREATE POLICY "All authenticated can read difteria_cases" ON public.difteria_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own difteria_cases" ON public.difteria_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update difteria_cases" ON public.difteria_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete difteria_cases" ON public.difteria_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. epizootia_cases
DROP POLICY IF EXISTS "Users manage their own epizootia cases" ON public.epizootia_cases;
CREATE POLICY "All authenticated can read epizootia_cases" ON public.epizootia_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own epizootia_cases" ON public.epizootia_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update epizootia_cases" ON public.epizootia_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete epizootia_cases" ON public.epizootia_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. exantematica_cases
DROP POLICY IF EXISTS "Users manage their own exantematica cases" ON public.exantematica_cases;
CREATE POLICY "All authenticated can read exantematica_cases" ON public.exantematica_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own exantematica_cases" ON public.exantematica_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update exantematica_cases" ON public.exantematica_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete exantematica_cases" ON public.exantematica_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. febre_amarela_cases
DROP POLICY IF EXISTS "Users manage their own febre amarela cases" ON public.febre_amarela_cases;
CREATE POLICY "All authenticated can read febre_amarela_cases" ON public.febre_amarela_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own febre_amarela_cases" ON public.febre_amarela_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update febre_amarela_cases" ON public.febre_amarela_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete febre_amarela_cases" ON public.febre_amarela_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. hanseniase_cases
DROP POLICY IF EXISTS "Users manage their own hanseniase cases" ON public.hanseniase_cases;
CREATE POLICY "All authenticated can read hanseniase_cases" ON public.hanseniase_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own hanseniase_cases" ON public.hanseniase_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update hanseniase_cases" ON public.hanseniase_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete hanseniase_cases" ON public.hanseniase_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. meningite_cases
DROP POLICY IF EXISTS "Users manage their own meningite cases" ON public.meningite_cases;
CREATE POLICY "All authenticated can read meningite_cases" ON public.meningite_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own meningite_cases" ON public.meningite_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update meningite_cases" ON public.meningite_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete meningite_cases" ON public.meningite_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. raiva_humana_cases
DROP POLICY IF EXISTS "Users manage their own raiva humana cases" ON public.raiva_humana_cases;
CREATE POLICY "All authenticated can read raiva_humana_cases" ON public.raiva_humana_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own raiva_humana_cases" ON public.raiva_humana_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update raiva_humana_cases" ON public.raiva_humana_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete raiva_humana_cases" ON public.raiva_humana_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. srag_cases
DROP POLICY IF EXISTS "Users can manage their own srag cases" ON public.srag_cases;
CREATE POLICY "All authenticated can read srag_cases" ON public.srag_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own srag_cases" ON public.srag_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update srag_cases" ON public.srag_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete srag_cases" ON public.srag_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 11. surto_dta_cases
DROP POLICY IF EXISTS "Users can manage their own surto dta cases" ON public.surto_dta_cases;
CREATE POLICY "All authenticated can read surto_dta_cases" ON public.surto_dta_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own surto_dta_cases" ON public.surto_dta_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update surto_dta_cases" ON public.surto_dta_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete surto_dta_cases" ON public.surto_dta_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 12. tetano_acidental_cases
DROP POLICY IF EXISTS "Users can manage their own tetano acidental cases" ON public.tetano_acidental_cases;
CREATE POLICY "All authenticated can read tetano_acidental_cases" ON public.tetano_acidental_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own tetano_acidental_cases" ON public.tetano_acidental_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update tetano_acidental_cases" ON public.tetano_acidental_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete tetano_acidental_cases" ON public.tetano_acidental_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 13. tetano_neonatal_cases
DROP POLICY IF EXISTS "Users can manage their own tetano neonatal cases" ON public.tetano_neonatal_cases;
CREATE POLICY "All authenticated can read tetano_neonatal_cases" ON public.tetano_neonatal_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own tetano_neonatal_cases" ON public.tetano_neonatal_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update tetano_neonatal_cases" ON public.tetano_neonatal_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete tetano_neonatal_cases" ON public.tetano_neonatal_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 14. tuberculose_cases
DROP POLICY IF EXISTS "Users can manage their own tuberculose cases" ON public.tuberculose_cases;
CREATE POLICY "All authenticated can read tuberculose_cases" ON public.tuberculose_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own tuberculose_cases" ON public.tuberculose_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorized can update tuberculose_cases" ON public.tuberculose_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Admins can delete tuberculose_cases" ON public.tuberculose_cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
