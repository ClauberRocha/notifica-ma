import { createFileRoute } from "@tanstack/react-router";
import { CaseDetail } from "@/components/case-detail";

export const Route = createFileRoute("/_authenticated/fichas/surto-dta/$id")({
  head: () => ({ meta: [{ title: "Detalhes — Surto DTA" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <CaseDetail
        tableName="surto_dta_cases"
        agravo="surto_dta"
        agravoLabel="Surto DTA"
        listPath="/fichas/surto-dta"
        id={id}
      />
    );
  },
});
