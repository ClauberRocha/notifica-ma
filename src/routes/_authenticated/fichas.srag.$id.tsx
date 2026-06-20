import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/srag/$id")({
  head: () => ({ meta: [{ title: "Detalhes — SRAG" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="srag_cases"
        agravo="srag"
        agravoLabel="SRAG"
        listPath="/fichas/srag"
        id={id}
      />
    );
  },
});
