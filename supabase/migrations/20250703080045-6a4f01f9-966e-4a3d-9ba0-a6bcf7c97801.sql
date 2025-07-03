-- Create notifications table for system alerts and reminders
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'status_change', 'overdue', 'approval_needed', 'supplier_response')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Create notification settings table
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_frequency INTEGER NOT NULL DEFAULT 24, -- hours
  overdue_alerts BOOLEAN NOT NULL DEFAULT true,
  status_updates BOOLEAN NOT NULL DEFAULT true,
  supplier_responses BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own notification settings
CREATE POLICY "Users can manage their own notification settings" 
ON public.notification_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_claim_id ON public.notifications(claim_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_scheduled_for ON public.notifications(scheduled_for);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Function to create automatic notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_claim_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, claim_id, type, title, message, scheduled_for, metadata
  ) VALUES (
    p_user_id, p_claim_id, p_type, p_title, p_message, p_scheduled_for, p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger function for claim status changes
CREATE OR REPLACE FUNCTION public.handle_claim_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  admin_user RECORD;
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Create notification based on status change
  CASE NEW.status
    WHEN 'pending_approval' THEN
      notification_title := 'Reklamasjon venter på godkjenning';
      notification_message := 'Reklamasjon ' || NEW.claim_number || ' er klar for godkjenning.';
      
      -- Notify all admins
      FOR admin_user IN 
        SELECT id FROM profiles WHERE role = 'admin' AND is_active = true
      LOOP
        PERFORM create_notification(
          admin_user.id,
          NEW.id,
          'approval_needed',
          notification_title,
          notification_message
        );
      END LOOP;
      
    WHEN 'under_processing' THEN
      notification_title := 'Reklamasjon under behandling';
      notification_message := 'Reklamasjon ' || NEW.claim_number || ' er nå under behandling.';
      
      -- Notify claim creator
      PERFORM create_notification(
        NEW.created_by,
        NEW.id,
        'status_change',
        notification_title,
        notification_message
      );
      
    WHEN 'sent_supplier' THEN
      notification_title := 'Reklamasjon sendt til leverandør';
      notification_message := 'Reklamasjon ' || NEW.claim_number || ' er sendt til ' || NEW.supplier || '.';
      
      -- Notify claim creator and set reminder for 7 days
      PERFORM create_notification(
        NEW.created_by,
        NEW.id,
        'status_change',
        notification_title,
        notification_message
      );
      
      PERFORM create_notification(
        NEW.created_by,
        NEW.id,
        'reminder',
        'Påminnelse: Venter på svar fra leverandør',
        'Reklamasjon ' || NEW.claim_number || ' har ventet på svar fra ' || NEW.supplier || ' i 7 dager.',
        now() + interval '7 days'
      );
      
    WHEN 'resolved' THEN
      notification_title := 'Reklamasjon løst';
      notification_message := 'Reklamasjon ' || NEW.claim_number || ' er nå løst.';
      
      -- Notify claim creator
      PERFORM create_notification(
        NEW.created_by,
        NEW.id,
        'status_change',
        notification_title,
        notification_message
      );
  END CASE;
  
  RETURN NEW;
END;
$$;

-- Create trigger for claim status changes
CREATE TRIGGER claim_status_notification_trigger
  AFTER UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_claim_status_change();

-- Function to check for overdue claims and create notifications
CREATE OR REPLACE FUNCTION public.check_overdue_claims()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  overdue_claim RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Find claims that are overdue (sent to supplier more than 14 days ago without response)
  FOR overdue_claim IN 
    SELECT c.*, p.id as creator_id
    FROM claims c
    JOIN profiles p ON p.id = c.created_by
    WHERE c.status = 'sent_supplier' 
      AND c.supplier_email_sent_date < now() - interval '14 days'
      AND c.supplier_response_date IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM notifications n 
        WHERE n.claim_id = c.id 
          AND n.type = 'overdue' 
          AND n.created_at > now() - interval '7 days'
      )
  LOOP
    notification_title := 'Reklamasjon forfalt';
    notification_message := 'Reklamasjon ' || overdue_claim.claim_number || 
                           ' har ikke fått svar fra ' || overdue_claim.supplier || 
                           ' på over 14 dager.';
    
    -- Notify claim creator
    PERFORM create_notification(
      overdue_claim.creator_id,
      overdue_claim.id,
      'overdue',
      notification_title,
      notification_message
    );
  END LOOP;
END;
$$;