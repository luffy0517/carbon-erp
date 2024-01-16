import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { usePermissions } from "~/hooks";
import { getSupplierTypes } from "~/modules/purchasing";
import {
  SupplierAccountsTable,
  SupplierAccountsTableFilters,
  getSuppliers,
} from "~/modules/users";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Suppliers",
  to: path.to.supplierAccounts,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "users",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const name = searchParams.get("name");
  const type = searchParams.get("type");
  const active = searchParams.get("active") !== "false";

  const { limit, offset, sorts, filters } =
    getGenericQueryFilters(searchParams);

  const [suppliers, supplierTypes] = await Promise.all([
    getSuppliers(client, { name, type, active, limit, offset, sorts, filters }),
    getSupplierTypes(client),
  ]);
  if (suppliers.error) {
    return redirect(
      path.to.users,
      await flash(request, error(suppliers.error, "Error loading suppliers"))
    );
  }
  if (supplierTypes.error) {
    return redirect(
      path.to.users,
      await flash(
        request,
        error(supplierTypes.error, "Error loading supplier types")
      )
    );
  }

  return json({
    count: suppliers.count ?? 0,
    suppliers: suppliers.data,
    supplierTypes: supplierTypes.data,
  });
}

export default function UsersSuppliersRoute() {
  const { count, suppliers, supplierTypes } = useLoaderData<typeof loader>();
  const permissions = usePermissions();

  return (
    <VStack spacing={0} className="h-full">
      <SupplierAccountsTableFilters supplierTypes={supplierTypes} />
      <SupplierAccountsTable
        data={suppliers}
        count={count}
        isEditable={permissions.can("update", "users")}
      />
      <Outlet />
    </VStack>
  );
}
