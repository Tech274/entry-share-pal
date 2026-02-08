import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-forwarded-for, x-real-ip",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MINUTES = 1;
const RATE_LIMIT_MAX_REQUESTS = 5;

// Zod schema for input validation
const submitRequestSchema = z.object({
  taskType: z.enum(["Lab Request - Solutions", "Lab Request - Delivery"]),
  requesterEmail: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  tenantName: z
    .string()
    .max(200, "Tenant name must be less than 200 characters")
    .optional()
    .default("Unknown"),
  potentialId: z
    .string()
    .min(1, "Potential ID is required")
    .max(100, "Potential ID must be less than 100 characters"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  labType: z
    .string()
    .max(100, "Lab type must be less than 100 characters")
    .optional()
    .nullable(),
  lineOfBusiness: z
    .string()
    .max(100, "Line of business must be less than 100 characters")
    .optional()
    .nullable(),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters"),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .default(""),
  attachmentUrl: z
    .string()
    .url("Invalid attachment URL")
    .optional()
    .nullable(),
  attachmentName: z
    .string()
    .max(200, "Attachment name must be less than 200 characters")
    .optional()
    .nullable(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: "End date must be after or equal to start date", path: ["endDate"] }
);

// Extract client IP from request headers
function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

// Check rate limit and log request
// deno-lint-ignore no-explicit-any
async function checkRateLimit(
  supabase: any,
  ip: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

  // Count requests in the current window
  const { count, error: countError } = await supabase
    .from("rate_limit_log")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .eq("endpoint", endpoint)
    .gte("created_at", windowStart.toISOString());

  if (countError) {
    console.error("Error checking rate limit:", countError);
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  }

  const requestCount = count || 0;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - requestCount - 1);

  if (requestCount >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Log this request
  await supabase
    .from("rate_limit_log")
    .insert({ ip_address: ip, endpoint });

  // Periodically cleanup old records (1% chance per request)
  if (Math.random() < 0.01) {
    supabase.rpc("cleanup_old_rate_limits");
  }

  return { allowed: true, remaining };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(req);
    console.log(`Request from IP: ${clientIP}`);

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(supabase, clientIP, "submit-request");
    
    const rateLimitHeaders = {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": new Date(Date.now() + RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString(),
    };

    if (!allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please try again in a minute.",
          retryAfter: RATE_LIMIT_WINDOW_MINUTES * 60
        }),
        { 
          status: 429, 
          headers: {
            ...rateLimitHeaders,
            "Retry-After": (RATE_LIMIT_WINDOW_MINUTES * 60).toString(),
          }
        }
      );
    }

    // Parse and validate request body
    const rawPayload = await req.json();
    const validationResult = submitRequestSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => ({
        field: e.path.join("."),
        message: e.message
      }));
      console.warn("Validation failed:", errors);
      return new Response(
        JSON.stringify({ error: "Validation failed", details: errors }),
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const payload = validationResult.data;

    // Determine the current month and year from start date
    const startDate = new Date(payload.startDate);
    const month = startDate.toLocaleString("en-US", { month: "long" });
    const year = startDate.getFullYear();

    // Sanitize description - remove script tags and dangerous content
    const sanitizedDescription = payload.description
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");

    // Include attachment URL in description if present
    const descriptionWithAttachment = payload.attachmentUrl
      ? `${sanitizedDescription}\n\n<p><strong>Attachment:</strong> <a href="${payload.attachmentUrl}" target="_blank" rel="noopener noreferrer">${payload.attachmentName || "Download"}</a></p>`
      : sanitizedDescription;

    let result;

    if (payload.taskType === "Lab Request - Solutions") {
      // Insert into lab_requests table
      const { data, error } = await supabase.from("lab_requests").insert({
        potential_id: payload.potentialId,
        client: payload.tenantName,
        lab_name: payload.subject,
        requester: payload.requesterEmail,
        lab_start_date: payload.startDate,
        lab_end_date: payload.endDate,
        line_of_business: payload.lineOfBusiness || null,
        remarks: descriptionWithAttachment,
        status: "Solution Pending",
        month,
        year,
      }).select().single();

      if (error) throw error;
      result = data;
    } else {
      // Insert into delivery_requests table
      const { data, error } = await supabase.from("delivery_requests").insert({
        potential_id: payload.potentialId,
        client: payload.tenantName,
        training_name: payload.subject,
        requester: payload.requesterEmail,
        start_date: payload.startDate,
        end_date: payload.endDate,
        lab_type: payload.labType || null,
        line_of_business: payload.lineOfBusiness || null,
        lab_status: "Pending",
        month,
        year,
      }).select().single();

      if (error) throw error;
      result = data;
    }

    console.log(`Successfully created ${payload.taskType} request: ${result.id}`);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: rateLimitHeaders }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to submit request";
    console.error("Error submitting request:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
