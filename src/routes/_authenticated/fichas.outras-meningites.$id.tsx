import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/outras-meningites/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Outras Meningites" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="meningite_cases"
        agravo="outras_meningites"
        agravoLabel="Outras Meningites"
        listPath="/fichas/outras-meningites"
        id={id}
      />
    );
  },
});
