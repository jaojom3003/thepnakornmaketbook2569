export enum ZoneType {
  FOOD = 'FOOD',
  FASHION = 'FASHION',
  CRAFT = 'CRAFT',
  GENERAL = 'GENERAL'
}

export enum StallStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  MAINTENANCE = 'MAINTENANCE'
}

export interface Stall {
  id: string;
  name: string;
  zone: ZoneType;
  price: number;
  size: string;
  status: StallStatus;
  features: string[];
  tenant?: string; // ชื่อผู้เช่า (ถ้ามี)
}

export interface BookingFormData {
  vendorName: string;
  shopName: string;
  phone: string;
  products: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}