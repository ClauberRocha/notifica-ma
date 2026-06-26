DROP TRIGGER IF EXISTS prevent_last_admin_removal_trg ON public.user_roles;
CREATE TRIGGER prevent_last_admin_removal_trg
BEFORE DELETE OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.prevent_last_admin_removal();