import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { validationError } from "remix-validated-form";
import {
  EmployeePermissionsForm,
  employeeValidator,
  getClaims,
  getEmployee,
  makePermissionsFromClaims,
  updateEmployee,
  userPermissionsValidator,
} from "~/modules/users";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import { assertIsPost, notFound } from "~/utils/http";
import { error } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "users",
    role: "employee",
  });

  const { employeeId } = params;
  if (!employeeId) throw notFound("EmployeeId was not found");

  const [rawClaims, employee] = await Promise.all([
    getClaims(client, employeeId),
    getEmployee(client, employeeId),
  ]);

  if (rawClaims.error || employee.error || rawClaims.data === null) {
    redirect(
      "/x/users/employees",
      await flash(
        request,
        error(
          { rawClaims: rawClaims.error, employee: employee.error },
          "Failed to load employee"
        )
      )
    );
  }

  const claims = makePermissionsFromClaims(rawClaims?.data);
  if (claims === null) {
    redirect(
      "/x/users/employees",
      await flash(request, error(null, "Failed to parse claims"))
    );
  }

  return json({
    permissions: claims?.permissions,
    employee: employee.data,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client } = await requirePermissions(request, {
    update: "users",
  });

  const validation = await employeeValidator.validate(await request.formData());

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, employeeType, data } = validation.data;
  const permissions = JSON.parse(data);
  if (
    !Object.values(permissions).every(
      (permission) => userPermissionsValidator.safeParse(permission).success
    )
  ) {
    return json(
      {},
      await flash(request, error(permissions, "Failed to parse permissions"))
    );
  }

  const result = await updateEmployee(client, {
    id,
    employeeType,
    permissions,
  });

  return redirect("/x/users/employees", await flash(request, result));
}

export default function UsersEmployeeRoute() {
  const { permissions, employee } = useLoaderData<typeof loader>();

  if (Array.isArray(employee?.user) || Array.isArray(employee?.employeeType)) {
    throw new Error("Expected single user and employee type");
  }

  const initialValues = {
    id: employee?.id || "",
    employeeType: employee?.employeeType?.id || "",
    permissions: permissions || {},
  };

  return (
    <EmployeePermissionsForm
      name={`${employee?.user?.firstName} ${employee?.user?.lastName}`}
      // @ts-expect-error
      initialValues={initialValues}
    />
  );
}
