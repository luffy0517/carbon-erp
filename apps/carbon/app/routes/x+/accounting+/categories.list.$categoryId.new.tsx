import { useNavigate, useParams } from "@remix-run/react";
import { AccountSubcategoryForm } from "~/modules/accounting";

import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { validationError } from "remix-validated-form";
import {
  accountSubcategoryValidator,
  upsertAccountSubcategory,
} from "~/modules/accounting";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "accounting",
  });

  const validation = await accountSubcategoryValidator.validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const createSubcategory = await upsertAccountSubcategory(client, {
    ...data,
    createdBy: userId,
  });
  if (createSubcategory.error) {
    return json(
      {},
      await flash(
        request,
        error(
          createSubcategory.error,
          "Failed to create G/L account subcategory"
        )
      )
    );
  }

  return redirect(path.to.accountingCategories);
}

export default function NewAccountSubcategoryRoute() {
  const { categoryId } = useParams();
  if (!categoryId) throw new Error("categoryId is not found");

  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  const initialValues = {
    name: "",
    accountCategoryId: categoryId,
  };

  return (
    <AccountSubcategoryForm initialValues={initialValues} onClose={onClose} />
  );
}
