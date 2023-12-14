import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { ConfirmDelete } from "~/components/Modals";
import {
  deletePurchaseOrderLine,
  getPurchaseOrderLine,
} from "~/modules/purchasing";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import { notFound } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "purchasing",
  });
  const { lineId, orderId } = params;
  if (!lineId) throw notFound("lineId not found");
  if (!orderId) throw notFound("orderId not found");

  const purchaseOrderLine = await getPurchaseOrderLine(client, lineId);
  if (purchaseOrderLine.error) {
    return redirect(
      path.to.purchaseOrderLines(orderId),
      await flash(
        request,
        error(purchaseOrderLine.error, "Failed to get purchase order line")
      )
    );
  }

  return json({ purchaseOrderLine: purchaseOrderLine.data });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "purchasing",
  });

  const { lineId, orderId } = params;
  if (!lineId) throw notFound("Could not find lineId");
  if (!orderId) throw notFound("Could not find orderId");

  const { error: deleteTypeError } = await deletePurchaseOrderLine(
    client,
    lineId
  );
  if (deleteTypeError) {
    return redirect(
      path.to.purchaseOrderLines(orderId),
      await flash(
        request,
        error(deleteTypeError, "Failed to delete purchase order line")
      )
    );
  }

  return redirect(
    path.to.purchaseOrderLines(orderId),
    await flash(request, success("Successfully deleted purchase order line"))
  );
}

export default function DeletePurchaseOrderLineRoute() {
  const { lineId, orderId } = useParams();
  const { purchaseOrderLine } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (!purchaseOrderLine) return null;
  if (!lineId) throw notFound("Could not find lineId");
  if (!orderId) throw notFound("Could not find orderId");

  const onCancel = () => navigate(path.to.purchaseOrderLines(orderId));

  return (
    <ConfirmDelete
      action={path.to.deletePurchaseOrderLine(orderId, lineId)}
      name="Purchase Order Line"
      text={`Are you sure you want to delete the purchase order line for ${
        purchaseOrderLine.purchaseQuantity ?? 0
      } ${purchaseOrderLine.description ?? ""}? This cannot be undone.`}
      onCancel={onCancel}
    />
  );
}
