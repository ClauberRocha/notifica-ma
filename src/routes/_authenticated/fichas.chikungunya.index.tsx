import { createFileRoute } from "@tanstack/react-router";
import { AgravoListPage } from "@/components/agravo-list-page";

export const Route = createFileRoute("/_authenticated/fichas/chikungunya/")({
  head: () => ({ meta: [{ title: "Fichas — Chikungunya" }] }),
  component: () => (
    <AgravoListPage agravo="chikungunya" title="Fichas — Chikungunya" novaFichaPath="/nova-ficha/chikungunya" />
  ),
});
