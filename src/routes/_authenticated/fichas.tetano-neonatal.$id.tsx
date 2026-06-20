import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/tetano-neonatal/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Tétano Neonatal" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="tetano_neonatal_cases"
        agravo="tetano_neonatal"
        agravoLabel="Tétano Neonatal"
        listPath="/fichas/tetano-neonatal"
        id={id}
      />
    );
  },
});
