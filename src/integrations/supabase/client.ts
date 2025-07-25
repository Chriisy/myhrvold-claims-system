// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bearepylqdbqlljoigeo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlYXJlcHlscWRicWxsam9pZ2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTk4NDAsImV4cCI6MjA2NzAzNTg0MH0.OhUaoa9LDjyQ-gXsUD8oVSWWlz-P3sDpZPRDHAWnkNU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});