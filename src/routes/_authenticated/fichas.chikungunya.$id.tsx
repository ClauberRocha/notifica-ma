import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/chikungunya/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Chikungunya" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="dengue_chikungunya_cases"
        agravo="chikungunya"
        agravoLabel="Chikungunya"
        listPath="/fichas/chikungunya"
        id={id}
      />
    );
  },
});
