import { createFileRoute } from "@tanstack/react-router";
import { MeningiteForm } from "@/components/meningite-form";

export const Route = createFileRoute("/_authenticated/nova-ficha/doenca-meningococica")({
  head: () => ({ meta: [{ title: "Nova Ficha — Doença Meningocócica" }] }),
  component: () => <MeningiteForm agravo="doenca_meningococica" />,
});
