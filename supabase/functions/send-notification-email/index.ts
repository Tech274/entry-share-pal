import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MINUTES = 5;
const RATE_LIMIT_MAX_EMAILS = 20;

// Zod schema for input validation
const requestDetailsSchema = z.object({
  potentialId: z.string().max(100).optional().nullable(),
  client: z.string().max(200).optional().nullable(),
  subject: z.string().max(200).optional().nullable(),
  taskType: z.string().max(100).optional().nullable(),
  oldStatus: z.string().max(50).optional().nullable(),
  newStatus: z.string().max(50).optional().nullable(),
});

const notificationSchema = z.object({
  type: z.enum(["submission", "status_change"]),
  recipientEmail: z
    .string()
    .email("Invalid email format")
    .max(255, "Email too long"),
  requestDetails: requestDetailsSchema,
});

// Check rate limit using rate_limit_log table
async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

  const { count, error: countError } = await supabase
    .from("rate_limit_log")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", userId) // Using userId as identifier for authenticated requests
    .eq("endpoint", endpoint)
    .gte("created_at", windowStart.toISOString());

  if (countError) {
    console.error("Error checking rate limit:", countError);
    return { allowed: true, remaining: RATE_LIMIT_MAX_EMAILS };
  }

  const requestCount = count || 0;
  const remaining = Math.max(0, RATE_LIMIT_MAX_EMAILS - requestCount - 1);

  if (requestCount >= RATE_LIMIT_MAX_EMAILS) {
    return { allowed: false, remaining: 0 };
  }

  // Log this request
  const { error: insertError } = await supabase
    .from("rate_limit_log")
    .insert({ ip_address: userId, endpoint });

  if (insertError) {
    console.error("Error logging rate limit:", insertError);
  }

  return { allowed: true, remaining };
}

// Sanitize HTML content
function sanitizeHtml(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require valid JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate the JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("JWT validation failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    console.log(`Authenticated notification request from user: ${userId}`);

    // Use service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(supabase, userId, "send-notification-email");

    const rateLimitHeaders = {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-RateLimit-Limit": RATE_LIMIT_MAX_EMAILS.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
    };

    if (!allowed) {
      console.warn(`Rate limit exceeded for user: ${userId}`);
      return new Response(
        JSON.stringify({
          error: `Too many notification emails. Limit: ${RATE_LIMIT_MAX_EMAILS} per ${RATE_LIMIT_WINDOW_MINUTES} minutes.`,
          retryAfter: RATE_LIMIT_WINDOW_MINUTES * 60,
        }),
        { status: 429, headers: rateLimitHeaders }
      );
    }

    // Parse and validate request body
    const rawPayload = await req.json();
    const validationResult = notificationSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      console.warn("Validation failed:", errors);
      return new Response(
        JSON.stringify({ error: "Validation failed", details: errors }),
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const { type, recipientEmail, requestDetails } = validationResult.data;
    console.log(`Sending ${type} notification to ${recipientEmail}`, requestDetails);

    let subject: string;
    let htmlContent: string;

    // Sanitize all user-provided content
    const safeDetails = {
      potentialId: requestDetails.potentialId ? sanitizeHtml(requestDetails.potentialId) : "N/A",
      client: requestDetails.client ? sanitizeHtml(requestDetails.client) : "N/A",
      subject: requestDetails.subject ? sanitizeHtml(requestDetails.subject) : "N/A",
      taskType: requestDetails.taskType ? sanitizeHtml(requestDetails.taskType) : "N/A",
      oldStatus: requestDetails.oldStatus ? sanitizeHtml(requestDetails.oldStatus) : "Previous",
      newStatus: requestDetails.newStatus ? sanitizeHtml(requestDetails.newStatus) : "New",
    };

    if (type === "submission") {
      subject = `Request Submitted: ${safeDetails.subject !== "N/A" ? safeDetails.subject : safeDetails.potentialId}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #555; }
            .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Request Submitted Successfully</h1>
            </div>
            <div class="content">
              <p>Your request has been submitted and is now being processed by our team.</p>
              <div class="detail">
                <span class="label">Request Type:</span> ${safeDetails.taskType}
              </div>
              <div class="detail">
                <span class="label">Potential ID:</span> ${safeDetails.potentialId}
              </div>
              <div class="detail">
                <span class="label">Client:</span> ${safeDetails.client}
              </div>
              <div class="detail">
                <span class="label">Subject:</span> ${safeDetails.subject}
              </div>
              <p style="margin-top: 20px;">You can track the status of your request by visiting the <strong>My Requests</strong> page.</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from MakeMyLabs</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = `Status Update: ${safeDetails.subject !== "N/A" ? safeDetails.subject : safeDetails.potentialId}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .status-change { display: flex; justify-content: center; align-items: center; margin: 20px 0; gap: 15px; }
            .status { padding: 10px 20px; border-radius: 20px; font-weight: bold; }
            .old-status { background: #dc3545; color: white; }
            .arrow { font-size: 24px; color: #666; }
            .new-status { background: #28a745; color: white; }
            .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #555; }
            .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Request Status Updated</h1>
            </div>
            <div class="content">
              <p>The status of your request has been updated.</p>
              <div class="status-change">
                <span class="status old-status">${safeDetails.oldStatus}</span>
                <span class="arrow">→</span>
                <span class="status new-status">${safeDetails.newStatus}</span>
              </div>
              <div class="detail">
                <span class="label">Potential ID:</span> ${safeDetails.potentialId}
              </div>
              <div class="detail">
                <span class="label">Client:</span> ${safeDetails.client}
              </div>
              <p style="margin-top: 20px;">Visit the <strong>My Requests</strong> page to view more details.</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from MakeMyLabs</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "MakeMyLabs <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { status: 200, headers: rateLimitHeaders }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
