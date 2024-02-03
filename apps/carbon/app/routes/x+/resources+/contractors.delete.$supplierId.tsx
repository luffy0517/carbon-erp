import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { ConfirmDelete } from "~/components/Modals";
import { deleteContractor, getContractor } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { notFound } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "resources",
    role: "employee",
  });

  const { supplierId } = params;
  if (!supplierId) throw notFound("supplierId not found");

  const contractor = await getContractor(client, supplierId);
  if (contractor.error) {
    return redirect(
      path.to.contractors,
      await flash(request, error(contractor.error, "Failed to get contractor"))
    );
  }

  return json({
    contractor: contractor.data,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "resources",
  });

  const { supplierId } = params;
  if (!supplierId) {
    return redirect(
      path.to.contractors,
      await flash(request, error(params, "Failed to get contractor id"))
    );
  }

  const { error: deleteContractorError } = await deleteContractor(
    client,
    supplierId
  );
  if (deleteContractorError) {
    return redirect(
      path.to.contractors,
      await flash(
        request,
        error(deleteContractorError, "Failed to delete contractor")
      )
    );
  }

  return redirect(
    path.to.contractors,
    await flash(request, success("Successfully deleted contractor"))
  );
}

export default function DeleteContractorRoute() {
  const { contractor } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (!contractor.supplierContactId)
    throw notFound("supplierContactId not found");

  const onCancel = () => navigate(path.to.contractors);

  return (
    <ConfirmDelete
      action={path.to.deleteContractor(contractor.supplierContactId)}
      name={`${contractor.firstName} ${contractor.lastName}`}
      text={`Are you sure you want to delete the contractor: 
        ${contractor.firstName} ${contractor.lastName}? This cannot be undone.`}
      onCancel={onCancel}
    />
  );
}
