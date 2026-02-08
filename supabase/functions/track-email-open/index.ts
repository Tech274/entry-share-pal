import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// 1x1 transparent GIF
const TRANSPARENT_GIF = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 
  0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 
  0x01, 0x00, 0x3b
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shareId = url.searchParams.get('sid');

    if (!shareId) {
      console.log("No share ID provided for tracking");
      return new Response(TRANSPARENT_GIF, {
        status: 200,
        headers: {
          "Content-Type": "image/gif",
          ...corsHeaders,
        },
      });
    }

    console.log(`Tracking email open for share ID: ${shareId}`);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get current tracking record
      const { data: existingRecord, error: fetchError } = await supabase
        .from('catalog_share_tracking')
        .select('open_count, first_opened_at')
        .eq('share_id', shareId)
        .single();

      if (fetchError) {
        console.error("Error fetching tracking record:", fetchError);
      } else if (existingRecord) {
        // Update tracking record
        const updateData: any = {
          last_opened_at: new Date().toISOString(),
          open_count: (existingRecord.open_count || 0) + 1,
        };

        // Set first_opened_at only if not already set
        if (!existingRecord.first_opened_at) {
          updateData.first_opened_at = new Date().toISOString();
        }

        const { error: updateError } = await supabase
          .from('catalog_share_tracking')
          .update(updateData)
          .eq('share_id', shareId);

        if (updateError) {
          console.error("Error updating tracking record:", updateError);
        } else {
          console.log(`Email open tracked for ${shareId}, count: ${updateData.open_count}`);
        }
      }
    }

    // Return transparent 1x1 GIF
    return new Response(TRANSPARENT_GIF, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error tracking email open:", error);
    
    // Always return the GIF even on error
    return new Response(TRANSPARENT_GIF, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        ...corsHeaders,
      },
    });
  }
};

serve(handler);