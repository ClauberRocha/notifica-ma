import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/hanseniase/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Hanseníase" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="hanseniase_cases"
        agravo="hanseniase"
        agravoLabel="Hanseníase"
        listPath="/fichas/hanseniase"
        id={id}
      />
    );
  },
});
