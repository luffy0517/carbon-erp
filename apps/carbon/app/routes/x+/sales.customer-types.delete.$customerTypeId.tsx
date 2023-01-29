import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { ConfirmDelete } from "~/components/Modals";
import { requirePermissions } from "~/services/auth";
import { deleteCustomerType, getCustomerType } from "~/services/sales";
import { flash } from "~/services/session";
import { error, success } from "~/utils/result";
import { notFound } from "~/utils/http";

export async function loader({ request, params }: LoaderArgs) {
  const { client } = await requirePermissions(request, {
    view: "sales",
  });
  const { customerTypeId } = params;
  if (!customerTypeId) throw notFound("customerTypeId not found");

  const customerType = await getCustomerType(client, customerTypeId);
  if (customerType.error) {
    return redirect(
      "/x/sales/customer-types",
      await flash(
        request,
        error(customerType.error, "Failed to get customer type")
      )
    );
  }

  return json(customerType);
}

export async function action({ request, params }: ActionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "sales",
  });

  const { customerTypeId } = params;
  if (!customerTypeId) {
    return redirect(
      "/x/sales/customer-types",
      await flash(request, error(params, "Failed to get an customer type id"))
    );
  }

  const { error: deleteTypeError } = await deleteCustomerType(
    client,
    customerTypeId
  );
  if (deleteTypeError) {
    return redirect(
      "/x/sales/customer-types",
      await flash(
        request,
        error(deleteTypeError, "Failed to delete customer type")
      )
    );
  }

  return redirect(
    "/x/sales/customer-types",
    await flash(request, success("Successfully deleted customer type"))
  );
}

export default function DeleteCustomerTypeRoute() {
  const { customerTypeId } = useParams();
  const { data } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (!customerTypeId || !data) return null; // TODO - handle this better (404?)

  const onCancel = () => navigate("/x/sales/customer-types");

  return (
    <ConfirmDelete
      action={`/x/sales/customer-types/delete/${customerTypeId}`}
      name={data.name}
      text={`Are you sure you want to delete the customer type: ${data.name}? This cannot be undone.`}
      onCancel={onCancel}
    />
  );
}
