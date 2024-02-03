import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { ConfirmDelete } from "~/components/Modals";
import { useRouteData } from "~/hooks";
import type { Ability } from "~/modules/resources";
import { deleteEmployeeAbility } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function action({ request, params }: ActionFunctionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "resources",
  });

  const { abilityId, id } = params;
  if (!abilityId) throw new Error("No abilityId provided");
  if (!id) throw new Error("No id provided");

  const removeEmployeeAbility = await deleteEmployeeAbility(client, id);
  if (removeEmployeeAbility.error) {
    return redirect(
      path.to.ability(abilityId),
      await flash(
        request,
        error(removeEmployeeAbility.error, "Failed to delete employee ability")
      )
    );
  }

  return redirect(
    path.to.ability(abilityId),
    await flash(request, success("Successfully deleted employee ability"))
  );
}

export default function DeleteEmployeeAbilityRoute() {
  const navigate = useNavigate();
  const { abilityId, id } = useParams();

  if (!id) throw new Error("id is not found");
  if (!abilityId) throw new Error("abilityId is not found");

  const routeData = useRouteData<{
    ability: Ability;
  }>(path.to.ability(abilityId));

  if (!routeData?.ability) return null;
  if (!abilityId) throw new Error("abilityId is not found");

  const employee = Array.isArray(routeData?.ability.employeeAbility)
    ? routeData.ability.employeeAbility.find((ea) => ea.id === id)
    : undefined;

  const onCancel = () => navigate(path.to.ability(abilityId));

  const name =
    (Array.isArray(employee?.user)
      ? employee?.user[0].fullName
      : employee?.user?.fullName) ?? "this employee";

  return (
    <ConfirmDelete
      action={path.to.deleteEmployeeAbility(abilityId, id)}
      name={name}
      text={`Are you sure you want remove delete ${name}? This cannot be undone.`}
      onCancel={onCancel}
    />
  );
}
