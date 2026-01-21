import { createClient } from '@supabase/supabase-js';

// อ่านค่า Environment Variables (สำหรับ Vite ต้องใช้ import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// สร้าง Client เมื่อมี Key เท่านั้น
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Helper เพื่อเช็คว่าเชื่อมต่ออยู่หรือไม่
export const isSupabaseConnected = () => !!supabase;