import { useEffect, useMemo } from "react";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { getSupabase } from "~/lib/supabase";
import { getUserByEmail } from "~/modules/users";
import { refreshAccessToken } from "~/services/auth";
import { callbackValidator } from "~/services/auth/auth.form";
import {
  commitAuthSession,
  destroyAuthSession,
  flash,
  getAuthSession,
} from "~/services/session";
import type { FormActionData } from "~/types";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function loader({ request }: LoaderFunctionArgs) {
  const authSession = await getAuthSession(request);

  if (authSession) await destroyAuthSession(request);

  return json({});
}

export async function action({ request }: ActionFunctionArgs): FormActionData {
  assertIsPost(request);

  const validation = await callbackValidator.validate(await request.formData());

  if (validation.error) {
    return json(error(validation.error, "Invalid callback form"), {
      status: 400,
    });
  }

  const { refreshToken } = validation.data;
  const authSession = await refreshAccessToken(refreshToken);
  if (!authSession) {
    return redirect(
      path.to.root,
      await flash(request, error(authSession, "Invalid refresh token"))
    );
  }

  const user = await getUserByEmail(authSession.email);
  if (user?.data) {
    return redirect(path.to.resetPassord, {
      headers: {
        "Set-Cookie": await commitAuthSession(request, {
          authSession,
        }),
      },
    });
  } else {
    return redirect(
      path.to.root,
      await flash(request, error(user.error, "User not found"))
    );
  }
}

export default function AuthCallback() {
  const fetcher = useFetcher();
  const supabase = useMemo(() => getSupabase(), []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, supabaseSession) => {
      if (event === "SIGNED_IN") {
        // supabase sdk has ability to read url fragment that contains your token after third party provider redirects you here
        // this fragment url looks like https://.....#access_token=evxxxxxxxx&refresh_token=xxxxxx, and it's not readable server-side (Oauth security)
        // supabase auth listener gives us a user session, based on what it founds in this fragment url
        // we can't use it directly, client-side, because we can't access sessionStorage from here

        // we should not trust what's happen client side
        // so, we only pick the refresh token, and let's back-end getting user session from it
        const refreshToken = supabaseSession?.refresh_token;

        if (!refreshToken) return;

        const formData = new FormData();
        formData.append("refreshToken", refreshToken);
        fetcher.submit(formData, { method: "post" });
      }
    });

    return () => {
      // to prevent a memory leak
      subscription.unsubscribe();
    };
  }, [fetcher, supabase.auth]);

  return null;
}
