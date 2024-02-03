import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { validationError } from "remix-validated-form";
import {
  ExchangeRatesForm,
  apiKey,
  exchangeRatesFormValidator,
  getIntegration,
  updateIntegration,
} from "~/modules/settings";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

const defaultValue = {
  apiKey: "",
  active: false,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    update: "settings",
  });

  const integration = await getIntegration(client, "exchange-rates-v1");
  if (integration.error) {
    return redirect(
      path.to.integrations,
      await flash(
        request,
        error(integration.error, "Failed to load integration")
      )
    );
  }

  const validIntegration = apiKey.safeParse(integration.data?.metadata);

  return json({
    integration: validIntegration.success
      ? {
          active: integration.data?.active,
          ...validIntegration.data,
        }
      : defaultValue,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "settings",
  });

  const validation = await exchangeRatesFormValidator.validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { active, ...data } = validation.data;

  const update = await updateIntegration(client, {
    id: "exchange-rates-v1",
    active,
    metadata: {
      ...data,
    },
    updatedBy: userId,
  });
  if (update.error) {
    return redirect(
      path.to.integrations,
      await flash(
        request,
        error(update.error, "Failed to update exchange rates integration")
      )
    );
  }

  return redirect(
    path.to.integrations,
    await flash(request, success("Updated exchange rates integration"))
  );
}

export default function ExchangeRatesIntegrationRoute() {
  const { integration } = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  return (
    <ExchangeRatesForm
      initialValues={integration}
      onClose={() => navigate(path.to.integrations)}
    />
  );
}
