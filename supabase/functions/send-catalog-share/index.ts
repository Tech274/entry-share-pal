import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ShareCatalogRequest {
  recipientEmail: string;
  recipientName?: string;
  personalMessage?: string;
  catalogUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, personalMessage, catalogUrl }: ShareCatalogRequest = await req.json();

    console.log(`Sending catalog share email to ${recipientEmail}`);

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

    const greeting = recipientName 
      ? `Hi ${recipientName},` 
      : 'Hi there,';

    const personalSection = personalMessage 
      ? `<p style="margin: 20px 0; padding: 15px; background: #f0f7ff; border-left: 4px solid #0066cc; border-radius: 4px; font-style: italic;">"${personalMessage}"</p>` 
      : '';

    const subject = 'MakeMyLabs Lab Catalog - Explore Our Training Solutions';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MakeMyLabs Lab Catalog</title>
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
          .stats {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 25px 0;
            text-align: center;
          }
          .stat {
            padding: 15px 20px;
            background: #f8f9fa;
            border-radius: 8px;
            min-width: 80px;
          }
          .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: #0066cc;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
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
          .cta-button:hover {
            background: #004499;
          }
          .features {
            margin: 30px 0;
          }
          .feature {
            display: flex;
            align-items: flex-start;
            margin: 15px 0;
            padding: 10px 0;
          }
          .feature-icon {
            width: 40px;
            height: 40px;
            background: #e6f0ff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            flex-shrink: 0;
          }
          .feature-text h4 {
            margin: 0 0 5px;
            font-size: 16px;
            color: #333;
          }
          .feature-text p {
            margin: 0;
            font-size: 14px;
            color: #666;
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
            <p>Enterprise Training Lab Solutions</p>
          </div>
          <div class="content">
            <p>${greeting}</p>
            
            <p>You've been invited to explore the <strong>MakeMyLabs Lab Catalog</strong> — your comprehensive resource for enterprise training solutions.</p>
            
            ${personalSection}
            
            <div style="text-align: center;">
              <a href="${catalogUrl}" class="cta-button">View Lab Catalog</a>
            </div>
            
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
            
            <div class="features">
              <h3 style="margin-bottom: 20px; color: #333;">What you'll find:</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 50px;">
                    <div style="width: 40px; height: 40px; background: #e6f0ff; border-radius: 8px; text-align: center; line-height: 40px; font-size: 18px;">☁️</div>
                  </td>
                  <td style="padding: 10px 0; vertical-align: top;">
                    <h4 style="margin: 0 0 5px; font-size: 15px;">Cloud & DevOps Labs</h4>
                    <p style="margin: 0; font-size: 13px; color: #666;">AWS, Azure, GCP, Kubernetes, Docker, and more</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 50px;">
                    <div style="width: 40px; height: 40px; background: #e6f0ff; border-radius: 8px; text-align: center; line-height: 40px; font-size: 18px;">🔒</div>
                  </td>
                  <td style="padding: 10px 0; vertical-align: top;">
                    <h4 style="margin: 0 0 5px; font-size: 15px;">Security Training</h4>
                    <p style="margin: 0; font-size: 13px; color: #666;">Cybersecurity, ethical hacking, compliance labs</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 50px;">
                    <div style="width: 40px; height: 40px; background: #e6f0ff; border-radius: 8px; text-align: center; line-height: 40px; font-size: 18px;">🤖</div>
                  </td>
                  <td style="padding: 10px 0; vertical-align: top;">
                    <h4 style="margin: 0 0 5px; font-size: 15px;">AI & Machine Learning</h4>
                    <p style="margin: 0; font-size: 13px; color: #666;">TensorFlow, PyTorch, MLOps, Data Science</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 50px;">
                    <div style="width: 40px; height: 40px; background: #e6f0ff; border-radius: 8px; text-align: center; line-height: 40px; font-size: 18px;">💼</div>
                  </td>
                  <td style="padding: 10px 0; vertical-align: top;">
                    <h4 style="margin: 0 0 5px; font-size: 15px;">Enterprise Solutions</h4>
                    <p style="margin: 0; font-size: 13px; color: #666;">SAP, Salesforce, ServiceNow, Oracle</p>
                  </td>
                </tr>
              </table>
            </div>
            
            <p style="margin-top: 25px;">Browse our complete catalog to find the perfect training solutions for your organization's needs.</p>
            
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
      JSON.stringify({ success: true, data: emailResponse }),
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
