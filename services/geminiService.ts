import { supabase } from "./supabaseClient";
import { Stall, StallStatus, ZoneType } from "../types";

export const getGeminiRecommendation = async (
  userQuery: string, 
  availableStalls: Stall[]
): Promise<string> => {
  
  // 1. พยายามเรียกใช้ Supabase Edge Function (Online AI)
  if (supabase) {
    try {
      // เตรียมข้อมูล Context
      const availableStallsContext = availableStalls
        .filter(s => s.status === StallStatus.AVAILABLE)
        .map(s => ({
          id: s.id,
          name: s.name,
          zone: s.zone,
          price: s.price,
          features: s.features.join(", ")
        }));

      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { 
          message: userQuery, 
          context: JSON.stringify(availableStallsContext) 
        }
      });

      // ถ้าสำเร็จ ส่งคืนคำตอบจาก AI
      if (!error && data?.text) {
        return data.text;
      }
      
      console.warn("Supabase Function connect failed, switching to Offline Mode:", error);

    } catch (error) {
      console.warn("AI Service Error, switching to Offline Mode:", error);
    }
  }

  // 2. Fallback: Offline Mode (Rule-based Suggestion)
  // ทำงานเมื่อ: ไม่ได้เชื่อมต่อ Supabase หรือ Deploy Function ไม่ผ่าน
  return getOfflineRecommendation(userQuery, availableStalls);
};

// ฟังก์ชันจำลองการแนะนำ (ทำงานในเครื่องผู้ใช้)
const getOfflineRecommendation = (query: string, stalls: Stall[]): string => {
  const lowerQuery = query.toLowerCase();
  let targetZone: ZoneType | null = null;
  let reason = "";

  // กฎง่ายๆ สำหรับการจับคู่สินค้ากับโซน
  if (lowerQuery.match(/อาหาร|ของกิน|น้ำ|เครื่องดื่ม|food|drink|ลูกชิ้น|หมู/)) {
    targetZone = ZoneType.FOOD;
    reason = "โซนนี้เหมาะกับของกิน มีจุดทิ้งขยะและพื้นทำความสะอาดง่ายครับ";
  } else if (lowerQuery.match(/เสื้อ|ผ้า|แต่งตัว|แฟชั่น|fashion|clothes|กางเกง|กระเป๋า/)) {
    targetZone = ZoneType.FASHION;
    reason = "โซนแฟชั่นคนเดินเยอะ มีไฟส่องสว่างสวยงาม สินค้าจะดูโดดเด่นครับ";
  } else if (lowerQuery.match(/ฝีมือ|hand|craft|diy|ศิลปะ|วาด|รูป/)) {
    targetZone = ZoneType.CRAFT;
    reason = "โซนงานฝีมือ บรรยากาศดี เหมาะกับงานศิลปะและของทำมือครับ";
  } else {
    targetZone = ZoneType.GENERAL;
    reason = "โซนทั่วไป ราคาประหยัดและยืดหยุ่น เหมาะกับสินค้าหลากหลายครับ";
  }

  // หาล็อคที่ว่างในโซนนั้น
  let match = stalls.find(s => s.status === StallStatus.AVAILABLE && s.zone === targetZone);
  
  // ถ้าโซนที่ต้องการเต็ม ให้หาโซนไหนก็ได้ที่ว่าง
  if (!match) {
    match = stalls.find(s => s.status === StallStatus.AVAILABLE);
    reason += " (แต่เนื่องจากโซนตรงเกรดเต็ม ผมเลยหาล็อคที่ใกล้เคียงที่สุดมาให้นะครับ)";
  }

  if (match) {
    return `[Offline Mode 🛠️] แนะนำล็อค ${match.name} (${match.zone}) ครับ\n\nเหตุผล: ${reason}\nราคา: ${match.price} บาท\n\n(หมายเหตุ: ระบบตอบกลับอัตโนมัติเนื่องจากยังไม่ได้เชื่อมต่อ Server AI)`;
  }

  return "[Offline Mode 🛠️] ขออภัยครับ ตอนนี้ไม่มีล็อคว่างเลยครับ ลองตรวจสอบวันเวลาอื่นดูไหมครับ";
};