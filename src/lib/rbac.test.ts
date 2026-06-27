import { describe, it, expect } from "vitest";
import {
  rolesFromRows,
  highestRole,
  hasRole,
  hasAnyRole,
  can,
  canManageRole,
  ROLE_RANK,
  type Role,
} from "./rbac";

describe("rolesFromRows", () => {
  it("retorna lista vazia para null/undefined/[]", () => {
    expect(rolesFromRows(null)).toEqual([]);
    expect(rolesFromRows(undefined)).toEqual([]);
    expect(rolesFromRows([])).toEqual([]);
  });

  it("filtra papéis desconhecidos (defesa contra dados corrompidos)", () => {
    const r = rolesFromRows([
      { role: "admin" },
      { role: "superuser" }, // inválido
      { role: "" },
      { role: "user" },
    ]);
    expect(r.sort()).toEqual(["admin", "user"].sort());
  });

  it("deduplica papéis repetidos", () => {
    expect(rolesFromRows([{ role: "user" }, { role: "user" }])).toEqual([
      "user",
    ]);
  });
});

describe("highestRole", () => {
  it("retorna 'user' como fallback seguro quando lista vazia", () => {
    // Importante: nunca cair em admin por acidente.
    expect(highestRole([])).toBe("user");
  });

  it("admin > gestor > user", () => {
    expect(highestRole(["user", "gestor", "admin"])).toBe("admin");
    expect(highestRole(["user", "gestor"])).toBe("gestor");
    expect(highestRole(["user"])).toBe("user");
  });

  it("hierarquia ROLE_RANK consistente com highestRole", () => {
    expect(ROLE_RANK.admin).toBeGreaterThan(ROLE_RANK.gestor);
    expect(ROLE_RANK.gestor).toBeGreaterThan(ROLE_RANK.user);
  });
});

describe("hasRole / hasAnyRole", () => {
  it("hasRole verifica papel exato", () => {
    expect(hasRole(["admin"], "admin")).toBe(true);
    expect(hasRole(["gestor"], "admin")).toBe(false);
  });

  it("hasAnyRole verifica interseção", () => {
    expect(hasAnyRole(["user"], ["admin", "gestor"])).toBe(false);
    expect(hasAnyRole(["gestor"], ["admin", "gestor"])).toBe(true);
  });
});

describe("can — matriz de permissões críticas", () => {
  const cases: Array<{ role: Role; allow: string[]; deny: string[] }> = [
    {
      role: "admin",
      allow: [
        "users.view",
        "users.create",
        "users.delete",
        "users.assign_role",
        "fichas.delete",
        "logs.view",
        "system.settings",
      ],
      deny: [],
    },
    {
      role: "gestor",
      allow: ["users.view", "users.create", "users.edit", "users.deactivate", "reports.view"],
      // Gestor NÃO pode atribuir papéis, excluir usuários, ver logs nem mexer em settings.
      deny: [
        "users.delete",
        "users.assign_role",
        "logs.view",
        "system.settings",
        "fichas.delete",
        "fichas.create",
      ],
    },
    {
      role: "user",
      allow: ["fichas.view", "fichas.create"],
      // Usuário comum nunca acessa gestão.
      deny: [
        "users.view",
        "users.create",
        "users.edit",
        "users.delete",
        "users.assign_role",
        "users.deactivate",
        "fichas.edit",
        "fichas.delete",
        "logs.view",
        "system.settings",
        "reports.view",
      ],
    },
  ];

  for (const { role, allow, deny } of cases) {
    for (const p of allow) {
      it(`${role} PODE ${p}`, () => {
        expect(can([role], p as never)).toBe(true);
      });
    }
    for (const p of deny) {
      it(`${role} NÃO pode ${p}`, () => {
        expect(can([role], p as never)).toBe(false);
      });
    }
  }

  it("sem papéis = sem permissões (princípio do menor privilégio)", () => {
    expect(can([], "fichas.view")).toBe(false);
    expect(can([], "users.view")).toBe(false);
  });
});

describe("canManageRole — anti-escalada de privilégio", () => {
  it("admin pode gerenciar gestor e user, mas não outro admin", () => {
    expect(canManageRole(["admin"], "user")).toBe(true);
    expect(canManageRole(["admin"], "gestor")).toBe(true);
    // Mesmo admin não pode "gerenciar" outro admin via essa regra
    // (alvo precisa ser ESTRITAMENTE inferior).
    expect(canManageRole(["admin"], "admin")).toBe(false);
  });

  it("gestor pode gerenciar apenas user (nunca admin/gestor)", () => {
    expect(canManageRole(["gestor"], "user")).toBe(true);
    expect(canManageRole(["gestor"], "gestor")).toBe(false);
    expect(canManageRole(["gestor"], "admin")).toBe(false);
  });

  it("user não pode gerenciar ninguém", () => {
    expect(canManageRole(["user"], "user")).toBe(false);
    expect(canManageRole(["user"], "gestor")).toBe(false);
    expect(canManageRole(["user"], "admin")).toBe(false);
  });

  it("sem papéis = não pode gerenciar nada", () => {
    expect(canManageRole([], "user")).toBe(false);
    expect(canManageRole([], "admin")).toBe(false);
  });

  it("usa o maior papel quando ator acumula vários", () => {
    expect(canManageRole(["user", "admin"], "gestor")).toBe(true);
    expect(canManageRole(["user", "gestor"], "user")).toBe(true);
  });
});
