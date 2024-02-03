import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { ConfirmDelete } from "~/components/Modals";
import { deleteEquipment, getEquipment } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: ActionFunctionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "resources",
  });

  const { equipmentId } = params;
  if (!equipmentId) throw new Error("No equipment id provided");

  const equipment = await getEquipment(client, equipmentId);
  if (equipment.error) {
    return redirect(
      path.to.equipment,
      await flash(request, error(equipment.error, "Failed to get equipment"))
    );
  }

  return json({
    equipment: equipment.data,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "resources",
  });

  const { equipmentId } = params;
  if (!equipmentId) throw new Error("No equipment id provided");

  const deactivateEquipment = await deleteEquipment(client, equipmentId);
  if (deactivateEquipment.error) {
    return redirect(
      path.to.equipment,
      await flash(
        request,
        error(deactivateEquipment.error, "Failed to delete equipment")
      )
    );
  }

  return redirect(
    path.to.equipment,
    await flash(request, success("Successfully deleted equipment"))
  );
}

export default function DeleteEquipmentRoute() {
  const { equipment } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { equipmentId } = useParams();

  if (!equipmentId) throw new Error("equipmentId is not found");

  const onCancel = () => navigate(path.to.equipment);

  return (
    <ConfirmDelete
      action={path.to.deleteEquipment(equipmentId)}
      name={equipment.name}
      text={`Are you sure you want remove delete ${equipment.name}? This cannot be undone.`}
      onCancel={onCancel}
    />
  );
}
