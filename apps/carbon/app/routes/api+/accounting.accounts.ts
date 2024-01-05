import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getAccountsList } from "~/modules/accounting";
import { requirePermissions } from "~/services/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const authorized = await requirePermissions(request, {});

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const type = searchParams.get("type");
  const classes = searchParams.getAll("class");

  const incomeBalance = searchParams.get("incomeBalance");
  const result = await getAccountsList(authorized.client, {
    type,
    incomeBalance,
    classes,
  });

  return json(result);
}
