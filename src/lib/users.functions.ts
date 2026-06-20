import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RoleEnum = z.enum(["admin", "gestor", "user"]);
type Role = z.infer<typeof RoleEnum>;

const CreateUserSchema = z.object({
  full_name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(255),
  cargo: z.string().trim().max(150).optional().nullable(),
  role: RoleEnum,
});

const UpdateUserSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(255),
  cargo: z.string().trim().max(150).optional().nullable(),
  role: RoleEnum,
});

const ToggleBlockSchema = z.object({
  id: z.string().uuid(),
  blocked: z.boolean(),
});

const DeleteSchema = z.object({ id: z.string().uuid() });

const ResendInviteSchema = z.object({ id: z.string().uuid() });

const RANK: Record<Role, number> = { admin: 3, gestor: 2, user: 1 };

async function getActorRoles(supabase: any, userId: string): Promise<Role[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const out: Role[] = [];
  for (const r of (data ?? []) as Array<{ role: string }>) {
    if (r.role === "admin" || r.role === "gestor" || r.role === "user") {
      out.push(r.role);
    }
  }
  return out;
}

function highest(roles: Role[]): Role {
  if (roles.length === 0) return "user";
  return roles.reduce((a, b) => (RANK[a] >= RANK[b] ? a : b));
}

async function ensureCanManage(
  supabase: any,
  actorId: string,
  targetRole: Role,
  targetUserId?: string,
) {
  const actorRoles = await getActorRoles(supabase, actorId);
  if (actorRoles.length === 0) {
    throw new Error("Sem permissão.");
  }
  const actorTop = highest(actorRoles);

  // Auto-promoção é proibida: ninguém pode atribuir a si um papel superior
  // (nem mesmo igual, para evitar gestor↔gestor).
  if (targetUserId === actorId) {
    throw new Error("Você não pode alterar seu próprio perfil de acesso.");
  }

  // Admin pode tudo. Gestor só pode mexer em 'user'.
  if (actorTop === "admin") return { actorRoles, actorTop };
  if (actorTop === "gestor" && targetRole === "user") {
    return { actorRoles, actorTop };
  }
  throw new Error(
    "Você não tem permissão para gerenciar usuários deste perfil.",
  );
}

async function audit(
  action: string,
  description: string,
  actor: { id: string; email?: string | null; role: Role },
  entity_id?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    await supabaseAdmin.from("system_logs").insert({
      action,
      description,
      user_id: actor.id,
      user_email: actor.email ?? null,
      user_role: actor.role,
      entity_type: "user",
      entity_id: entity_id ?? null,
      metadata: (metadata ?? null) as never,
    });
  } catch {
    // auditoria nunca deve quebrar a operação
  }
}

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => CreateUserSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { actorTop } = await ensureCanManage(
      context.supabase,
      context.userId,
      data.role,
    );

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const tempPassword = crypto.randomUUID().replace(/-/g, "") + "Aa1!";
    const { data: created, error: cErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: data.full_name, cargo: data.cargo ?? null },
      });
    if (cErr || !created.user) {
      throw new Error(cErr?.message || "Falha ao criar usuário.");
    }

    const newId = created.user.id;

    const { error: pErr } = await supabaseAdmin.from("profiles").upsert(
      {
        id: newId,
        full_name: data.full_name,
        email: data.email,
        cargo: data.cargo ?? null,
        blocked: false,
      },
      { onConflict: "id" },
    );
    if (pErr) throw new Error(pErr.message);

    await supabaseAdmin.from("user_roles").delete().eq("user_id", newId);
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newId, role: data.role });
    if (rErr) throw new Error(rErr.message);

    await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email,
    });

    await audit(
      "invite_user",
      `Criou usuário ${data.email} com perfil ${data.role}`,
      { id: context.userId, email: context.claims?.email ?? null, role: actorTop },
      newId,
      { role: data.role, full_name: data.full_name },
    );

    return { id: newId, email: data.email, full_name: data.full_name };
  });

