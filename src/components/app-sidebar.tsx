import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  FilePlus,
  List,
  BarChart3,
  Users,
  ClipboardList,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_BADGE_CLASSES, ROLE_LABELS, type Permission } from "@/lib/rbac";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutGrid;
  permission?: Permission;
};

const items: NavItem[] = [
  { title: "Início", url: "/", icon: LayoutGrid },
  { title: "Nova Ficha", url: "/nova-ficha", icon: FilePlus, permission: "fichas.create" },
  { title: "Fichas", url: "/fichas", icon: List, permission: "fichas.view" },
  { title: "Painel", url: "/painel", icon: BarChart3, permission: "reports.view" },
  { title: "Usuários", url: "/usuarios", icon: Users, permission: "users.view" },
  { title: "Logs", url: "/logs", icon: ClipboardList, permission: "logs.view" },
];

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut, role, can } = useAuth();

  const isActive = (url: string) =>
    url === "/"
      ? pathname === "/"
      : pathname === url || pathname.startsWith(`${url}/`);

  const visibleItems = items.filter((it) => !it.permission || can(it.permission));
  const roleLabel = role ? ROLE_LABELS[role] : "Sem perfil";
  const roleClass = role ? ROLE_BADGE_CLASSES[role] : "bg-muted text-muted-foreground border-border";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="gap-3 border-b border-sidebar-border/60 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
                NOTIFICA - MA
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                Vigilância Epidemiológica
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/30 p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials(user?.full_name ?? "U")}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.full_name ?? "Usuário"}
              </p>
              <span
                className={`mt-0.5 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleClass}`}
                title={`Perfil: ${roleLabel}`}
              >
                {roleLabel}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarMenu className="gap-1">
          {visibleItems.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className={
                    active
                      ? "h-10 rounded-lg bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                      : "h-10 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                  }
                >
                  <Link to={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sair"
              onClick={() => signOut()}
              className="h-10 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && (
          <p className="px-2 pt-2 text-center text-[10px] text-sidebar-foreground/40">
            Ministério da Saúde — SVS
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
