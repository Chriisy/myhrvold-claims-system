import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ServiceVisit {
  id: string;
  planlagt_tid: string;
  avtale_id: string;
  kunde_navn: string;
  tekniker_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      // Handle new service visit - create reminders
      const { visitId } = await req.json();
      
      console.log(`Creating reminders for visit: ${visitId}`);

      // Get visit details
      const { data: visit, error: visitError } = await supabase
        .from('service_visits')
        .select('id, planlagt_tid, avtale_id, maintenance_agreements(kunde_navn), tekniker_id')
        .eq('id', visitId)
        .single();

      if (visitError || !visit) {
        console.error('Failed to fetch visit:', visitError);
        return new Response(JSON.stringify({ error: 'Visit not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const planlagtTid = new Date(visit.planlagt_tid);
      const kundeNavn = visit.maintenance_agreements?.kunde_navn || 'Ukjent kunde';

      // Create 4 reminder notifications: 4 weeks, 2 weeks, 1 week, same day
      const reminderIntervals = [
        { weeks: 4, hours: 0, type: '4_weeks' },
        { weeks: 2, hours: 0, type: '2_weeks' },  
        { weeks: 1, hours: 0, type: '1_week' },
        { weeks: 0, hours: 0, type: 'same_day' }
      ];

      const notifications = [];

      for (const interval of reminderIntervals) {
        const scheduledFor = new Date(planlagtTid);
        scheduledFor.setDate(scheduledFor.getDate() - (interval.weeks * 7));
        scheduledFor.setHours(scheduledFor.getHours() - interval.hours);

        const notification = {
          user_id: visit.tekniker_id,
          type: 'service_visit',
          title: `Servicebesøk ${interval.type === 'same_day' ? 'i dag' : `om ${interval.weeks} uke${interval.weeks > 1 ? 'r' : ''}`}`,
          message: `Servicebesøk hos ${kundeNavn} planlagt ${planlagtTid.toLocaleDateString('no-NO')} kl. ${planlagtTid.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}`,
          scheduled_for: scheduledFor.toISOString(),
          metadata: {
            visit_id: visitId,
            trigger: interval.type,
            kunde_navn: kundeNavn
          }
        };

        notifications.push(notification);
      }

      // Insert notifications with UPSERT to avoid duplicates
      const { error: notificationError } = await supabase
        .from('notifications')
        .upsert(notifications, {
          onConflict: 'user_id,scheduled_for,metadata->visit_id',
          ignoreDuplicates: true
        });

      if (notificationError) {
        console.error('Failed to create notifications:', notificationError);
        return new Response(JSON.stringify({ error: 'Failed to create reminders' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Created ${notifications.length} reminders for visit ${visitId}`);

      return new Response(JSON.stringify({ 
        success: true, 
        reminders_created: notifications.length,
        visit_id: visitId 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      // Cron job: Send due reminders
      console.log('Processing due reminders...');

      const now = new Date();
      
      // Get notifications that are due and not yet sent
      const { data: dueNotifications, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'service_visit')
        .eq('is_read', false)
        .lte('scheduled_for', now.toISOString())
        .is('sent_at', null);

      if (fetchError) {
        console.error('Failed to fetch due notifications:', fetchError);
        return new Response(JSON.stringify({ error: 'Failed to fetch notifications' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!dueNotifications || dueNotifications.length === 0) {
        console.log('No due reminders found');
        return new Response(JSON.stringify({ 
          success: true, 
          processed: 0,
          message: 'No due reminders' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Mark notifications as sent
      const notificationIds = dueNotifications.map(n => n.id);
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ sent_at: now.toISOString() })
        .in('id', notificationIds);

      if (updateError) {
        console.error('Failed to update notifications:', updateError);
      }

      console.log(`Processed ${dueNotifications.length} due reminders`);

      return new Response(JSON.stringify({ 
        success: true, 
        processed: dueNotifications.length,
        notifications: dueNotifications.map(n => ({
          id: n.id,
          title: n.title,
          scheduled_for: n.scheduled_for,
          metadata: n.metadata
        }))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in visit-reminders function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);