import { Box } from "@chakra-ui/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { validationError } from "remix-validated-form";
import { PartForm, partValidator, upsertPart } from "~/modules/parts";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import { assertIsPost } from "~/utils/http";
import { error, success } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "parts",
  });

  const validation = await partValidator.validate(await request.formData());

  if (validation.error) {
    return validationError(validation.error);
  }

  const createPart = await upsertPart(client, {
    ...validation.data,
    active: true,
    createdBy: userId,
  });
  if (createPart.error) {
    return redirect(
      "/x/parts/search",
      await flash(request, error(createPart.error, "Failed to insert part"))
    );
  }

  const partId = createPart.data?.id;

  return redirect(
    `/x/part/${partId}`,
    await flash(request, success("Created part"))
  );
}

export default function PartsNewRoute() {
  const initialValues = {
    name: "",
    description: "",
    partType: "Inventory" as "Inventory",
    replenishmentSystem: "Buy" as "Buy",
    unitOfMeasureCode: "EA",
  };

  return (
    <Box w="50%" maxW={720} minW={420}>
      <PartForm initialValues={initialValues} />
    </Box>
  );
}
