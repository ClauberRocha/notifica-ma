import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateUserSchema = z.object({
  full_name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(255),
  cargo: z.string().trim().max(150).optional().nullable(),
  role: z.enum(["admin", "gestor", "user"]),
});

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => CreateUserSchema.parse(data))
  .handler(async ({ data, context }) => {
    // Caller must be admin
    const { data: roleRows, error: roleErr } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (roleErr) throw new Error(roleErr.message);
    if (!roleRows?.some((r) => r.role === "admin")) {
      throw new Error("Apenas administradores podem criar usuários.");
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // Create auth user with a temp password; send invite/recovery so they can set it
    const tempPassword =
      crypto.randomUUID().replace(/-/g, "") + "Aa1!";
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

    // Upsert profile
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

    // Role
    await supabaseAdmin.from("user_roles").delete().eq("user_id", newId);
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newId, role: data.role });
    if (rErr) throw new Error(rErr.message);

    // Send recovery email so user defines their own password
    await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email,
    });

    return { id: newId };
  });
