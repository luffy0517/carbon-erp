import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireResourcePermissions } from "~/services/auth";
import { getCustomerContacts } from "~/services/sales";
import { flash } from "~/services/session";
import { error } from "~/utils/result";

export async function loader({ request }: LoaderArgs) {
  const authorized = await requireResourcePermissions(request, {
    view: "sales",
  });
  if (!authorized) return json({ data: [] });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const customerId = searchParams.get("customerId") as string;

  if (!customerId || customerId === "undefined")
    return json({
      data: [],
    });

  const contacts = await getCustomerContacts(authorized.client, customerId);
  if (contacts.error) {
    return json(
      contacts,
      await flash(
        request,
        error(contacts.error, "Failed to get customer contacts")
      )
    );
  }

  return json(contacts);
}
