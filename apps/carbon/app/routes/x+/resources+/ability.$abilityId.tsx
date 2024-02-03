import {
  Button,
  HStack,
  Heading,
  IconButton,
  NumberDecrementStepper,
  NumberField,
  NumberIncrementStepper,
  NumberInput,
  NumberInputGroup,
  NumberInputStepper,
  useDisclosure,
} from "@carbon/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { ParentSize } from "@visx/responsive";
import { useState } from "react";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { MdEdit, MdOutlineArrowBackIos } from "react-icons/md";
import { ValidatedForm, validationError } from "remix-validated-form";
import { Hidden, Input, Submit } from "~/components/Form";
import type { AbilityDatum } from "~/modules/resources";
import {
  AbilityChart,
  AbilityEmployeesTable,
  abilityCurveValidator,
  abilityNameValidator,
  getAbility,
  updateAbility,
} from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Abilities",
  to: path.to.abilities,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "resources",
  });

  const { abilityId } = params;
  if (!abilityId) {
    return redirect(
      path.to.abilities,
      await flash(request, error(null, "Ability ID not found"))
    );
  }

  const ability = await getAbility(client, abilityId);
  if (ability.error || !ability.data) {
    return redirect(
      path.to.abilities,
      await flash(request, error(ability.error, "Failed to load ability"))
    );
  }

  return json({
    ability: ability.data,
    weeks:
      // @ts-ignore
      ability.data.curve?.data[ability.data.curve?.data.length - 1].week ?? 0,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { client } = await requirePermissions(request, {
    update: "resources",
  });

  const { abilityId } = params;
  if (!abilityId) {
    throw new Error("Ability ID not found");
  }

  const formData = await request.formData();

  if (formData.get("intent") === "name") {
    const validation = await abilityNameValidator.validate(formData);
    if (validation.error) {
      return validationError(validation.error);
    }

    const { name } = validation.data;
    const updateAbilityName = await updateAbility(client, abilityId, {
      name,
    });
    if (updateAbilityName.error) {
      return redirect(
        path.to.ability(abilityId),
        await flash(
          request,
          error(updateAbilityName.error, "Failed to update ability name")
        )
      );
    }
  }

  if (formData.get("intent") === "curve") {
    const validation = await abilityCurveValidator.validate(formData);
    if (validation.error) {
      return validationError(validation.error);
    }

    const { data, shadowWeeks } = validation.data;
    const updateAbilityCurve = await updateAbility(client, abilityId, {
      curve: {
        data: JSON.parse(data),
      },
      shadowWeeks,
    });
    if (updateAbilityCurve.error) {
      return redirect(
        path.to.ability(abilityId),
        await flash(
          request,
          error(updateAbilityCurve.error, "Failed to update ability data")
        )
      );
    }
  }

  return redirect(
    path.to.ability(abilityId),
    await flash(request, success("Ability updated"))
  );
}

export default function AbilitiesRoute() {
  const { ability, weeks } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const editingTitle = useDisclosure();
  const [data, setData] = useState<AbilityDatum[]>(
    // @ts-ignore
    ability.curve?.data ?? []
  );
  const [time, setTime] = useState<number>(weeks);
  const [controlledShadowWeeks, setControlledShadowWeeks] = useState<number>(
    ability.shadowWeeks ?? 0
  );

  const updateWeeks = (newWeeks: number) => {
    const scale = 1 + (newWeeks - time) / time;
    setData((prevData) =>
      prevData.map((datum) => ({
        ...datum,
        week: Math.round(datum.week * scale * 10) / 10,
      }))
    );
    setTime(newWeeks);
  };

  const updateShadowTime = (newShadowTime: number) => {
    setControlledShadowWeeks(newShadowTime);
  };

  return (
    <>
      <div className="bg-background w-full relative">
        <HStack className="w-full justify-between p-4">
          {editingTitle.isOpen ? (
            <ValidatedForm
              validator={abilityNameValidator}
              method="post"
              action={path.to.ability(ability.id)}
              defaultValues={{
                name: ability.name,
              }}
              onSubmit={editingTitle.onClose}
            >
              <Hidden name="intent" value="name" />
              <HStack>
                <IconButton
                  aria-label="Back"
                  variant="ghost"
                  icon={<MdOutlineArrowBackIos />}
                  onClick={() => navigate(path.to.abilities)}
                />
                <Input
                  autoFocus
                  name="name"
                  className="text-xl font-bold border-none shadow-none"
                />
                <Submit>Save</Submit>
                <IconButton
                  aria-label="Cancel"
                  variant="ghost"
                  icon={<IoMdClose />}
                  onClick={editingTitle.onClose}
                />
              </HStack>
            </ValidatedForm>
          ) : (
            <HStack>
              <IconButton
                aria-label="Back"
                variant="ghost"
                icon={<MdOutlineArrowBackIos />}
                onClick={() => navigate(path.to.abilities)}
              />
              <Heading size="h3">{ability.name}</Heading>
              <IconButton
                aria-label="Edit"
                variant="ghost"
                icon={<MdEdit />}
                onClick={editingTitle.onOpen}
              />
            </HStack>
          )}

          <HStack>
            <span className="text-sm">Weeks Shadowing:</span>
            <NumberField
              name="unitPrice"
              value={controlledShadowWeeks}
              onChange={updateShadowTime}
              minValue={0}
              maxValue={time}
              className="max-w-[100px]"
            >
              <NumberInputGroup className="relative">
                <NumberInput size="sm" />
                <NumberInputStepper>
                  <NumberIncrementStepper>
                    <LuChevronUp size="0.75em" strokeWidth="3" />
                  </NumberIncrementStepper>
                  <NumberDecrementStepper>
                    <LuChevronDown size="0.75em" strokeWidth="3" />
                  </NumberDecrementStepper>
                </NumberInputStepper>
              </NumberInputGroup>
            </NumberField>

            <span className="text-sm">Weeks to Learn:</span>
            <NumberField
              name="unitPrice"
              value={time}
              onChange={updateWeeks}
              minValue={1}
              className="max-w-[100px]"
            >
              <NumberInputGroup className="relative">
                <NumberInput size="sm" />
                <NumberInputStepper>
                  <NumberIncrementStepper>
                    <LuChevronUp size="0.75em" strokeWidth="3" />
                  </NumberIncrementStepper>
                  <NumberDecrementStepper>
                    <LuChevronDown size="0.75em" strokeWidth="3" />
                  </NumberDecrementStepper>
                </NumberInputStepper>
              </NumberInputGroup>
            </NumberField>

            <ValidatedForm
              validator={abilityCurveValidator}
              method="post"
              action={path.to.ability(ability.id)}
            >
              <Hidden name="intent" value="curve" />
              <Hidden name="data" value={JSON.stringify(data)} />
              <Hidden name="shadowWeeks" value={controlledShadowWeeks} />
              <Submit>Save</Submit>
            </ValidatedForm>
          </HStack>
        </HStack>
        <div className="w-full h-[33vh]">
          <ParentSize>
            {({ height, width }) => (
              <AbilityChart
                parentHeight={height}
                parentWidth={width}
                data={data}
                shadowWeeks={controlledShadowWeeks}
                onDataChange={setData}
              />
            )}
          </ParentSize>
        </div>
        <div className="absolute bottom--4 right-4 z-[3]">
          <Button asChild leftIcon={<IoMdAdd />}>
            <Link to="employee/new">New Employee</Link>
          </Button>
        </div>
      </div>
      <AbilityEmployeesTable
        employees={ability.employeeAbility ?? []}
        weeks={weeks}
      />
      <Outlet />
    </>
  );
}
