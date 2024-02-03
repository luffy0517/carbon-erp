import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { validationError } from "remix-validated-form";
import type { AccountClass, AccountIncomeBalance } from "~/modules/accounting";
import {
  AccountCategoryForm,
  accountCategoryValidator,
  upsertAccountCategory,
} from "~/modules/accounting";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "accounting",
  });

  const validation = await accountCategoryValidator.validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const createAccountCategory = await upsertAccountCategory(client, {
    ...data,
    createdBy: userId,
  });
  if (createAccountCategory.error) {
    return redirect(
      path.to.accountingCategories,
      await flash(
        request,
        error(
          createAccountCategory.error,
          "Failed to create G/L account category"
        )
      )
    );
  }

  return redirect(path.to.accountingCategories);
}

export default function NewAccountCategoryRoute() {
  const navigate = useNavigate();
  const onClose = () => navigate(path.to.accountingCategories);

  const initialValues = {
    category: "",
    incomeBalance: "" as AccountIncomeBalance,
    class: "" as AccountClass,
  };

  return (
    <AccountCategoryForm onClose={onClose} initialValues={initialValues} />
  );
}
