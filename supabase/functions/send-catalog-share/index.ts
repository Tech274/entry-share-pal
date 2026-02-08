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
const RATE_LIMIT_WINDOW_HOURS = 1;
const RATE_LIMIT_MAX_SHARES = 10;

// Zod schemas for input validation
const sharedItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
});

const shareCatalogSchema = z.object({
  recipientEmail: z
    .string()
    .email("Invalid email format")
    .max(255, "Email too long"),
  recipientName: z
    .string()
    .max(100, "Name too long")
    .optional()
    .nullable(),
  personalMessage: z
    .string()
    .max(1000, "Message too long")
    .optional()
    .nullable(),
  catalogUrl: z
    .string()
    .url("Invalid catalog URL")
    .max(500, "URL too long"),
  shareType: z
    .enum(["catalog", "template", "bundle"])
    .optional()
    .default("catalog"),
  sharedItems: z
    .array(sharedItemSchema)
    .max(50, "Too many items")
    .optional()
    .default([]),
});

// Generate a unique share ID for tracking
function generateShareId(): string {
  return `share_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Check rate limit based on sender email (catalog shares per hour)
async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  senderEmail: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000);

  const { count, error: countError } = await supabase
    .from("catalog_share_tracking")
    .select("*", { count: "exact", head: true })
    .eq("sender_email", senderEmail)
    .gte("created_at", windowStart.toISOString());

  if (countError) {
    console.error("Error checking rate limit:", countError);
    return { allowed: true, remaining: RATE_LIMIT_MAX_SHARES };
  }

  const shareCount = count || 0;
  const remaining = Math.max(0, RATE_LIMIT_MAX_SHARES - shareCount - 1);

  if (shareCount >= RATE_LIMIT_MAX_SHARES) {
    return { allowed: false, remaining: 0 };
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
    return new Response("ok", { headers: corsHeaders });
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

    const userEmail = claimsData.claims.email as string;
    console.log(`Authenticated request from: ${userEmail}`);

    // Use service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(supabase, userEmail);

    const rateLimitHeaders = {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-RateLimit-Limit": RATE_LIMIT_MAX_SHARES.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
    };

    if (!allowed) {
      console.warn(`Rate limit exceeded for sender: ${userEmail}`);
      return new Response(
        JSON.stringify({
          error: `Too many catalog shares. Limit: ${RATE_LIMIT_MAX_SHARES} per hour.`,
          retryAfter: RATE_LIMIT_WINDOW_HOURS * 3600,
        }),
        { status: 429, headers: rateLimitHeaders }
      );
    }

    // Parse and validate request body
    const rawPayload = await req.json();
    const validationResult = shareCatalogSchema.safeParse(rawPayload);

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

    const payload = validationResult.data;
    console.log(`Sending ${payload.shareType} share email to ${payload.recipientEmail}`, {
      itemCount: payload.sharedItems.length,
    });

    // Generate share ID for tracking
    const shareId = generateShareId();

    // Insert tracking record with sender email
    const { error: trackingError } = await supabase.from("catalog_share_tracking").insert({
      share_id: shareId,
      recipient_email: payload.recipientEmail,
      recipient_name: payload.recipientName || null,
      sender_email: userEmail,
      share_type: payload.shareType,
      shared_items: payload.sharedItems.length > 0 ? payload.sharedItems : null,
      personal_message: payload.personalMessage || null,
      catalog_url: payload.catalogUrl,
    });

    if (trackingError) {
      console.error("Error creating tracking record:", trackingError);
    } else {
      console.log("Tracking record created:", shareId);
    }

    // Sanitize personal message
    const safePersonalMessage = payload.personalMessage
      ? sanitizeHtml(payload.personalMessage)
      : null;

    const greeting = payload.recipientName
      ? `Hi ${sanitizeHtml(payload.recipientName)},`
      : "Hi there,";

    const personalSection = safePersonalMessage
      ? `<p style="margin: 20px 0; padding: 15px; background: #f0f7ff; border-left: 4px solid #0066cc; border-radius: 4px; font-style: italic;">"${safePersonalMessage}"</p>`
      : "";

    // Build subject and content based on share type
    let subject: string;
    let introText: string;
    let itemsSection = "";

    if (payload.shareType === "template" && payload.sharedItems.length > 0) {
      const templateName = sanitizeHtml(payload.sharedItems[0].name);
      subject = `MakeMyLabs Lab Recommendation: ${templateName}`;
      introText = `Someone shared a lab template with you from the <strong>MakeMyLabs Lab Catalog</strong>.`;

      itemsSection = `
        <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="margin: 0 0 10px; font-size: 18px; color: #333;">${templateName}</h3>
          <p style="margin: 0 0 10px; color: #666; font-size: 14px;">${sanitizeHtml(payload.sharedItems[0].description || "")}</p>
          <span style="display: inline-block; padding: 4px 12px; background: #e6f0ff; color: #0066cc; border-radius: 20px; font-size: 12px;">${sanitizeHtml(payload.sharedItems[0].category)}</span>
        </div>
      `;
    } else if (payload.shareType === "bundle" && payload.sharedItems.length > 0) {
      subject = `MakeMyLabs Lab Bundle: ${payload.sharedItems.length} Labs Selected for You`;
      introText = `Someone has curated a bundle of ${payload.sharedItems.length} labs for you from the <strong>MakeMyLabs Lab Catalog</strong>.`;

      const labsList = payload.sharedItems
        .map(
          (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <div style="font-weight: 600; color: #333;">${sanitizeHtml(item.name)}</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">${sanitizeHtml(item.category)}</div>
          </td>
        </tr>
      `
        )
        .join("");

      itemsSection = `
        <div style="margin: 20px 0;">
          <h3 style="margin: 0 0 15px; font-size: 16px; color: #333;">Labs in this bundle:</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9fa; border-radius: 8px; overflow: hidden;">
            ${labsList}
          </table>
        </div>
      `;
    } else {
      subject = "MakeMyLabs Lab Catalog - Explore Our Training Solutions";
      introText = `You've been invited to explore the <strong>MakeMyLabs Lab Catalog</strong> — your comprehensive resource for enterprise training solutions.`;
    }

    // Tracking pixel URL
    const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email-open?sid=${shareId}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background: #f5f5f5;
          }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { 
            background: linear-gradient(135deg, #0066cc 0%, #004499 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .header p { margin: 10px 0 0; opacity: 0.9; font-size: 14px; }
          .content { padding: 30px 20px; }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
            color: white !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            padding: 25px 20px; 
            color: #888; 
            font-size: 12px; 
            background: #f8f9fa;
            border-top: 1px solid #eee;
          }
          .footer a { color: #0066cc; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MakeMyLabs</h1>
            <p>${payload.shareType === "bundle" ? "Lab Bundle Recommendation" : payload.shareType === "template" ? "Lab Template Recommendation" : "Enterprise Training Lab Solutions"}</p>
          </div>
          <div class="content">
            <p>${greeting}</p>
            <p>${introText}</p>
            ${personalSection}
            ${itemsSection}
            <div style="text-align: center;">
              <a href="${payload.catalogUrl}?ref=${shareId}" class="cta-button">
                ${payload.shareType === "bundle" ? "View Bundle Details" : payload.shareType === "template" ? "View Lab Template" : "View Lab Catalog"}
              </a>
            </div>
            ${
              payload.shareType === "catalog"
                ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0; text-align: center;">
              <tr>
                <td style="padding: 15px 10px; background: #f8f9fa; border-radius: 8px;">
                  <div style="font-size: 24px; font-weight: 700; color: #0066cc;">2500+</div>
                  <div style="font-size: 12px; color: #666; text-transform: uppercase;">Templates</div>
                </td>
                <td style="width: 15px;"></td>
                <td style="padding: 15px 10px; background: #f8f9fa; border-radius: 8px;">
                  <div style="font-size: 24px; font-weight: 700; color: #0066cc;">50+</div>
                  <div style="font-size: 12px; color: #666; text-transform: uppercase;">Categories</div>
                </td>
                <td style="width: 15px;"></td>
                <td style="padding: 15px 10px; background: #f8f9fa; border-radius: 8px;">
                  <div style="font-size: 24px; font-weight: 700; color: #0066cc;">250+</div>
                  <div style="font-size: 12px; color: #666; text-transform: uppercase;">Technologies</div>
                </td>
              </tr>
            </table>
            `
                : ""
            }
            <p style="color: #666; font-size: 14px;">
              Have questions? Reply to this email or contact our team directly.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MakeMyLabs. All rights reserved.</p>
            <p><a href="${payload.catalogUrl}">View Catalog</a></p>
          </div>
        </div>
        <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
      </body>
      </html>
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "MakeMyLabs <onboarding@resend.dev>",
      to: [payload.recipientEmail],
      subject,
      html: htmlContent,
    });

    console.log("Catalog share email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse, shareId }),
      { status: 200, headers: rateLimitHeaders }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    console.error("Error sending catalog share email:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
