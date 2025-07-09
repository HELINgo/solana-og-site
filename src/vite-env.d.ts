/// <reference types="vite/client" />

// 👇 把用到的变量声明进去
interface ImportMetaEnv {
  readonly VITE_WC_PROJECT_ID: string;
  // 如果还有别的变量，也可以一并列出来：
  // readonly VITE_SUPABASE_URL: string;
  // readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}