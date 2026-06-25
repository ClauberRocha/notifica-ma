import { createFileRoute } from "@tanstack/react-router";
import { ExantematicaListPage } from "@/components/exantematica-list-page";

export const Route = createFileRoute("/_authenticated/fichas/rubeola/")({
  head: () => ({ meta: [{ title: "Fichas — Rubéola" }] }),
  component: () => <ExantematicaListPage agravo="rubeola" />,
});
