// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// 如果是本地开发，加载 .env 文件
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// 从环境变量中读取 Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
