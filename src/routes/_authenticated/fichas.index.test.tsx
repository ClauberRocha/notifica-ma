// @vitest-environment jsdom
/**
 * Integration test for the Fichas de Investigação list. Verifies the
 * select-agravo → clear-filters cycle: initial state shows the placeholder,
 * selecting an agravo hides it, and clicking Limpar filtros restores the
 * placeholder without any skeleton/loader remaining visible. Also asserts
 * the shared global agravo store is cleared and the URL is reset.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { setGlobalAgravo, __resetGlobalAgravoForTests } from "@/lib/global-agravo";

// --- Router hook mocks (no RouterProvider in tests) ---------------------
vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    "@tanstack/react-router",
  );
  return {
    ...actual,
    Link: ({ children, ...rest }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement("a", rest as React.AnchorHTMLAttributes<HTMLAnchorElement>, children),
    useNavigate: () => vi.fn(),
  };
});

// --- Supabase mock — never resolves so we can inspect the loading state
vi.mock("@/integrations/supabase/client", () => {
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.order = () => chain;
  chain.limit = () =>
    new Promise((resolve) => setTimeout(() => resolve({ data: [], error: null }), 20));
  return {
    supabase: {
      from: () => chain,
    },
  };
});

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    can: () => true,
    loading: false,
    role: "admin",
    user: { id: "u1" },
  }),
}));

vi.mock("@/lib/offline/db", () => ({
  deleteCase: vi.fn(async () => ({ error: null, localOnly: false })),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

import { toast } from "sonner";
import { FichasListPage } from "./fichas.index";

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    React.createElement(
      QueryClientProvider,
      { client },
      React.createElement(FichasListPage),
    ),
  );
}

describe("FichasListPage — filtro global + limpar filtros", () => {
  beforeEach(() => {
    __resetGlobalAgravoForTests();
    window.history.replaceState(null, "", "/fichas");
    vi.clearAllMocks();
  });

  it("mostra o placeholder inicial quando nenhum agravo está selecionado", () => {
    renderPage();
    expect(screen.getByText(/Selecione um agravo/i)).toBeTruthy();
    // Nenhum skeleton deve aparecer no estado vazio
    expect(document.querySelectorAll(".animate-pulse").length).toBe(0);
  });

  it("ao selecionar um agravo pelo store global, o placeholder desaparece", async () => {
    renderPage();
    expect(screen.getByText(/Selecione um agravo/i)).toBeTruthy();

    await act(async () => {
      setGlobalAgravo("dengue");
    });

    await waitFor(() =>
      expect(screen.queryByText(/Selecione um agravo/i)).toBeNull(),
    );
    // A tabela deve estar montada agora
    expect(document.querySelector("table")).not.toBeNull();
  });

  it("clicando em Limpar filtros: sincroniza o store global, limpa a URL, exibe toast e volta ao placeholder sem loader", async () => {
    const user = userEvent.setup();
    renderPage();

    await act(async () => {
      setGlobalAgravo("dengue");
    });
    // Aguarda a tabela renderizar
    await waitFor(() => expect(document.querySelector("table")).not.toBeNull());

    // Simula filtros extras persistidos na URL para validar o reset completo
    window.history.replaceState(null, "", "/fichas?agravo=dengue&q=maria&status=encerrado");

    const clearBtn = await screen.findByRole("button", { name: /limpar filtros/i });
    await user.click(clearBtn);

    // Placeholder de volta
    await waitFor(() =>
      expect(screen.getByText(/Selecione um agravo/i)).toBeTruthy(),
    );

    // Store global limpo (sincronia com o Painel)
    const { getGlobalAgravo } = await import("@/lib/global-agravo");
    expect(getGlobalAgravo()).toBe("");

    // URL sem query params (refresh mantém a tela vazia)
    expect(window.location.search).toBe("");

    // Nenhum loader / skeleton visível
    expect(document.querySelectorAll(".animate-pulse").length).toBe(0);

    // Feedback visual disparado
    expect(toast.success).toHaveBeenCalledWith(
      "Filtros limpos",
      expect.objectContaining({ description: expect.any(String) }),
    );
  });
});
