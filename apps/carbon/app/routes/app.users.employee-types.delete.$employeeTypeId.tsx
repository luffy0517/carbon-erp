import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { DeleteEmployeeTypeModal } from "~/modules/Users/EmployeeTypes";
import { requirePermissions } from "~/services/auth";
import { deleteEmployeeType, getEmployeeType } from "~/services/users";
import { flash } from "~/services/session";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderArgs) {
  const { client } = await requirePermissions(request, {
    view: "users",
  });
  const { employeeTypeId } = params;

  const employeeType = await getEmployeeType(client, employeeTypeId!);
  if (employeeType.error) {
    return redirect(
      "/app/users/employee-types",
      await flash(
        request,
        error(employeeType.error, "Failed to get employee type")
      )
    );
  }

  return json(employeeType);
}

export async function action({ request, params }: ActionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "users",
  });

  const { employeeTypeId } = params;
  if (!employeeTypeId) {
    return redirect(
      "/app/users/employee-types",
      await flash(request, error(params, "Failed to get an employee type id"))
    );
  }

  const { error: deleteTypeError } = await deleteEmployeeType(
    client,
    employeeTypeId
  );
  if (deleteTypeError) {
    return redirect(
      "/app/users/employee-types",
      await flash(
        request,
        error(deleteTypeError, "Failed to delete employee type")
      )
    );
  }

  // TODO - delete employeeType group

  return redirect(
    "/app/users/employee-types",
    await flash(request, success("Successfully deleted employee type"))
  );
}

export default function DeleteEmployeeTypeRoute() {
  const { employeeTypeId } = useParams();
  const { data } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (!employeeTypeId || !data) return null; // TODO - handle this better (404?)

  const onCancel = () => navigate("/app/users/employee-types");

  return (
    <DeleteEmployeeTypeModal
      employeeTypeId={employeeTypeId}
      data={data}
      onCancel={onCancel}
    />
  );
}
