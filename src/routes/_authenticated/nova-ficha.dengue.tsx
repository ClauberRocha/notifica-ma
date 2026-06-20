import { createFileRoute } from "@tanstack/react-router";
import { DengueChikForm } from "@/components/dengue-chik-form";

export const Route = createFileRoute("/_authenticated/nova-ficha/dengue")({
  head: () => ({ meta: [{ title: "Nova Ficha — Dengue" }] }),
  component: () => (
    <DengueChikForm
      agravo="dengue"
      backTo="/nova-ficha"
      redirectTo="/fichas/dengue"
      title="Nova ficha de Dengue"
    />
  ),
});
