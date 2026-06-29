import { createFileRoute, Link } from "@tanstack/react-router";
import { FilePlus, List, LayoutDashboard, Users, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Notifica-MA Intelligence — Monitoramento e Decisão em Saúde" },
      { name: "description", content: "Plataforma Estadual de Monitoramento e Decisão em Saúde." },
    ],
  }),
  component: Home,
});

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const shortcuts = [
  { label: "Nova Notificação", desc: "Registrar nova ficha de agravo", icon: FilePlus, path: "/nova-ficha", color: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15" },
  { label: "Ver Fichas", desc: "Consultar fichas cadastradas", icon: List, path: "/fichas", color: "bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/15" },
  { label: "Painel", desc: "Indicadores e análises", icon: LayoutDashboard, path: "/painel", color: "bg-chart-3/20 text-yellow-700 border-chart-3/30 hover:bg-chart-3/30" },
  { label: "Usuários", desc: "Gerenciar equipe", icon: Users, path: "/usuarios", color: "bg-chart-5/10 text-chart-5 border-chart-5/20 hover:bg-chart-5/15" },
] as const;

function Home() {
  const { user, loading, signOut, role } = useAuth();
  const firstName = (user?.full_name?.trim().split(/\s+/)[0]) || "Usuário";
  const greeting = getGreeting();



  const isShortcutDisabled = (path: string) => {
    if (role === "user") {
      return path === "/painel" || path === "/usuarios";
    }
    if (role === "gestor") {
      return path === "/nova-ficha" || path === "/fichas";
    }
    return false;
  };


  return (
    <div className="min-h-[80vh] flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full px-2 py-8 relative">
        <div className="mb-8 text-center">
          <img
            src="/logo-ses.png?v=2"
            alt="Governo do Maranhão"
            className="h-20 mx-auto mb-6 object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Notifica-MA Intelligence
          </h1>
          <p className="text-sm font-medium text-primary mt-1">
            Plataforma Estadual de Monitoramento e Decisão em Saúde
          </p>
          <p className="text-muted-foreground mt-4 text-sm sm:text-base">
            {loading ? "Carregando..." : `${greeting}, ${firstName}. O que você deseja fazer hoje?`}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shortcuts.map((s) => {
            const disabled = isShortcutDisabled(s.path);
            if (disabled) {
              return (
                <div
                  key={s.path}
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border/40 bg-muted/40 text-muted-foreground/50 cursor-not-allowed opacity-50 select-none"
                  title="Acesso restrito para o seu perfil de usuário"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-base">{s.label}</p>
                    <p className="text-xs opacity-75 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={s.path}
                to={s.path}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${s.color}`}
              >
                <div className="w-12 h-12 rounded-xl bg-current/10 flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-base">{s.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{s.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>


        <div className="mt-8 text-center">
          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>

        <footer className="mt-10 text-center text-xs text-muted-foreground/70 space-y-0.5">
          <p>Desenvolvido por GERTEC/ConsulTI</p>
          <p>+55 (98) 98600-1270</p>
        </footer>
      </div>
    </div>
  );
}
