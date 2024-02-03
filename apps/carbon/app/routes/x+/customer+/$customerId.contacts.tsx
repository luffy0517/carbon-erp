import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { CustomerContacts, getCustomerContacts } from "~/modules/sales";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "sales",
  });

  const { customerId } = params;
  if (!customerId) throw new Error("Could not find customerId");

  const contacts = await getCustomerContacts(client, customerId);
  if (contacts.error) {
    return redirect(
      path.to.customer(customerId),
      await flash(
        request,
        error(contacts.error, "Failed to fetch customer contacts")
      )
    );
  }

  return json({
    contacts: contacts.data ?? [],
  });
}

export default function CustomerContactsRoute() {
  const { contacts } = useLoaderData<typeof loader>();

  return <CustomerContacts contacts={contacts} />;
}
