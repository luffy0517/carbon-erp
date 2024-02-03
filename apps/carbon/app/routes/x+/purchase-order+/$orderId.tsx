import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import {
  PurchaseOrderHeader,
  PurchaseOrderSidebar,
  getExternalDocuments,
  getInternalDocuments,
  getPurchaseOrder,
  getPurchaseOrderLines,
  usePurchaseOrderTotals,
} from "~/modules/purchasing";
import { getLocationsList } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Orders",
  to: path.to.purchaseOrders,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "parts",
  });

  const { orderId } = params;
  if (!orderId) throw new Error("Could not find orderId");

  const [
    purchaseOrder,
    purchaseOrderLines,
    externalDocuments,
    internalDocuments,
    locations,
  ] = await Promise.all([
    getPurchaseOrder(client, orderId),
    getPurchaseOrderLines(client, orderId),
    getExternalDocuments(client, orderId),
    getInternalDocuments(client, orderId),
    getLocationsList(client),
  ]);

  if (purchaseOrder.error) {
    return redirect(
      path.to.purchaseOrders,
      await flash(
        request,
        error(purchaseOrder.error, "Failed to load purchase order summary")
      )
    );
  }

  return json({
    purchaseOrder: purchaseOrder.data,
    purchaseOrderLines: purchaseOrderLines.data ?? [],
    externalDocuments: externalDocuments.data ?? [],
    internalDocuments: internalDocuments.data ?? [],
    locations: locations.data ?? [],
  });
}

export async function action({ request }: ActionFunctionArgs) {
  return redirect(request.headers.get("Referer") ?? request.url);
}

export default function PurchaseOrderRoute() {
  const { purchaseOrderLines } = useLoaderData<typeof loader>();
  const [, setPurchaseOrderTotals] = usePurchaseOrderTotals();

  useEffect(() => {
    const totals = purchaseOrderLines.reduce(
      (acc, line) => {
        acc.total += (line.purchaseQuantity ?? 0) * (line.unitPrice ?? 0);

        return acc;
      },
      { total: 0 }
    );
    setPurchaseOrderTotals(totals);
  }, [purchaseOrderLines, setPurchaseOrderTotals]);

  return (
    <>
      <PurchaseOrderHeader />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_4fr] h-full w-full gap-4">
        <PurchaseOrderSidebar />
        <Outlet />
      </div>
    </>
  );
}
