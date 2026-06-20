import { createFileRoute } from "@tanstack/react-router";
import { DengueChikForm } from "@/components/dengue-chik-form";

export const Route = createFileRoute("/_authenticated/nova-ficha/chikungunya")({
  head: () => ({ meta: [{ title: "Nova Ficha — Chikungunya" }] }),
  component: () => (
    <DengueChikForm
      agravo="chikungunya"
      backTo="/nova-ficha"
      redirectTo="/fichas/chikungunya"
      title="Nova ficha de Chikungunya"
    />
  ),
});
