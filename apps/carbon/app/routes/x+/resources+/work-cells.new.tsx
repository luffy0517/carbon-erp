import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { validationError } from "remix-validated-form";
import {
  upsertWorkCellType,
  WorkCellTypeForm,
  workCellTypeValidator,
} from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "resources",
  });

  const validation = await workCellTypeValidator.validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { name, description, color, requiredAbility } = validation.data;

  const createWorkCellType = await upsertWorkCellType(client, {
    name,
    description,
    color,
    requiredAbility,
    createdBy: userId,
  });
  if (createWorkCellType.error) {
    return redirect(
      path.to.workCells,
      await flash(
        request,
        error(createWorkCellType.error, "Failed to create work cell type")
      )
    );
  }

  return redirect(path.to.workCells);
}

export default function NewWorkCellTypeRoute() {
  const navigate = useNavigate();
  const onClose = () => navigate(path.to.workCells);

  const initialValues = {
    name: "",
    description: "",
    color: "#000000",
  };

  return <WorkCellTypeForm onClose={onClose} initialValues={initialValues} />;
}
