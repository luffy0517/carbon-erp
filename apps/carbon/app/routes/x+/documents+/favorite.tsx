import { json, type ActionFunctionArgs } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import { updateDocumentFavorite } from "~/modules/documents";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { favoriteSchema } from "~/types/validators";
import { error } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  const { client, userId } = await requirePermissions(request, {
    view: "purchasing",
  });

  const validation = await withZod(favoriteSchema).validate(
    await request.formData()
  );
  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, favorite } = validation.data;

  const result = await updateDocumentFavorite(client, {
    id,
    favorite: favorite === "favorite",
    userId,
  });

  if (result.error) {
    return json(
      {},
      await flash(request, error(result, "Failed to favorite purchase order"))
    );
  }

  return json({});
}
