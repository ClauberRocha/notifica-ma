import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/epizootia/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Epizootia" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="epizootia_cases"
        agravo="epizootia"
        agravoLabel="Epizootia"
        listPath="/fichas/epizootia"
        id={id}
      />
    );
  },
});
