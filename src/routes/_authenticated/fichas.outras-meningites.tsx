import { createFileRoute } from "@tanstack/react-router";
import { MeningiteListPage } from "@/components/meningite-list-page";

export const Route = createFileRoute("/_authenticated/fichas/outras-meningites")({
  head: () => ({ meta: [{ title: "Fichas — Outras Meningites" }] }),
  component: () => <MeningiteListPage agravo="outras_meningites" />,
});
