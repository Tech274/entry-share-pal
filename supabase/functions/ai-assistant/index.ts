import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    
    if (type === "search") {
      systemPrompt = `You are an AI search assistant for a lab request management system. Your job is to help users find specific requests by understanding their natural language queries.

Given the user's search query, analyze it and extract search criteria. Return a JSON object with these possible fields:
- searchTerms: array of keywords to search for
- client: client name if mentioned
- status: status if mentioned (e.g., "Solution Pending", "Solution Sent", "In Progress", "Completed", "Ready")
- cloud: cloud provider if mentioned (AWS, Azure, GCP, Public Cloud, Private Cloud)
- dateRange: object with "from" and "to" dates if time period mentioned
- amountRange: object with "min" and "max" if amount/cost mentioned
- type: "solution" or "delivery" if specified

Context about the data:
- Solutions have statuses: Solution Pending, Solution Sent
- Deliveries have statuses: Pending, In Progress, Ready, Completed
- Cloud types: AWS, Azure, GCP, Public Cloud, Private Cloud, TP Labs

Always respond with valid JSON only, no explanation.`;
    } else if (type === "assistant") {
      systemPrompt = `You are a helpful AI assistant for MakeMyLabs, a lab request management system. You help users with:
- Understanding lab requests and their statuses
- Explaining the workflow (Solutions → Delivery)
- Providing guidance on filling out request forms
- Answering questions about cloud types, lab types, and billing
- General help with using the system

Current context about the system:
- Solutions tab: Where new lab requests come in and solutions are proposed
- Delivery tab: Where approved solutions are tracked through delivery
- ADR (Active Delivery Requests): Shows all ongoing deliveries
- Calendar: Visual view of lab schedules

${context ? `Current data context: ${JSON.stringify(context)}` : ''}

Be concise, helpful, and friendly. If you don't know something specific about their data, ask clarifying questions.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
