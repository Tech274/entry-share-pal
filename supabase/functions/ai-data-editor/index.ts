import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface EditRequest {
  instruction: string;
  context: {
    tableType: 'delivery' | 'lab_requests';
    sampleRecords?: Record<string, unknown>[];
    totalCount?: number;
  };
}

interface ParsedEdit {
  action: 'update' | 'delete';
  filters: Record<string, unknown>;
  updates?: Record<string, unknown>;
  affectedCount?: number;
}

const FIELD_MAPPINGS: Record<string, string> = {
  // Common aliases to actual DB column names
  'status': 'lab_status',
  'labstatus': 'lab_status',
  'lab status': 'lab_status',
  'delivery status': 'lab_status',
  'potential': 'potential_id',
  'pid': 'potential_id',
  'ticket': 'fresh_desk_ticket_number',
  'freshdesk': 'fresh_desk_ticket_number',
  'client name': 'client',
  'customer': 'client',
  'amount': 'total_amount',
  'total': 'total_amount',
  'users': 'number_of_users',
  'num users': 'number_of_users',
  'cloud type': 'cloud_type',
  'provider': 'cloud_type',
  'start': 'start_date',
  'end': 'end_date',
  'lob': 'line_of_business',
  'line of business': 'line_of_business',
  'training': 'training_name',
  'lab name': 'lab_name',
  'input cost': 'input_cost_per_user',
  'selling cost': 'selling_cost_per_user',
  'requester name': 'requester',
};

const STATUS_MAPPINGS: Record<string, string> = {
  'pending': 'Pending',
  'wip': 'Work-in-Progress',
  'work in progress': 'Work-in-Progress',
  'in progress': 'Work-in-Progress',
  'test credentials shared': 'Test Credentials Shared',
  'test creds': 'Test Credentials Shared',
  'delivered': 'Delivered',
  'delivery in-progress': 'Delivery In-Progress',
  'delivery in progress': 'Delivery In-Progress',
  'delivery completed': 'Delivery Completed',
  'completed': 'Delivery Completed',
  'cancelled': 'Cancelled',
  'canceled': 'Cancelled',
};

const CLOUD_MAPPINGS: Record<string, string> = {
  'public': 'Public Cloud',
  'public cloud': 'Public Cloud',
  'private': 'Private Cloud',
  'private cloud': 'Private Cloud',
  'tp labs': 'TP Labs',
  'third party': 'TP Labs',
  'tp': 'TP Labs',
};

const MONTH_MAPPINGS: Record<string, string> = {
  'jan': 'January', 'january': 'January',
  'feb': 'February', 'february': 'February',
  'mar': 'March', 'march': 'March',
  'apr': 'April', 'april': 'April',
  'may': 'May',
  'jun': 'June', 'june': 'June',
  'jul': 'July', 'july': 'July',
  'aug': 'August', 'august': 'August',
  'sep': 'September', 'sept': 'September', 'september': 'September',
  'oct': 'October', 'october': 'October',
  'nov': 'November', 'november': 'November',
  'dec': 'December', 'december': 'December',
};

function normalizeFieldName(field: string): string {
  const lower = field.toLowerCase().trim();
  return FIELD_MAPPINGS[lower] || lower.replace(/\s+/g, '_');
}

