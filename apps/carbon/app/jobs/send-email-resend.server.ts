import { eventTrigger } from "@trigger.dev/sdk";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import { z } from "zod";

import { getSupabaseServiceRole } from "~/lib/supabase";
import { triggerClient } from "~/lib/trigger.server";
import { resendIntegration } from "~/modules/settings";

const supabaseClient = getSupabaseServiceRole();

const job = triggerClient.defineJob({
  id: "send-email-resend",
  name: "Send Email with Resend",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "resend.email",
    schema: z.object({
      to: z.union([z.string(), z.array(z.string())]),
      cc: z.union([z.string(), z.array(z.string())]).optional(),
      from: z.string().optional(),
      subject: z.string(),
      html: z.string(),
      attachments: z
        .object({
          filename: z.string(),
          content: z.any(),
        })
        .array()
        .optional(),
    }),
  }),
  run: async (payload, io, ctx) => {
    const integration = await supabaseClient
      .from("integration")
      .select("active, metadata")
      .eq("id", "resend")
      .maybeSingle();

    const integrationMetadata = resendIntegration.safeParse(
      integration?.data?.metadata
    );

    if (!integrationMetadata.success || integration?.data?.active !== true)
      return;

    const resend = new Resend(integrationMetadata.data.apiKey);

    await io.logger.info(`📬 Resend Email Job`);
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: payload.to,
      reply_to: payload.from,
      subject: payload.subject,
      html: payload.html,
      attachments: payload.attachments,
      headers: {
        "X-Entity-Ref-ID": nanoid(7),
      },
    });
  },
});

export default job;
