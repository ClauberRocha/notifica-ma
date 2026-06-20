import { createFileRoute } from "@tanstack/react-router";
import { MeningiteForm } from "@/components/meningite-form";

export const Route = createFileRoute("/_authenticated/nova-ficha/outras-meningites")({
  head: () => ({ meta: [{ title: "Nova Ficha — Outras Meningites" }] }),
  component: () => <MeningiteForm agravo="outras_meningites" />,
});
