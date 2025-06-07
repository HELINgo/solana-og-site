// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://你的-supabase-url.supabase.co'; // https://vpinbblavyiryvdoyvsn.supabase.co
const supabaseKey = '你的-anon-public-key'; // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW5iYmxhdnlpcnl2ZG95dnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTY2NzIsImV4cCI6MjA2NDgzMjY3Mn0.lt_ekbDuFi2GBD6WOOCqHRJ2TKCvs_I6vNVGqVhB5A4

export const supabase = createClient(supabaseUrl, supabaseKey);
