import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/febre-amarela/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Febre Amarela" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="febre_amarela_cases"
        agravo="febre_amarela"
        agravoLabel="Febre Amarela"
        listPath="/fichas/febre-amarela"
        id={id}
      />
    );
  },
});
