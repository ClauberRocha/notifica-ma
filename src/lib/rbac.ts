// Role-Based Access Control — fonte única de verdade para papéis e permissões.

export type Role = "admin" | "gestor" | "user";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  user: "Usuário Comum",
};

export const ROLE_BADGE_CLASSES: Record<Role, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  gestor: "bg-primary/10 text-primary border-primary/20",
  user: "bg-muted text-muted-foreground border-border",
};

// Hierarquia: admin > gestor > user
export const ROLE_RANK: Record<Role, number> = {
  admin: 3,
  gestor: 2,
  user: 1,
};

export type Permission =
  // Usuários
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.deactivate"
  | "users.delete"
  | "users.assign_role"
  // Fichas
  | "fichas.view"
  | "fichas.create"
  | "fichas.edit"
  | "fichas.delete"
  // Sistema
  | "logs.view"
  | "system.settings"
  | "reports.view";

// Mapeamento papel → permissões
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "users.view",
    "users.create",
    "users.edit",
    "users.deactivate",
    "users.delete",
    "users.assign_role",
    "fichas.view",
    "fichas.create",
    "fichas.edit",
    "fichas.delete",
    "logs.view",
    "system.settings",
    "reports.view",
  ],
  gestor: [
    "users.view",
    "users.create",
    "users.edit",
    "users.deactivate",
    "fichas.view",
    "fichas.create",
    "fichas.edit",
    "reports.view",
  ],

  user: ["fichas.view", "fichas.create"],
};

export function rolesFromRows(
  rows: Array<{ role: string }> | null | undefined,
): Role[] {
  if (!rows) return [];
  const seen = new Set<Role>();
  for (const r of rows) {
    if (r.role === "admin" || r.role === "gestor" || r.role === "user") {
      seen.add(r.role);
    }
  }
  return [...seen];
}

export function highestRole(roles: Role[]): Role {
  if (roles.length === 0) return "user";
  return roles.reduce((best, r) =>
    ROLE_RANK[r] > ROLE_RANK[best] ? r : best,
  );
}

export function hasRole(roles: Role[], role: Role): boolean {
  return roles.includes(role);
}

export function hasAnyRole(roles: Role[], allow: Role[]): boolean {
  return allow.some((r) => roles.includes(r));
}

export function can(roles: Role[], permission: Permission): boolean {
  return roles.some((r) => ROLE_PERMISSIONS[r].includes(permission));
}

// Um papel pode gerenciar (criar/editar/atribuir) outro?
// Regra: só pode gerenciar papéis estritamente inferiores ao seu maior papel.
export function canManageRole(actorRoles: Role[], targetRole: Role): boolean {
  if (actorRoles.length === 0) return false;
  const actor = highestRole(actorRoles);
  return ROLE_RANK[actor] > ROLE_RANK[targetRole];
}
