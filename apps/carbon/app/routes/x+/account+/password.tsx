import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/router";
import { validationError } from "remix-validated-form";
import { PageTitle } from "~/components/Layout";
import { getSupabaseServiceRole } from "~/lib/supabase";
import { PasswordForm } from "~/interfaces/Account/Password";
import { accountPasswordValidator } from "~/services/account";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import { assertIsPost } from "~/utils/http";
import { error, success } from "~/utils/result";

export async function action({ request }: ActionArgs) {
  assertIsPost(request);
  const { email, userId } = await requirePermissions(request, {});

  const validation = await accountPasswordValidator.validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { currentPassword, password } = validation.data;

  const confirmPassword =
    await getSupabaseServiceRole().auth.signInWithPassword({
      email,
      password: currentPassword,
    });

  if (confirmPassword.error || !("user" in confirmPassword.data)) {
    return json(
      {},
      await flash(request, error(null, "Current password is invalid"))
    );
  }

  const updatePassword =
    await getSupabaseServiceRole().auth.admin.updateUserById(userId, {
      password,
    });

  if (updatePassword.error) {
    return json(
      {},
      await flash(
        request,
        error(updatePassword.error, "Failed to update password")
      )
    );
  }

  return redirect("/x", await flash(request, success("Updated password")));
}

export default function AccountPassword() {
  return (
    <>
      <PageTitle
        title="Change Password"
        subtitle="Make sure it's at least 12 characters"
      />
      <PasswordForm />
    </>
  );
}
