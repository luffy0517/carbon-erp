import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { validationError } from "remix-validated-form";
import { useRouteData } from "~/hooks";
import type { Service } from "~/modules/parts";
import { ServiceForm, serviceValidator, upsertService } from "~/modules/parts";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "parts",
  });

  const { serviceId } = params;
  if (!serviceId) throw new Error("Could not find serviceId");

  // validate with partsValidator
  const validation = await serviceValidator.validate(await request.formData());

  if (validation.error) {
    return validationError(validation.error);
  }

  const updatePart = await upsertService(client, {
    ...validation.data,
    id: serviceId,
    updatedBy: userId,
  });

  if (updatePart.error) {
    return redirect(
      path.to.service(serviceId),
      await flash(request, error(updatePart.error, "Failed to update part"))
    );
  }

  return redirect(
    path.to.service(serviceId),
    await flash(request, success("Updated part"))
  );
}

export default function ServiceDetailsRoute() {
  const { serviceId } = useParams();
  if (!serviceId) throw new Error("Could not find serviceId");
  const routeData = useRouteData<{ service: Service }>(
    path.to.service(serviceId)
  );
  if (!routeData) throw new Error("Could not find part data");

  const initialValues = {
    id: routeData.service?.id!,
    name: routeData.service?.name ?? "",
    description: routeData.service?.description ?? undefined,
    serviceType: routeData.service?.serviceType ?? "Internal",
    partGroupId: routeData.service?.partGroupId ?? undefined,
    active: routeData.service?.active ?? true,
    blocked: routeData.service?.blocked ?? false,
  };

  return <ServiceForm initialValues={initialValues} />;
}
