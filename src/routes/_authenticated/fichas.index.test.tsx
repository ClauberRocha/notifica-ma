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
import {
  setGlobalAgravo,
  getGlobalAgravo,
  __resetGlobalAgravoForTests,
} from "@/lib/global-agravo";

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
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/fichas");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("mostra o placeholder inicial quando nenhum agravo está selecionado", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Selecione um agravo/i }),
    ).toBeTruthy();
    expect(document.querySelectorAll(".animate-pulse").length).toBe(0);
  });

  it("ao selecionar um agravo pelo store global, o placeholder desaparece", async () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Selecione um agravo/i }),
    ).toBeTruthy();

    await act(async () => {
      setGlobalAgravo("dengue");
    });

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /Selecione um agravo/i }),
      ).toBeNull(),
    );
    expect(document.querySelector("table")).not.toBeNull();
  });

  it("clicando em Limpar filtros: sincroniza o store global, limpa a URL, exibe toast e volta ao placeholder sem loader", async () => {
    const user = userEvent.setup();
    renderPage();

    await act(async () => {
      setGlobalAgravo("dengue");
    });
    await waitFor(() => expect(document.querySelector("table")).not.toBeNull());

    window.history.replaceState(null, "", "/fichas?agravo=dengue&q=maria&status=encerrado");

    const clearBtn = await screen.findByRole("button", { name: /limpar filtros/i });
    await user.click(clearBtn);

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /Selecione um agravo/i }),
      ).toBeTruthy(),
    );

    // Store global limpo (sincronia com o Painel)
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

  it("Voltar/Avançar do navegador restaura o estado sincronizado com a URL", async () => {
    const user = userEvent.setup();
    renderPage();

    // Seleciona um agravo — cria uma URL com ?agravo=dengue via replaceState
    await act(async () => {
      setGlobalAgravo("dengue");
    });
    await waitFor(() => expect(document.querySelector("table")).not.toBeNull());
    // Chip de resumo confirma o filtro aplicado
    const chips = screen.getByTestId("active-filters");
    expect(chips.textContent).toMatch(/Dengue/i);

    const filteredUrl = window.location.pathname + window.location.search;
    expect(filteredUrl).toContain("agravo=dengue");

    // Limpa filtros — pushState cria uma nova entrada no histórico
    const clearBtn = await screen.findByRole("button", { name: /limpar filtros/i });
    await user.click(clearBtn);
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /Selecione um agravo/i }),
      ).toBeTruthy(),
    );
    expect(window.location.search).toBe("");
    expect(screen.queryByTestId("active-filters")).toBeNull();

    // Simula "Voltar": URL volta para o estado filtrado e dispara popstate.
    // jsdom não navega automaticamente, então repomos a URL antes do evento.
    await act(async () => {
      window.history.replaceState(null, "", filteredUrl);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await waitFor(() => {
      expect(getGlobalAgravo()).toBe("dengue");
    });
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /Selecione um agravo/i }),
      ).toBeNull(),
    );
    expect(screen.getByTestId("active-filters").textContent).toMatch(/Dengue/i);

    // "Avançar" novamente: volta ao estado limpo, com placeholder e sem loader.
    await act(async () => {
      window.history.replaceState(null, "", "/fichas");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /Selecione um agravo/i }),
      ).toBeTruthy(),
    );
    expect(document.querySelectorAll(".animate-pulse").length).toBe(0);
    expect(screen.queryByTestId("active-filters")).toBeNull();
  });
});
