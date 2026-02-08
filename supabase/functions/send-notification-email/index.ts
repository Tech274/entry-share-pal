import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  type: 'submission' | 'status_change';
  recipientEmail: string;
  requestDetails: {
    potentialId?: string;
    client?: string;
    subject?: string;
    taskType?: string;
    oldStatus?: string;
    newStatus?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, recipientEmail, requestDetails }: NotificationRequest = await req.json();

    console.log(`Sending ${type} notification to ${recipientEmail}`, requestDetails);

    // Validate required fields
    if (!recipientEmail) {
      throw new Error("Recipient email is required");
    }

    let subject: string;
    let htmlContent: string;

    if (type === 'submission') {
      subject = `Request Submitted: ${requestDetails.subject || requestDetails.potentialId || 'New Request'}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
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
                <span class="label">Request Type:</span> ${requestDetails.taskType || 'N/A'}
              </div>
              <div class="detail">
                <span class="label">Potential ID:</span> ${requestDetails.potentialId || 'N/A'}
              </div>
              <div class="detail">
                <span class="label">Client:</span> ${requestDetails.client || 'N/A'}
              </div>
              <div class="detail">
                <span class="label">Subject:</span> ${requestDetails.subject || 'N/A'}
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
    } else if (type === 'status_change') {
      subject = `Status Update: ${requestDetails.subject || requestDetails.potentialId || 'Your Request'}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .status-change { display: flex; justify-content: center; align-items: center; margin: 20px 0; }
            .status { padding: 10px 20px; border-radius: 20px; font-weight: bold; }
            .old-status { background: #dc3545; color: white; }
            .arrow { margin: 0 15px; font-size: 24px; color: #666; }
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
                <span class="status old-status">${requestDetails.oldStatus || 'Previous'}</span>
                <span class="arrow">→</span>
                <span class="status new-status">${requestDetails.newStatus || 'New'}</span>
              </div>
              
              <div class="detail">
                <span class="label">Potential ID:</span> ${requestDetails.potentialId || 'N/A'}
              </div>
              <div class="detail">
                <span class="label">Client:</span> ${requestDetails.client || 'N/A'}
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
    } else {
      throw new Error("Invalid notification type");
    }

    // Note: Change the "from" address to your verified domain
    const emailResponse = await resend.emails.send({
      from: "MakeMyLabs <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
