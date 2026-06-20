import { createFileRoute } from "@tanstack/react-router";
import { MeningiteListPage } from "@/components/meningite-list-page";

export const Route = createFileRoute("/_authenticated/fichas/doenca-meningococica")({
  head: () => ({ meta: [{ title: "Fichas — Doença Meningocócica" }] }),
  component: () => <MeningiteListPage agravo="doenca_meningococica" />,
});
