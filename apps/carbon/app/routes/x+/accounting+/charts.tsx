import { VStack } from "@chakra-ui/react";
import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { ChartOfAccountsTable, getChartOfAccounts } from "~/modules/accounting";
import ChartOfAccountsTableFilters from "~/modules/accounting/interfaces/ChartOfAccounts/ChartOfAccountsTableFilters";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import { error } from "~/utils/result";

export async function loader({ request }: LoaderArgs) {
  const { client } = await requirePermissions(request, {
    view: "accounting",
    role: "employee",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const name = searchParams.get("name");
  const incomeBalance = searchParams.get("incomeBalance");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const chartOfAccounts = await getChartOfAccounts(client, {
    name,
    incomeBalance,
    startDate,
    endDate,
  });

  if (chartOfAccounts.error) {
    return redirect(
      "/x/accounting",
      await flash(
        request,
        error(chartOfAccounts.error, "Failed to get chart of accounts")
      )
    );
  }

  return json({
    chartOfAccounts: chartOfAccounts.data ?? [],
  });
}

export default function ChartOfAccountsRoute() {
  const { chartOfAccounts } = useLoaderData<typeof loader>();

  return (
    <VStack w="full" h="full" spacing={0}>
      <ChartOfAccountsTableFilters />
      <ChartOfAccountsTable data={chartOfAccounts} />
      <Outlet />
    </VStack>
  );
}
