import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StatusTransition {
  id: string;
  type: 'solution' | 'delivery';
  oldStatus: string;
  newStatus: string;
  assignedTo: string | null;
  client: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const transitions: StatusTransition[] = [];
    const errors: string[] = [];

    console.log(`Running auto-status-update for date: ${today}`);

    // 1. Lab Start Date = Today -> Solution Pending to In Progress (for lab_requests)
    try {
      const { data: startingLabs, error: startingError } = await supabase
        .from('lab_requests')
        .select('id, status, assigned_to, client, lab_start_date')
        .eq('status', 'Solution Pending')
        .eq('lab_start_date', today);

      if (startingError) {
        errors.push(`Error fetching starting labs: ${startingError.message}`);
      } else if (startingLabs && startingLabs.length > 0) {
        console.log(`Found ${startingLabs.length} labs starting today`);
        
        const { error: updateError } = await supabase
          .from('lab_requests')
          .update({ status: 'In Progress' })
          .eq('status', 'Solution Pending')
          .eq('lab_start_date', today);

        if (updateError) {
          errors.push(`Error updating starting labs: ${updateError.message}`);
        } else {
          for (const lab of startingLabs) {
            transitions.push({
              id: lab.id,
              type: 'solution',
              oldStatus: 'Solution Pending',
              newStatus: 'In Progress',
              assignedTo: lab.assigned_to,
              client: lab.client,
            });

            // Log activity
            await supabase.from('request_activity_log').insert({
              request_id: lab.id,
              request_type: 'solution',
              action: 'status_changed',
              old_values: { status: 'Solution Pending' },
              new_values: { status: 'In Progress' },
              performed_by: null, // System action
            });
          }
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      errors.push(`Exception in starting labs: ${errorMessage}`);
    }

    // 2. Delivery Start Date = Today -> Pending to Delivery In-Progress (for delivery_requests)
    try {
      const { data: startingDeliveries, error: delStartError } = await supabase
        .from('delivery_requests')
        .select('id, lab_status, assigned_to, client, start_date')
        .eq('lab_status', 'Pending')
        .eq('start_date', today);

      if (delStartError) {
        errors.push(`Error fetching starting deliveries: ${delStartError.message}`);
      } else if (startingDeliveries && startingDeliveries.length > 0) {
        console.log(`Found ${startingDeliveries.length} deliveries starting today`);
        
        const { error: updateError } = await supabase
          .from('delivery_requests')
          .update({ lab_status: 'Delivery In-Progress' })
          .eq('lab_status', 'Pending')
          .eq('start_date', today);

        if (updateError) {
          errors.push(`Error updating starting deliveries: ${updateError.message}`);
        } else {
          for (const delivery of startingDeliveries) {
            transitions.push({
              id: delivery.id,
              type: 'delivery',
              oldStatus: 'Pending',
              newStatus: 'Delivery In-Progress',
              assignedTo: delivery.assigned_to,
              client: delivery.client,
            });

            await supabase.from('request_activity_log').insert({
              request_id: delivery.id,
              request_type: 'delivery',
              action: 'status_changed',
              old_values: { status: 'Pending' },
              new_values: { status: 'Delivery In-Progress' },
              performed_by: null,
            });
          }
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      errors.push(`Exception in starting deliveries: ${errorMessage}`);
    }

    // 3. Delivery End Date passed -> Delivery In-Progress to Delivery Completed (skipping Delivered status)
    try {
      const { data: endingDeliveries, error: endingError } = await supabase
        .from('delivery_requests')
        .select('id, lab_status, assigned_to, client, end_date')
        .eq('lab_status', 'Delivery In-Progress')
        .lt('end_date', today)
        .not('end_date', 'is', null);

      if (endingError) {
        errors.push(`Error fetching ending deliveries: ${endingError.message}`);
      } else if (endingDeliveries && endingDeliveries.length > 0) {
        console.log(`Found ${endingDeliveries.length} deliveries past end date`);
        
        const { error: updateError } = await supabase
          .from('delivery_requests')
          .update({ lab_status: 'Delivery Completed' })
          .eq('lab_status', 'Delivery In-Progress')
          .lt('end_date', today)
          .not('end_date', 'is', null);

        if (updateError) {
          errors.push(`Error updating ending deliveries: ${updateError.message}`);
        } else {
          for (const delivery of endingDeliveries) {
            transitions.push({
              id: delivery.id,
              type: 'delivery',
              oldStatus: 'Delivery In-Progress',
              newStatus: 'Delivery Completed',
              assignedTo: delivery.assigned_to,
              client: delivery.client,
            });

            await supabase.from('request_activity_log').insert({
              request_id: delivery.id,
              request_type: 'delivery',
              action: 'status_changed',
              old_values: { status: 'Delivery In-Progress' },
              new_values: { status: 'Delivery Completed' },
              performed_by: null,
            });
          }
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      errors.push(`Exception in ending deliveries: ${errorMessage}`);
    }

    // 4. Work-in-Progress end date passed -> Work-in-Progress to Test Credentials Shared
    try {
      const { data: wipDeliveries, error: wipError } = await supabase
        .from('delivery_requests')
        .select('id, lab_status, assigned_to, client, end_date')
        .eq('lab_status', 'Work-in-Progress')
        .lt('end_date', today)
        .not('end_date', 'is', null);

      if (wipError) {
        errors.push(`Error fetching WIP deliveries: ${wipError.message}`);
      } else if (wipDeliveries && wipDeliveries.length > 0) {
        console.log(`Found ${wipDeliveries.length} WIP deliveries past end date`);
        
        const { error: updateError } = await supabase
          .from('delivery_requests')
          .update({ lab_status: 'Test Credentials Shared' })
          .eq('lab_status', 'Work-in-Progress')
          .lt('end_date', today)
          .not('end_date', 'is', null);

        if (updateError) {
          errors.push(`Error updating WIP deliveries: ${updateError.message}`);
        } else {
          for (const delivery of wipDeliveries) {
            transitions.push({
              id: delivery.id,
              type: 'delivery',
              oldStatus: 'Work-in-Progress',
              newStatus: 'Test Credentials Shared',
              assignedTo: delivery.assigned_to,
              client: delivery.client,
            });

            await supabase.from('request_activity_log').insert({
              request_id: delivery.id,
              request_type: 'delivery',
              action: 'status_changed',
              old_values: { status: 'Work-in-Progress' },
              new_values: { status: 'Test Credentials Shared' },
              performed_by: null,
            });
          }
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      errors.push(`Exception in WIP deliveries: ${errorMessage}`);
    }

    const response = {
      success: errors.length === 0,
      timestamp: new Date().toISOString(),
      transitionsCount: transitions.length,
      transitions: transitions.map(t => ({
        id: t.id,
        type: t.type,
        client: t.client,
        change: `${t.oldStatus} → ${t.newStatus}`,
      })),
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log(`Auto-status-update complete: ${transitions.length} transitions, ${errors.length} errors`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: errors.length > 0 ? 207 : 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Auto-status-update error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
