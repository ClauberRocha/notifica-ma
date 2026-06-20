import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/rubeola/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Rubéola" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="exantematica_cases"
        agravo="rubeola"
        agravoLabel="Rubéola"
        listPath="/fichas/rubeola"
        id={id}
      />
    );
  },
});
