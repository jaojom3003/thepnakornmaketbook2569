import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "npm:@google/genai"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS (Preflight request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, context } = await req.json()
    
    // 2. Polyfill process.env for Deno (เพื่อให้ใช้ Code มาตรฐานของ SDK ได้)
    // เราสร้างตัวแปร process จำลองขึ้นมาเพื่อดึงค่าจาก Deno.env
    const process = {
      env: {
        API_KEY: Deno.env.get('API_KEY')
      }
    };

    // 3. Initialize Gemini Client
    // ตอนนี้ process.env.API_KEY จะมีค่าเท่ากับ Deno.env.get('API_KEY')
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 4. สร้าง Prompt
    const systemPrompt = `
      คุณคือ AI ผู้ช่วยจัดสรรพื้นที่ตลาดนัด (Market Guru)
      
      ข้อมูลล็อคที่ว่างอยู่ตอนนี้:
      ${context}

      คำถามจากลูกค้า: "${message}"

      หน้าที่ของคุณ:
      1. แนะนำล็อคที่เหมาะสมที่สุดจากรายการ "ข้อมูลล็อคที่ว่างอยู่" โดยดูจากสินค้าที่ลูกค้าจะขาย
      2. อธิบายเหตุผลสั้นๆ ว่าทำไมถึงเหมาะ (เช่น ใกล้โซนอาหาร, มีปลั๊กไฟ)
      3. ถ้าไม่มีล็อคที่ตรงความต้องการ ให้แนะนำล็อคที่ใกล้เคียงที่สุด
      4. ตอบเป็นภาษาไทย สั้นๆ กระชับ เป็นกันเอง ไม่ต้องทางการมาก
    `

    // 5. เรียก Google Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: systemPrompt,
    });
    
    const generatedText = response.text || "ขออภัย ไม่สามารถประมวลผลได้ในขณะนี้";

    // 6. ส่งคำตอบกลับไปที่หน้าเว็บ
    return new Response(
      JSON.stringify({ text: generatedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})