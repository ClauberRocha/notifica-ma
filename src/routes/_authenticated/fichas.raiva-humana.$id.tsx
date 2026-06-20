import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/raiva-humana/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Raiva Humana" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="raiva_humana_cases"
        agravo="raiva_humana"
        agravoLabel="Raiva Humana"
        listPath="/fichas/raiva-humana"
        id={id}
      />
    );
  },
});
