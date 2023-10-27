import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { validationError } from "remix-validated-form";
import {
  AbilityForm,
  abilityValidator,
  deleteAbility,
  insertAbility,
  insertEmployeeAbilities,
} from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

function makeCurve(startingPoint: number, weeks: number) {
  return {
    data: [
      {
        week: 0,
        value: startingPoint,
      },
      {
        week: weeks / 4,
        value: (100 - startingPoint) * 0.5 + startingPoint,
      },
      {
        week: weeks / 2,
        value: 100 - (100 - startingPoint) * 0.25,
      },
      {
        week: weeks,
        value: 100,
      },
    ],
  };
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "resources",
  });

  const validation = await abilityValidator.validate(await request.formData());

  if (validation.error) {
    return validationError(validation.error);
  }

  const { name, startingPoint, shadowWeeks, weeks, employees } =
    validation.data;

  const createAbility = await insertAbility(client, {
    name,
    curve: makeCurve(startingPoint, weeks),
    shadowWeeks,
    createdBy: userId,
  });
  if (createAbility.error) {
    return json(
      {},
      await flash(
        request,
        error(createAbility.error, "Failed to insert ability")
      )
    );
  }

  const abilityId = createAbility.data?.id;
  if (!abilityId) {
    return json(
      {},
      await flash(request, error(createAbility, "Failed to insert ability"))
    );
  }

  if (employees) {
    const createEmployeeAbilities = await insertEmployeeAbilities(
      client,
      abilityId,
      employees
    );

    if (createEmployeeAbilities.error) {
      await deleteAbility(client, abilityId, true);
      return json(
        {},
        await flash(
          request,
          error(
            createEmployeeAbilities.error,
            "Failed to insert ability members"
          )
        )
      );
    }
  }

  return redirect(
    path.to.abilities,
    await flash(request, success(`Ability created`))
  );
}

export default function NewAbilityRoute() {
  const initialValues = {
    name: "",
    startingPoint: 85,
    shadowWeeks: 0,
    weeks: 4,
    employees: [],
  };

  return <AbilityForm initialValues={initialValues} />;
}
