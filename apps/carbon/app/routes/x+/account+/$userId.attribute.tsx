import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { validationError } from "remix-validated-form";
import {
  attributeBooleanValidator,
  attributeNumericValidator,
  attributeTextValidator,
  attributeUserValidator,
} from "~/services/account";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import { upsertUserAttributeValue } from "~/services/account";
import { getAttribute } from "~/services/resources";
import { getUserClaims } from "~/services/users";
import { assertIsPost } from "~/utils/http";
import { error, success } from "~/utils/result";

export async function action({ request, params }: ActionArgs) {
  assertIsPost(request);

  const { client, userId } = await requirePermissions(request, {});
  const { userId: targetUserId } = params;

  if (!targetUserId) {
    throw new Error("No user id provided");
  }

  const formData = await request.formData();

  const attributeId = formData.get("userAttributeId") as string;
  if (!attributeId) throw new Error("No attribute id provided");

  const clientClaims = await getUserClaims(request, client);
  const canUpdateAnyUser = clientClaims.permissions["users"]?.update === true;

  if (!canUpdateAnyUser && userId !== targetUserId) {
    return json(
      null,
      await flash(request, error(null, "Unauthorized: Cannot update attribute"))
    );
  }

  if (!canUpdateAnyUser && userId === targetUserId) {
    // check if this is a self managed attribute
    const attribute = await getAttribute(client, attributeId);
    if (attribute.error) {
      return json(
        null,
        await flash(request, error(attribute.error, "Failed to get attribute"))
      );
    }

    const canSelfManage = attribute.data?.canSelfManage ?? false;
    if (!canSelfManage) {
      return json(
        null,
        await flash(
          request,
          error(null, "Unauthorized: Cannot update attribute")
        )
      );
    }
  }

  const type = formData.get("type") as string;
  if (!type) throw new Error("No type provided");

  const validator = getValidatorByType(type);

  const validation = await validator.validate(formData);
  if (validation.error) {
    return validationError(validation.error);
  }

  const upsertAttributeValue = await upsertUserAttributeValue(client, {
    ...validation.data,
    userId: targetUserId,
    updatedBy: userId,
  });
  if (upsertAttributeValue.error) {
    return json(
      null,
      await flash(
        request,
        error(upsertAttributeValue.error, "Failed to update attribute value")
      )
    );
  }

  return json(null, await flash(request, success("Updated attribute value")));
}

export default function UserAttributeValueRoute() {
  // Remix bug
  return null;
}

function getValidatorByType(type: string) {
  switch (type) {
    case "boolean":
      return attributeBooleanValidator;
    case "date":
      return attributeTextValidator;
    case "list":
      return attributeTextValidator;
    case "numeric":
      return attributeNumericValidator;
    case "text":
      return attributeTextValidator;
    case "user":
      return attributeUserValidator;
    default:
      throw new Error("Invalid type provided");
  }
}
