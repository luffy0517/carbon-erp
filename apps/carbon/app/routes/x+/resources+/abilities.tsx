import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  AbilitiesTable,
  AbilitiesTableFilters,
  getAbilities,
} from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Abilities",
  to: path.to.abilities,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "resources",
    role: "employee",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const name = searchParams.get("name");
  const { limit, offset, sorts } = getGenericQueryFilters(searchParams);

  const abilities = await getAbilities(client, { name, limit, offset, sorts });

  if (abilities.error) {
    return redirect(
      path.to.resources,
      await flash(request, error(abilities.error, "Failed to load abilities"))
    );
  }

  return json({
    abilities: abilities.data ?? [],
    count: abilities.count ?? 0,
  });
}

export default function AbilitiesRoute() {
  const { abilities, count } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <AbilitiesTableFilters />
      <AbilitiesTable data={abilities} count={count} />
      <Outlet />
    </VStack>
  );
}
