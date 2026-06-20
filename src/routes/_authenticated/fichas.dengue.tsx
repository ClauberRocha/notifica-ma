import { createFileRoute } from "@tanstack/react-router";
import { AgravoListPage } from "@/components/agravo-list-page";

export const Route = createFileRoute("/_authenticated/fichas/dengue")({
  head: () => ({ meta: [{ title: "Fichas — Dengue" }] }),
  component: () => (
    <AgravoListPage agravo="dengue" title="Fichas — Dengue" novaFichaPath="/nova-ficha/dengue" />
  ),
});
