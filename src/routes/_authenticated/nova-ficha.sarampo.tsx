import { createFileRoute } from "@tanstack/react-router";
import { ExantematicaForm } from "@/components/exantematica-form";

export const Route = createFileRoute("/_authenticated/nova-ficha/sarampo")({
  head: () => ({ meta: [{ title: "Nova Ficha de Sarampo" }] }),
  component: () => <ExantematicaForm agravo="sarampo" />,
});
