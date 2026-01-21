import { Stall, StallStatus, ZoneType } from './types';

// ==========================================
// ⚙️ การตั้งค่าโซนและราคา (แก้ไขข้อมูลตรงนี้)
// ==========================================
export const ZONE_CONFIG = [
  { 
    type: ZoneType.FOOD,    // ประเภทโซน
    prefix: 'A',            // ตัวอักษรนำหน้าเลขล็อค
    count: 12,              // จำนวนล็อคในโซนนี้
    price: 350,             // ราคาเริ่มต้น (บาท)
    name: 'โซนอาหาร' 
  },
  { 
    type: ZoneType.FASHION, 
    prefix: 'B', 
    count: 12, 
    price: 250, 
    name: 'โซนแฟชั่น' 
  },
  { 
    type: ZoneType.CRAFT, 
    prefix: 'C', 
    count: 8, 
    price: 200, 
    name: 'โซนงานฝีมือ' 
  },
  { 
    type: ZoneType.GENERAL, 
    prefix: 'D', 
    count: 8, 
    price: 150, 
    name: 'โซนทั่วไป' 
  },
];

const generateStalls = (): Stall[] => {
  const stalls: Stall[] = [];
  let idCounter = 1;
  
  const dummyTenants = ['ร้านป้าแจ่ม', 'หมูปิ้งนมสด', 'เสื้อผ้าวินเทจ', 'น้ำลำไยสด', 'ลูกชิ้นระเบิด'];

  ZONE_CONFIG.forEach(zone => {
    for (let i = 1; i <= zone.count; i++) {
      const isBooked = Math.random() < 0.3; // สุ่มให้มีการจองแล้ว 30%
      const isMaintenance = !isBooked && Math.random() < 0.05;

      let status = StallStatus.AVAILABLE;
      let tenant = undefined;

      if (isBooked) {
        status = StallStatus.BOOKED;
        tenant = dummyTenants[Math.floor(Math.random() * dummyTenants.length)];
      }
      if (isMaintenance) status = StallStatus.MAINTENANCE;

      const features = ['มีปลั๊กไฟ'];
      if (i % 2 === 0) features.push('หัวมุม');
      if (zone.type === ZoneType.FOOD) features.push('ใกล้จุดทิ้งขยะ', 'พื้นทำความสะอาดง่าย');
      if (zone.type === ZoneType.FASHION) features.push('มีไฟส่องสว่างพิเศษ');

      stalls.push({
        id: `STALL-${zone.prefix}${i}`,
        name: `${zone.prefix}${i}`,
        zone: zone.type,
        // เพิ่มราคา 50 บาทสำหรับล็อคหัวมุม
        price: zone.price + (i % 2 === 0 ? 50 : 0), 
        size: '2x2 ม.',
        status,
        features,
        tenant
      });
      idCounter++;
    }
  });

  return stalls;
};

export const MOCK_STALLS = generateStalls();

export const ZONE_LABELS: Record<ZoneType | 'ALL', string> = {
  ALL: 'ทั้งหมด',
  [ZoneType.FOOD]: 'อาหาร & เครื่องดื่ม',
  [ZoneType.FASHION]: 'เสื้อผ้า & แฟชั่น',
  [ZoneType.CRAFT]: 'งานฝีมือ & DIY',
  [ZoneType.GENERAL]: 'ของใช้ทั่วไป',
};