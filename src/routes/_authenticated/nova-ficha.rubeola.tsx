import { createFileRoute } from "@tanstack/react-router";
import { ExantematicaForm } from "@/components/exantematica-form";

export const Route = createFileRoute("/_authenticated/nova-ficha/rubeola")({
  head: () => ({ meta: [{ title: "Nova Ficha de Rubéola" }] }),
  component: () => <ExantematicaForm agravo="rubeola" />,
});
