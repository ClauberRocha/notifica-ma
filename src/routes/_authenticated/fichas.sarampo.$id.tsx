import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/sarampo/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Sarampo" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="exantematica_cases"
        agravo="sarampo"
        agravoLabel="Sarampo"
        listPath="/fichas/sarampo"
        id={id}
      />
    );
  },
});
