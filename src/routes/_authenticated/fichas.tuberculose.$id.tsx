import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/tuberculose/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Tuberculose" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="tuberculose_cases"
        agravo="tuberculose"
        agravoLabel="Tuberculose"
        listPath="/fichas/tuberculose"
        id={id}
      />
    );
  },
});