function normalizeValue(field: string, value: string): string | number {
  const normalizedField = normalizeFieldName(field);
  const lowerValue = value.toLowerCase().trim();
  
  if (normalizedField === 'lab_status') {
    return STATUS_MAPPINGS[lowerValue] || value;
  }
  if (normalizedField === 'cloud') {
    return CLOUD_MAPPINGS[lowerValue] || value;
  }
  if (normalizedField === 'month') {
    return MONTH_MAPPINGS[lowerValue] || value;
  }
  
  // Check if numeric
  const num = parseFloat(value.replace(/[₹$,]/g, ''));
  if (!isNaN(num) && ['total_amount', 'input_cost_per_user', 'selling_cost_per_user', 'number_of_users', 'year'].includes(normalizedField)) {
    return num;
  }
  
  return value;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { instruction, context }: EditRequest = await req.json();
    
    if (!instruction || !context?.tableType) {
      return new Response(
        JSON.stringify({ error: 'Missing instruction or table context' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const tableName = context.tableType === 'delivery' ? 'delivery_requests' : 'lab_requests';

    console.log(`Processing edit instruction: "${instruction}" on table: ${tableName}`);

    // Use AI to parse the instruction into structured edits
    const systemPrompt = `You are a data editing assistant. Parse the user's natural language instruction into a structured JSON edit operation.

Available fields for ${tableName}:
- client, month, year, cloud (Public Cloud/Private Cloud/TP Labs), cloud_type (AWS/Azure/GCP)
- lab_status (Pending, Work-in-Progress, Test Credentials Shared, Delivered, Delivery In-Progress, Delivery Completed, Cancelled)
- potential_id, fresh_desk_ticket_number, training_name, lab_name, number_of_users
- requester, agent_name, account_manager, start_date, end_date
- input_cost_per_user, selling_cost_per_user, total_amount, line_of_business (Standalone/VILT/Integrated)
- invoice_details, tp_lab_type (SAP/Oracle/OEM)

Return ONLY valid JSON in this format:
{
  "action": "update" or "delete",
  "filters": { "field": "value" },  // WHERE conditions to match records
  "updates": { "field": "new_value" },  // Only for update action
  "description": "Human readable description of what will be done"
}

Examples:
- "Change status to Delivered for P-001" → {"action":"update","filters":{"potential_id":"P-001"},"updates":{"lab_status":"Delivered"},"description":"Update status to Delivered for potential ID P-001"}
- "Set all January 2025 records to Completed" → {"action":"update","filters":{"month":"January","year":2025},"updates":{"lab_status":"Delivery Completed"},"description":"Update all January 2025 records to Delivery Completed"}
- "Update client to Acme Corp where ticket is FD-12345" → {"action":"update","filters":{"fresh_desk_ticket_number":"FD-12345"},"updates":{"client":"Acme Corp"},"description":"Update client name to Acme Corp for ticket FD-12345"}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: instruction }
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI parsing failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', aiContent);

    // Extract JSON from response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not parse your instruction. Please try rephrasing.',
          suggestion: 'Example: "Change status to Delivered for potential ID P-001"'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsedEdit: ParsedEdit & { description?: string } = JSON.parse(jsonMatch[0]);
    console.log('Parsed edit:', parsedEdit);

    // Normalize field names and values
    const normalizedFilters: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsedEdit.filters || {})) {
      const normalizedKey = normalizeFieldName(key);
      normalizedFilters[normalizedKey] = typeof value === 'string' 
        ? normalizeValue(key, value) 
        : value;
    }

    const normalizedUpdates: Record<string, unknown> = {};
    if (parsedEdit.updates) {
      for (const [key, value] of Object.entries(parsedEdit.updates)) {
        const normalizedKey = normalizeFieldName(key);
        normalizedUpdates[normalizedKey] = typeof value === 'string' 
          ? normalizeValue(key, value) 
          : value;
      }
    }

    // First, count how many records will be affected
    let countQuery = supabase.from(tableName).select('id', { count: 'exact', head: true });
    for (const [key, value] of Object.entries(normalizedFilters)) {
      countQuery = countQuery.eq(key, value);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Count error:', countError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Filter error: ${countError.message}`,
          suggestion: 'Please check your filter criteria and try again.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (count === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No records match your criteria.',
          filters: normalizedFilters,
          suggestion: 'Try different filter values or check if the records exist.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Execute the edit
    if (parsedEdit.action === 'update') {
      let updateQuery = supabase.from(tableName).update(normalizedUpdates);
      for (const [key, value] of Object.entries(normalizedFilters)) {
        updateQuery = updateQuery.eq(key, value);
      }
      
      const { error: updateError } = await updateQuery;
      
      if (updateError) {
        console.error('Update error:', updateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Update failed: ${updateError.message}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: 'update',
          affectedCount: count,
          description: parsedEdit.description || `Updated ${count} record(s)`,
          filters: normalizedFilters,
          updates: normalizedUpdates,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (parsedEdit.action === 'delete') {
      // For safety, require confirmation for deletes
      return new Response(
        JSON.stringify({
          success: false,
          requiresConfirmation: true,
          action: 'delete',
          affectedCount: count,
          description: parsedEdit.description || `This will delete ${count} record(s)`,
          filters: normalizedFilters,
          message: 'Delete operations are not supported via AI chat for safety. Please use the delete button in the table.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Unknown action type' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Data Editor error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process edit request' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
