import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { destroyAuthSession } from "~/services/session";
import { assertIsPost } from "~/utils/http";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);

  return destroyAuthSession(request);
}

export async function loader() {
  return redirect("/");
}
