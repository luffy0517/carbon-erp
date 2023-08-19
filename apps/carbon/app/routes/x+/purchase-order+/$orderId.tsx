import { Grid } from "@chakra-ui/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import {
  getExternalDocuments,
  getInternalDocuments,
  getPurchaseOrder,
  PurchaseOrderHeader,
  PurchaseOrderSidebar,
} from "~/modules/purchasing";
import { getLocationsList } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import { error } from "~/utils/result";

export async function loader({ request, params }: LoaderArgs) {
  const { client } = await requirePermissions(request, {
    view: "parts",
  });

  const { orderId } = params;
  if (!orderId) throw new Error("Could not find orderId");

  const [purchaseOrder, externalDocuments, internalDocuments, locations] =
    await Promise.all([
      getPurchaseOrder(client, orderId),
      getExternalDocuments(client, orderId),
      getInternalDocuments(client, orderId),
      getLocationsList(client),
    ]);

  if (purchaseOrder.error) {
    return redirect(
      "/x/purchasing/orders",
      await flash(
        request,
        error(purchaseOrder.error, "Failed to load purchase order summary")
      )
    );
  }

  return json({
    purchaseOrder: purchaseOrder.data,
    externalDocuments: externalDocuments.data ?? [],
    internalDocuments: internalDocuments.data ?? [],
    locations: locations.data ?? [],
  });
}

export async function action({ request }: ActionArgs) {
  return redirect(request.headers.get("Referer") ?? request.url);
}

export default function PurchaseOrderRoute() {
  return (
    <>
      <PurchaseOrderHeader />
      <Grid
        gridTemplateColumns={["1fr", "1fr", "1fr 4fr"]}
        gridGap={4}
        w="full"
      >
        <PurchaseOrderSidebar />
        <Outlet />
      </Grid>
    </>
  );
}
