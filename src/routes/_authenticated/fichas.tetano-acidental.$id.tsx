import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/tetano-acidental/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Tétano Acidental" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="tetano_acidental_cases"
        agravo="tetano_acidental"
        agravoLabel="Tétano Acidental"
        listPath="/fichas/tetano-acidental"
        id={id}
      />
    );
  },
});
