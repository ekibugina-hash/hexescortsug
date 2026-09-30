import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Real Supabase URL for hexescortsug
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dkyikirsvpauhbexbhvu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});