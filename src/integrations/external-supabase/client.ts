// External Supabase client - uses your own Supabase instance
// 
// SETUP INSTRUCTIONS:
// 1. Your secrets EXTERNAL_SUPABASE_URL and EXTERNAL_SUPABASE_ANON_KEY are stored
// 2. These secrets are available in Edge Functions via Deno.env.get()
// 3. For frontend access, you need to update .env with VITE_ prefixed variables
//
// Since Lovable auto-manages .env, you have two options:
// Option A: Use Edge Functions as a proxy (recommended for security)
// Option B: Replace the default client import throughout the app
//
// This file provides the client for Option B if you can set the VITE_ vars.

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/types';

// To use your external Supabase on the frontend, the app currently uses
// the auto-configured Lovable Cloud Supabase from src/integrations/supabase/client.ts
//
// The secrets you added (EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY) are 
// available in Edge Functions. For frontend use, you would need to:
// 1. Create a proxy edge function that uses your external Supabase
// 2. Or modify all imports from "@/integrations/supabase/client" to use this file
//    after setting VITE_EXTERNAL_SUPABASE_URL and VITE_EXTERNAL_SUPABASE_ANON_KEY

const SUPABASE_URL = import.meta.env.VITE_EXTERNAL_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const externalSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Check if using external Supabase
export const isUsingExternalSupabase = () => !!import.meta.env.VITE_EXTERNAL_SUPABASE_URL;
