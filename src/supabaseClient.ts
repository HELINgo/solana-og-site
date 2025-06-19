// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// ✅ 使用 VITE_ 前缀的环境变量（Vite 构建时会注入）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
