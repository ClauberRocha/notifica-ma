import { createFileRoute } from "@tanstack/react-router";
import { ExantematicaListPage } from "@/components/exantematica-list-page";

export const Route = createFileRoute("/_authenticated/fichas/sarampo")({
  head: () => ({ meta: [{ title: "Fichas — Sarampo" }] }),
  component: () => <ExantematicaListPage agravo="sarampo" />,
});
