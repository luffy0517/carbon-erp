import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { ConfirmDelete } from "~/components/Modals";
import { deleteLocation, getLocation } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { notFound } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "resources",
    role: "employee",
  });

  const { locationId } = params;
  if (!locationId) throw notFound("locationId not found");

  const location = await getLocation(client, locationId);
  if (location.error) {
    return redirect(
      path.to.locations,
      await flash(request, error(location.error, "Failed to get location"))
    );
  }

  return json({
    location: location.data,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "resources",
  });

  const { locationId } = params;
  if (!locationId) {
    return redirect(
      path.to.locations,
      await flash(request, error(params, "Failed to get location id"))
    );
  }

  const { error: deleteLocationError } = await deleteLocation(
    client,
    locationId
  );
  if (deleteLocationError) {
    return redirect(
      path.to.locations,
      await flash(
        request,
        error(deleteLocationError, "Failed to delete location")
      )
    );
  }

  return redirect(
    path.to.locations,
    await flash(request, success("Successfully deleted location"))
  );
}

export default function DeleteLocationRoute() {
  const { locationId } = useParams();
  const { location } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (!location) return null;
  if (!locationId) throw new Error("locationId is not found");

  const onCancel = () => navigate(path.to.locations);

  return (
    <ConfirmDelete
      action={path.to.deleteLocation(locationId)}
      name={location.name}
      text={`Are you sure you want to delete the location: ${location.name}? This cannot be undone.`}
      onCancel={onCancel}
    />
  );
}
