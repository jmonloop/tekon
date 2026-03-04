import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmailHtml,
  buildEmailSubject,
  type InquiryRecord,
  type WebhookPayload,
} from "./lib.ts";

const FROM_ADDRESS = "Tekon Web <noreply@carretillastekon.com>";
const TO_ADDRESS = "info@carretillastekon.com";

async function fetchForkliftName(
  forkliftId: string,
): Promise<string | undefined> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data } = await supabase
    .from("forklifts")
    .select("name")
    .eq("id", forkliftId)
    .single();

  return data?.name;
}

async function sendEmail(
  inquiry: InquiryRecord,
  forkliftName?: string,
): Promise<Response> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
  const subject = buildEmailSubject(inquiry.name, forkliftName);
  const html = buildEmailHtml(inquiry, forkliftName);

  return await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [TO_ADDRESS],
      subject,
      html,
    }),
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    const payload: WebhookPayload = await req.json();

    if (payload.type !== "INSERT" || payload.table !== "inquiries") {
      return new Response(
        JSON.stringify({ message: "Not an inquiry INSERT event" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const inquiry = payload.record;

    let forkliftName: string | undefined;
    if (inquiry.forklift_id) {
      forkliftName = await fetchForkliftName(inquiry.forklift_id);
    }

    const res = await sendEmail(inquiry, forkliftName);
    const resData = await res.json();

    return new Response(JSON.stringify(resData), {
      status: res.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
