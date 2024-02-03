import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ServiceType } from "~/modules/parts";
import { getServicesList } from "~/modules/parts";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { error } from "~/utils/result";

export async function loader({ request }: LoaderFunctionArgs) {
  const authorized = await requirePermissions(request, {
    view: "parts",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const type = searchParams.get("type") as ServiceType | null;

  const services = await getServicesList(authorized.client, type);
  if (services.error) {
    return json(
      services,
      await flash(request, error(services.error, "Failed to get services"))
    );
  }

  return json(services);
}
