import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RoleEnum = z.enum(["admin", "gestor", "user"]);

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

async function ensureAdmin(supabase: any, userId: string) {
  const { data: roleRows, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  if (!roleRows?.some((r: { role: string }) => r.role === "admin")) {
    throw new Error("Apenas administradores podem executar esta ação.");
  }
}

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => CreateUserSchema.parse(data))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);

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

    return { id: newId, email: data.email, full_name: data.full_name };
  });

export const updateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => UpdateUserSchema.parse(data))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // Update auth email if changed
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

    return { id: data.id };
  });
