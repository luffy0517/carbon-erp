import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  SuppliersTable,
  SuppliersTableFilters,
  getSupplierStatuses,
  getSupplierTypes,
  getSuppliers,
} from "~/modules/purchasing";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Suppliers",
  to: path.to.suppliers,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "purchasing",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const name = searchParams.get("name");
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  const { limit, offset, sorts, filters } =
    getGenericQueryFilters(searchParams);

  const [suppliers, supplierTypes, supplierStatuses] = await Promise.all([
    getSuppliers(client, { name, type, status, limit, offset, sorts, filters }),
    getSupplierTypes(client),
    getSupplierStatuses(client),
  ]);

  if (suppliers.error) {
    redirect(
      path.to.purchasing,
      await flash(request, error(suppliers.error, "Failed to fetch suppliers"))
    );
  }

  return json({
    count: suppliers.count ?? 0,
    suppliers: suppliers.data ?? [],
    supplierStatuses: supplierStatuses.data ?? [],
    supplierTypes: supplierTypes.data ?? [],
  });
}

export default function PurchasingSuppliersRoute() {
  const { count, suppliers, supplierTypes, supplierStatuses } =
    useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <SuppliersTableFilters
        supplierTypes={supplierTypes}
        supplierStatuses={supplierStatuses}
      />
      <SuppliersTable data={suppliers} count={count} />
      <Outlet />
    </VStack>
  );
}
