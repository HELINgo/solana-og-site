// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vpinbblavyiryvdoyvsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW5iYmxhdnlpcnl2ZG95dnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTY2NzIsImV4cCI6MjA2NDgzMjY3Mn0.lt_ekbDuFi2GBD6WOOCqHRJ2TKCvs_I6vNVGqVhB5A4'; // 保持你原来的 key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
