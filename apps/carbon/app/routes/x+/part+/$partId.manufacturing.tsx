import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { validationError } from "remix-validated-form";
import { useRouteData } from "~/hooks";
import type { PartManufacturingPolicy } from "~/modules/parts";
import {
  getPartManufacturing,
  PartManufacturingForm,
  partManufacturingValidator,
  upsertPartManufacturing,
} from "~/modules/parts";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "parts",
  });

  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");

  const partManufacturing = await getPartManufacturing(client, partId);

  if (partManufacturing.error) {
    return redirect(
      path.to.parts,
      await flash(
        request,
        error(
          partManufacturing.error,
          "Failed to load part manufacturingturing"
        )
      )
    );
  }

  return json({
    partManufacturing: partManufacturing.data,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "parts",
  });

  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");

  // validate with partsValidator
  const validation = await partManufacturingValidator.validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const updatePartManufacturing = await upsertPartManufacturing(client, {
    ...validation.data,
    partId,
    updatedBy: userId,
  });
  if (updatePartManufacturing.error) {
    return redirect(
      path.to.part(partId),
      await flash(
        request,
        error(
          updatePartManufacturing.error,
          "Failed to update part manufacturing"
        )
      )
    );
  }

  return redirect(
    path.to.partManufacturing(partId),
    await flash(request, success("Updated part manufacturing"))
  );
}

export default function PartManufacturingRoute() {
  const sharedPartsData = useRouteData<{
    partManufacturingPolicies: PartManufacturingPolicy[];
  }>(path.to.partRoot);

  const { partManufacturing } = useLoaderData<typeof loader>();

  if (!sharedPartsData) throw new Error("Could not load shared parts data");

  const initialValues = {
    ...partManufacturing,
    lotSize: partManufacturing.lotSize ?? 0,
  };

  return (
    <PartManufacturingForm
      initialValues={initialValues}
      partManufacturingPolicies={sharedPartsData.partManufacturingPolicies}
    />
  );
}
