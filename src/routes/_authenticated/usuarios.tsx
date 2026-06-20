import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus, Pencil, Lock, Unlock, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { createUser } from "@/lib/users.functions";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({ meta: [{ title: "Usuários" }] }),
  component: UsuariosPage,
});

type Role = "admin" | "gestor" | "user";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "gestor", label: "Gestor" },
  { value: "user", label: "Usuário" },
];

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  gestor: "bg-primary/10 text-primary border-primary/20",
  user: "bg-muted text-muted-foreground border-border",
};

type UserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  cargo: string | null;
  blocked: boolean;
  role: Role;
};

type FormState = {
  full_name: string;
  email: string;
  cargo: string;
  role: Role;
};

async function fetchUsers(): Promise<UserRow[]> {
  const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, cargo, blocked")
        .order("full_name", { ascending: true }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
  if (pErr) throw pErr;
  if (rErr) throw rErr;
  const roleMap = new Map<string, Role>();
  (roles ?? []).forEach((r) => roleMap.set(r.user_id, r.role as Role));
  return (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name ?? null,
    email: p.email ?? null,
    cargo: p.cargo ?? null,
    blocked: !!p.blocked,
    role: roleMap.get(p.id) ?? "user",
  }));
}

function UsuariosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const createUserFn = useServerFn(createUser);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      setCurrentUserId(uid);
      if (uid) {
        const { data: rows } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        setIsAdmin(!!rows?.some((r) => r.role === "admin"));
      }
    })();
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-list"],
    queryFn: fetchUsers,
  });

  const updateMutation = useMutation({
    mutationFn: async (vars: {
      id: string;
      profile?: { cargo?: string | null; blocked?: boolean; full_name?: string };
      role?: Role;
    }) => {
      if (vars.profile) {
        const { error } = await supabase
          .from("profiles")
          .update(vars.profile)
          .eq("id", vars.id);
        if (error) throw error;
      }
      if (vars.role) {
        // upsert into user_roles (delete previous then insert)
        const { error: delErr } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", vars.id);
        if (delErr) throw delErr;
        const { error: insErr } = await supabase
          .from("user_roles")
          .insert({ user_id: vars.id, role: vars.role });
        if (insErr) throw insErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      toast.success("✅ Usuário atualizado com sucesso!");
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(`❌ ${e.message}`),
  });

  const handleSave = (form: FormState) => {
    if (!editing) return;
    updateMutation.mutate({
      id: editing.id,
      profile: { full_name: form.full_name, cargo: form.cargo || null },
      role: form.role,
    });
  };

  const handleBlock = (u: UserRow) => {
    updateMutation.mutate({ id: u.id, profile: { blocked: !u.blocked } });
  };

  const filtered = users.filter(
    (u) =>
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Usuários
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os usuários do sistema
          </p>
        </div>
        {isAdmin && (
          <Button
            className="gap-2 w-full sm:w-auto"
            onClick={() => setCreateOpen(true)}
          >
            <UserPlus className="w-4 h-4" /> Adicionar Usuário
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {filtered.length} usuário(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className={`flex items-center justify-between px-5 py-4 gap-3 ${u.blocked ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {(u.full_name || u.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">
                          {u.full_name || "—"}
                        </p>
                        {u.blocked && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1.5 py-0"
                          >
                            Bloqueado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}
                      </p>
                      {u.cargo && (
                        <p className="text-xs text-muted-foreground/70">
                          {u.cargo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      className={`text-xs hidden sm:inline-flex ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}
                    >
                      {ROLE_OPTIONS.find((r) => r.value === u.role)?.label ||
                        "Usuário"}
                    </Badge>

                    {isAdmin && u.id !== currentUserId && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setEditing(u);
                            setDialogOpen(true);
                          }}
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-8 h-8 ${u.blocked ? "text-green-600 hover:text-green-700" : "text-yellow-600 hover:text-yellow-700"}`}
                          onClick={() => handleBlock(u)}
                          title={u.blocked ? "Desbloquear" : "Bloquear"}
                        >
                          {u.blocked ? (
                            <Unlock className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editing && (
            <UserForm
              initial={editing}
              onSave={handleSave}
              onClose={() => {
                setDialogOpen(false);
                setEditing(null);
              }}
              saving={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          </DialogHeader>
          <CreateUserForm
            onClose={() => setCreateOpen(false)}
            onCreate={async (form) => {
              try {
                await createUserFn({
                  data: {
                    full_name: form.full_name,
                    email: form.email,
                    cargo: form.cargo || null,
                    role: form.role,
                  },
                });
                toast.success("✅ Usuário criado! Um e-mail foi enviado para definir a senha.");
                queryClient.invalidateQueries({ queryKey: ["users-list"] });
                setCreateOpen(false);
              } catch (e) {
                toast.error(`❌ ${(e as Error).message}`);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserForm({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: UserRow;
  onSave: (f: FormState) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>({
    full_name: initial.full_name ?? "",
    email: initial.email ?? "",
    cargo: initial.cargo ?? "",
    role: initial.role,
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.full_name.trim()) {
      toast.warning("⚠️ Nome é obrigatório.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1 sm:col-span-2">
          <Label>Nome Completo *</Label>
          <Input
            placeholder="Ex: João da Silva"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>E-mail</Label>
          <Input type="email" value={form.email} disabled />
        </div>
        <div className="space-y-1">
          <Label>Cargo/Função</Label>
          <Input
            placeholder="Ex: Epidemiologista"
            value={form.cargo}
            onChange={(e) => set("cargo", e.target.value)}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label>Perfil de Acesso</Label>
          <Select
            value={form.role}
            onValueChange={(v) => set("role", v as Role)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </div>
  );
}
