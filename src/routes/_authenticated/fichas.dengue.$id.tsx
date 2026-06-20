import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/dengue/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Dengue" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="dengue_chikungunya_cases"
        agravo="dengue"
        agravoLabel="Dengue"
        listPath="/fichas/dengue"
        id={id}
      />
    );
  },
});
