import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { ConfirmDelete } from "~/components/Modals";
import { requirePermissions } from "~/services/auth";
import { deleteWorkCell, getWorkCell } from "~/services/resources";
import { flash } from "~/services/session";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: ActionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "resources",
  });

  const { workCellId } = params;
  if (!workCellId) throw new Error("No work cell id provided");

  const workCell = await getWorkCell(client, workCellId);
  if (workCell.error) {
    return redirect(
      `/x/resources/work-cells`,
      await flash(request, error(workCell.error, "Failed to get work cell"))
    );
  }

  return json({
    workCell: workCell.data,
  });
}

export async function action({ request, params }: ActionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "resources",
  });

  const { workCellId } = params;
  if (!workCellId) throw new Error("No work cell id provided");

  const deactivateWorkCell = await deleteWorkCell(client, workCellId);
  if (deactivateWorkCell.error) {
    return redirect(
      `/x/resources/work-cells`,
      await flash(
        request,
        error(deactivateWorkCell.error, "Failed to delete work cell")
      )
    );
  }

  return redirect(
    `/x/resources/work-cells`,
    await flash(request, success("Successfully deleted work cell"))
  );
}

export default function DeleteWorkCellRoute() {
  const { workCell } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { workCellId } = useParams();
  if (!workCellId) return null;

  const onCancel = () => navigate("/x/resources/work-cells");

  return (
    <ConfirmDelete
      action={`/x/resources/work-cells/cell/delete/${workCellId}`}
      name={workCell.name}
      text={`Are you sure you want remove delete ${workCell.name}? This cannot be undone.`}
      onCancel={onCancel}
    />
  );
}
