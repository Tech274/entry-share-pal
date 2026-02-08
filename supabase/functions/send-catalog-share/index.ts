import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SharedItem {
  id?: string;
  name: string;
  category: string;
  description?: string;
}

interface ShareCatalogRequest {
  recipientEmail: string;
  recipientName?: string;
  personalMessage?: string;
  catalogUrl: string;
  shareType?: 'catalog' | 'template' | 'bundle';
  sharedItems?: SharedItem[];
}

// Generate a unique share ID for tracking
function generateShareId(): string {
  return `share_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { 
      recipientEmail, 
      recipientName, 
      personalMessage, 
      catalogUrl,
      shareType = 'catalog',
      sharedItems = []
    }: ShareCatalogRequest = await req.json();

    console.log(`Sending ${shareType} share email to ${recipientEmail}`, { itemCount: sharedItems.length });

    // Validate required fields
    if (!recipientEmail) {
      throw new Error("Recipient email is required");
    }

    if (!catalogUrl) {
      throw new Error("Catalog URL is required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      throw new Error("Invalid email address format");
    }

    // Generate share ID for tracking
    const shareId = generateShareId();
    
    // Create Supabase client with service role for inserting tracking record
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Insert tracking record
      const { error: trackingError } = await supabase
        .from('catalog_share_tracking')
        .insert({
          share_id: shareId,
          recipient_email: recipientEmail,
          recipient_name: recipientName || null,
          share_type: shareType,
          shared_items: sharedItems.length > 0 ? sharedItems : null,
          personal_message: personalMessage || null,
          catalog_url: catalogUrl,
        });
      
      if (trackingError) {
        console.error("Error creating tracking record:", trackingError);
        // Don't fail the email send if tracking fails
      } else {
        console.log("Tracking record created:", shareId);
      }
    }

    const greeting = recipientName 
      ? `Hi ${recipientName},` 
      : 'Hi there,';

    const personalSection = personalMessage 
      ? `<p style="margin: 20px 0; padding: 15px; background: #f0f7ff; border-left: 4px solid #0066cc; border-radius: 4px; font-style: italic;">"${personalMessage}"</p>` 
      : '';

    // Build subject and content based on share type
    let subject: string;
    let introText: string;
    let itemsSection = '';

    if (shareType === 'template' && sharedItems.length > 0) {
      const templateName = sharedItems[0].name;
      subject = `MakeMyLabs Lab Recommendation: ${templateName}`;
      introText = `Someone shared a lab template with you from the <strong>MakeMyLabs Lab Catalog</strong>.`;
      
      itemsSection = `
        <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="margin: 0 0 10px; font-size: 18px; color: #333;">${sharedItems[0].name}</h3>
          <p style="margin: 0 0 10px; color: #666; font-size: 14px;">${sharedItems[0].description || ''}</p>
          <span style="display: inline-block; padding: 4px 12px; background: #e6f0ff; color: #0066cc; border-radius: 20px; font-size: 12px;">${sharedItems[0].category}</span>
        </div>
      `;
    } else if (shareType === 'bundle' && sharedItems.length > 0) {
      subject = `MakeMyLabs Lab Bundle: ${sharedItems.length} Labs Selected for You`;
      introText = `Someone has curated a bundle of ${sharedItems.length} labs for you from the <strong>MakeMyLabs Lab Catalog</strong>.`;
      
      const labsList = sharedItems.map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <div style="font-weight: 600; color: #333;">${item.name}</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">${item.category}</div>
          </td>
        </tr>
      `).join('');
      
      itemsSection = `
        <div style="margin: 20px 0;">
          <h3 style="margin: 0 0 15px; font-size: 16px; color: #333;">Labs in this bundle:</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9fa; border-radius: 8px; overflow: hidden;">
            ${labsList}
          </table>
        </div>
      `;
    } else {
      subject = 'MakeMyLabs Lab Catalog - Explore Our Training Solutions';
      introText = `You've been invited to explore the <strong>MakeMyLabs Lab Catalog</strong> — your comprehensive resource for enterprise training solutions.`;
    }

    // Tracking pixel URL (1x1 transparent gif endpoint)
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
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
          }
          .header { 
            background: linear-gradient(135deg, #0066cc 0%, #004499 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 14px;
          }
          .content { 
            padding: 30px 20px; 
          }
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
          .footer a {
            color: #0066cc;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MakeMyLabs</h1>
            <p>${shareType === 'bundle' ? 'Lab Bundle Recommendation' : shareType === 'template' ? 'Lab Template Recommendation' : 'Enterprise Training Lab Solutions'}</p>
          </div>
          <div class="content">
            <p>${greeting}</p>
            
            <p>${introText}</p>
            
            ${personalSection}
            
            ${itemsSection}
            
            <div style="text-align: center;">
              <a href="${catalogUrl}?ref=${shareId}" class="cta-button">
                ${shareType === 'bundle' ? 'View Bundle Details' : shareType === 'template' ? 'View Lab Template' : 'View Lab Catalog'}
              </a>
            </div>
            
            ${shareType === 'catalog' ? `
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
            ` : ''}
            
            <p style="color: #666; font-size: 14px;">
              Have questions? Reply to this email or contact our team directly.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MakeMyLabs. All rights reserved.</p>
            <p>
              <a href="${catalogUrl}">View Catalog</a>
            </p>
          </div>
        </div>
        <!-- Tracking pixel -->
        <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
      </body>
      </html>
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "MakeMyLabs <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html: htmlContent,
    });

    console.log("Catalog share email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse, shareId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending catalog share email:", error);
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