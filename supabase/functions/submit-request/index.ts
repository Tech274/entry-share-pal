import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmitRequestPayload {
  taskType: string;
  requesterEmail: string;
  tenantName: string;
  potentialId: string;
  startDate: string;
  endDate: string;
  labType: string;
  lineOfBusiness: string;
  subject: string;
  description: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: SubmitRequestPayload = await req.json();
    
    // Validate required fields
    if (!payload.requesterEmail || !payload.potentialId || !payload.startDate || !payload.endDate || !payload.subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine the current month and year from start date
    const startDate = new Date(payload.startDate);
    const month = startDate.toLocaleString("en-US", { month: "long" });
    const year = startDate.getFullYear();

    // Include attachment URL in description if present
    const descriptionWithAttachment = payload.attachmentUrl
      ? `${payload.description}\n\n<p><strong>Attachment:</strong> <a href="${payload.attachmentUrl}" target="_blank">${payload.attachmentName}</a></p>`
      : payload.description;

    let result;

    if (payload.taskType === "Lab Request - Solutions") {
      // Insert into lab_requests table
      const { data, error } = await supabase.from("lab_requests").insert({
        potential_id: payload.potentialId,
        client: payload.tenantName || "Unknown",
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
        client: payload.tenantName || "Unknown",
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

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
