DROP TRIGGER IF EXISTS trg_prevent_last_admin_removal ON public.user_roles;
DROP TRIGGER IF EXISTS prevent_last_admin_removal_trg ON public.user_roles;
CREATE TRIGGER prevent_last_admin_removal_trg
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_last_admin_removal();