import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // Note: We no longer expose API_KEY here because we moved the logic to Supabase Edge Functions
    define: {
      // Keep other env vars if necessary, but removing API_KEY for security
    }
  };
});