// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vpinbblavyiryvdoyvsn.supabase.co'; // ✅ 替换成你自己的 Supabase 项目地址
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW5iYmxhdnlpcnl2ZG95dnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTY2NzIsImV4cCI6MjA2NDgzMjY3Mn0.lt_ekbDuFi2GBD6WOOCqHRJ2TKCvs_I6vNVGqVhB5A4'; // ✅ 使用 anon 公钥

export const supabase = createClient(supabaseUrl, supabaseKey);