export const updateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => UpdateUserSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // Papel atual do alvo (para decidir se o ator pode mexer nele).
    const { data: currentRoleRows } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.id);
    const currentRoles = (currentRoleRows ?? [])
      .map((r: { role: string }) => r.role as Role)
      .filter((r): r is Role => r === "admin" || r === "gestor" || r === "user");
    const currentTop = highest(currentRoles);

    // Ator precisa poder gerenciar tanto o papel atual quanto o novo.
    const { actorTop } = await ensureCanManage(
      context.supabase,
      context.userId,
      currentTop,
      data.id,
    );
    if (currentTop !== data.role) {
      await ensureCanManage(context.supabase, context.userId, data.role, data.id);
    }

    // Bloqueia rebaixar o último admin.
    if (currentTop === "admin" && data.role !== "admin") {
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) {
        throw new Error(
          "Operação negada: é necessário pelo menos 1 administrador no sistema.",
        );
      }
    }

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
      data.id,
    );
    if (authUser.user && authUser.user.email !== data.email) {
      const { error: aErr } = await supabaseAdmin.auth.admin.updateUserById(
        data.id,
        { email: data.email },
      );
      if (aErr) throw new Error(aErr.message);
    }

    const { error: pErr } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: data.full_name,
        email: data.email,
        cargo: data.cargo ?? null,
      })
      .eq("id", data.id);
    if (pErr) throw new Error(pErr.message);

    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.id);
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.id, role: data.role });
    if (rErr) throw new Error(rErr.message);

    await audit(
      "update",
      `Atualizou usuário ${data.email} (perfil ${currentTop} → ${data.role})`,
      { id: context.userId, email: context.claims?.email ?? null, role: actorTop },
      data.id,
      { from: currentTop, to: data.role },
    );

    return { id: data.id };
  });

/**
 * Bloqueia/desbloqueia usuário. Gestor pode usar (desativação),
 * mas não pode mexer em admin/gestor.
 */
export const toggleBlockUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ToggleBlockSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: roleRows } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.id);
    const targetTop = highest(
      (roleRows ?? [])
        .map((r: { role: string }) => r.role as Role)
        .filter((r): r is Role => r === "admin" || r === "gestor" || r === "user"),
    );
    const { actorTop } = await ensureCanManage(
      context.supabase,
      context.userId,
      targetTop,
      data.id,
    );

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ blocked: data.blocked })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await audit(
      "block_user",
      `${data.blocked ? "Bloqueou" : "Desbloqueou"} usuário`,
      { id: context.userId, email: context.claims?.email ?? null, role: actorTop },
      data.id,
      { blocked: data.blocked },
    );
    return { id: data.id, blocked: data.blocked };
  });

/**
 * Exclusão permanente — apenas admin.
 */
export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => DeleteSchema.parse(data))
  .handler(async ({ data, context }) => {
    const actorRoles = await getActorRoles(context.supabase, context.userId);
    if (!actorRoles.includes("admin")) {
      throw new Error("Apenas administradores podem excluir usuários.");
    }
    if (data.id === context.userId) {
      throw new Error("Você não pode excluir a si mesmo.");
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // Garante que não exclua o último admin.
    const { data: targetRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.id);
    const targetIsAdmin = (targetRoles ?? []).some(
      (r: { role: string }) => r.role === "admin",
    );
    if (targetIsAdmin) {
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) {
        throw new Error(
          "Operação negada: é necessário pelo menos 1 administrador.",
        );
      }
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(error.message);

    await audit(
      "delete",
      `Excluiu usuário definitivamente`,
      { id: context.userId, email: context.claims?.email ?? null, role: "admin" },
      data.id,
    );
    return { id: data.id };
  });

/**
 * Reenvia o convite (link de recuperação/definição de senha) para o usuário.
 * Admin pode reenviar para qualquer perfil; gestor apenas para 'user'.
 */
export const resendInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ResendInviteSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: roleRows } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.id);
    const targetTop = highest(
      (roleRows ?? [])
        .map((r: { role: string }) => r.role as Role)
        .filter((r): r is Role => r === "admin" || r === "gestor" || r === "user"),
    );
    const { actorTop } = await ensureCanManage(
      context.supabase,
      context.userId,
      targetTop,
      data.id,
    );

    const { data: authUser, error: gErr } =
      await supabaseAdmin.auth.admin.getUserById(data.id);
    if (gErr || !authUser.user?.email) {
      throw new Error(gErr?.message || "Usuário não encontrado.");
    }
    const email = authUser.user.email;

    const { error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
    });
    if (linkErr) throw new Error(linkErr.message);

    await audit(
      "resend_invite",
      `Reenviou convite para ${email}`,
      { id: context.userId, email: context.claims?.email ?? null, role: actorTop },
      data.id,
      { email },
    );

    return { id: data.id, email };
  });
