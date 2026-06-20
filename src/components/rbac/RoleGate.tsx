import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  type Permission,
  type Role,
  can as canDo,
  hasAnyRole,
} from "@/lib/rbac";

interface RoleGateProps {
  children: ReactNode;
  /** Mostra apenas se o usuário tiver QUALQUER um destes papéis. */
  allow?: Role[];
  /** Mostra apenas se o usuário tiver esta permissão. */
  permission?: Permission;
  /** Conteúdo alternativo quando bloqueado (padrão: nada). */
  fallback?: ReactNode;
}

/**
 * Esconde conteúdo da UI baseado em papéis ou permissões.
 * Uso:
 *   <RoleGate allow={["admin"]}><AdminPanel /></RoleGate>
 *   <RoleGate permission="users.delete"><Button>Excluir</Button></RoleGate>
 */
export function RoleGate({
  children,
  allow,
  permission,
  fallback = null,
}: RoleGateProps) {
  const { roles, loading } = useAuth();
  if (loading) return null;

  if (allow && !hasAnyRole(roles, allow)) return <>{fallback}</>;
  if (permission && !canDo(roles, permission)) return <>{fallback}</>;

  return <>{children}</>;
}
