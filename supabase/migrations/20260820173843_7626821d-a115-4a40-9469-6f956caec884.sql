UPDATE public.system_logs SET user_id = NULL WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM auth.users);

DROP POLICY IF EXISTS "Users insert own logs" ON public.system_logs;
CREATE POLICY "Users insert own logs"
ON public.system_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());