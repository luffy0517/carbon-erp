import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  HolidaysTable,
  HolidaysTableFilters,
  getHolidayYears,
  getHolidays,
} from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Holidays",
  to: path.to.holidays,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "resources",
    role: "employee",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const name = searchParams.get("name");
  const year = searchParams.get("year");
  const { limit, offset, sorts } = getGenericQueryFilters(searchParams);

  const [holidays, years] = await Promise.all([
    getHolidays(client, {
      name,
      year: year ? parseInt(year) : null,
      limit,
      offset,
      sorts,
    }),
    getHolidayYears(client),
  ]);

  if (holidays.error) {
    return redirect(
      path.to.resources,
      await flash(request, error(holidays.error, "Failed to load holidays"))
    );
  }

  return json({
    holidays: holidays.data ?? [],
    years:
      years?.data?.map((d) => d.year as number).sort((a, b) => b - a) ?? [],
    count: holidays.count ?? 0,
  });
}

export default function Route() {
  const { holidays, years, count } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <HolidaysTableFilters years={years} />
      <HolidaysTable data={holidays} count={count} />
      <Outlet />
    </VStack>
  );
}
