import React, { useState, useEffect } from 'react';
import { Stall, StallStatus, ZoneType } from '../types';
import { Settings, Save, XCircle, Trash, DollarSign, Store, Info, Database } from '../icons';

interface AdminPanelProps {
  selectedStall: Stall | null;
  onUpdate: (updatedStall: Stall) => void;
  onClose: () => void;
  onSeedData: () => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ selectedStall, onUpdate, onClose, onSeedData }) => {
  const [formData, setFormData] = useState<Stall | null>(null);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    if (selectedStall) {
      setFormData({ ...selectedStall });
    }
  }, [selectedStall]);

  const handleChange = (field: keyof Stall, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const handleStatusChange = (status: StallStatus) => {
    if (!formData) return;
    const updates: Partial<Stall> = { status };
    
    // Clear tenant if status is changed to available or maintenance
    if (status !== StallStatus.BOOKED) {
      updates.tenant = undefined;
    }
    
    setFormData({ ...formData, ...updates });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onUpdate(formData);
    }
  };

  const handleClearBooking = () => {
    if (!formData) return;
    if (confirm('ต้องการยกเลิกการจองของล็อคนี้ใช่หรือไม่?')) {
      setFormData({ ...formData, status: StallStatus.AVAILABLE, tenant: undefined });
    }
  };

  const sqlCode = `
-- 1. สร้างตาราง stalls (ถ้ายังไม่มี)
create table if not exists public.stalls (
  id text primary key,
  name text,
  zone text,
  price numeric,
  size text,
  status text,
  features text[], -- เก็บเป็น Array ของ text
  tenant text
);

-- 2. เปิดใช้งาน Row Level Security (ระบบความปลอดภัย)
alter table public.stalls enable row level security;

-- 3. ลบ Policy เก่าออกก่อน (ป้องกัน Error "already exists")
drop policy if exists "Allow public access" on public.stalls;

-- 4. สร้าง Policy อนุญาตให้ทุกคน อ่าน/เขียน ข้อมูลได้ (สำหรับ Demo)
create policy "Allow public access" 
on public.stalls 
for all 
using (true) 
with check (true);
  `.trim();

  // Mode: No stall selected -> Show Database Tools
  if (!formData || !selectedStall) {
    return (
      <div className="h-full flex flex-col bg-white border-l border-gray-100 shadow-xl shadow-gray-200/50 relative z-20 overflow-y-auto">
         <div className="p-6 bg-slate-800 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Settings size={24} /> Admin Tools
              </h3>
              <p className="text-slate-300 text-sm mt-1">จัดการระบบและฐานข้อมูล</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <XCircle size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
               <Database size={18} /> จัดการฐานข้อมูล (Supabase)
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              ใช้เมนูนี้เมื่อเริ่มโปรเจกต์ใหม่ เพื่อสร้างตารางใน Database
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowSql(!showSql)}
                className="w-full py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium flex justify-between items-center"
              >
                <span>{showSql ? 'ซ่อน SQL Code' : '1. แสดง SQL สร้างตาราง'}</span>
                {showSql ? <span className="text-xs text-gray-400">▲</span> : <span className="text-xs text-gray-400">▼</span>}
              </button>
              
              {showSql && (
                <div className="bg-slate-900 text-slate-300 p-3 rounded-lg text-xs font-mono overflow-x-auto relative group animate-fade-in">
                  <div className="mb-2 pb-2 border-b border-slate-700 text-slate-400 font-sans">
                     <strong>วิธีใช้งาน:</strong><br/>
                     1. กดปุ่ม <span className="text-white bg-slate-700 px-1 rounded">Copy</span> มุมขวา<br/>
                     2. ไปที่ <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-400 underline hover:text-blue-300">Supabase Dashboard</a> → เลือก Project<br/>
                     3. เมนูซ้ายมือเลือก <strong>SQL Editor</strong><br/>
                     4. วางโค้ดแล้วกด <strong>Run</strong>
                  </div>
                  <pre>{sqlCode}</pre>
                  <button 
                    onClick={() => navigator.clipboard.writeText(sqlCode)}
                    className="absolute top-2 right-2 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] text-white backdrop-blur-sm"
                  >
                    Copy SQL
                  </button>
                </div>
              )}

              <button 
                onClick={onSeedData}
                className="w-full py-3 px-3 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>2. Reset / ลงข้อมูลเริ่มต้น (Seed Data)</span>
              </button>
              <p className="text-xs text-gray-400 text-center">
                 *กดปุ่มนี้หลังจากรัน SQL เสร็จแล้วเพื่อใส่ข้อมูลร้านค้าตัวอย่าง
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-gray-400 p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <Store size={48} className="text-gray-300 mb-4" />
            <p className="mt-4 text-center">เลือกจิ้มที่ล็อคในแผนที่<br/>เพื่อแก้ไขข้อมูลรายล็อค</p>
          </div>
        </div>
      </div>
    );
  }

  // Mode: Editing Stall
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-100 shadow-xl shadow-gray-200/50 relative z-20 overflow-y-auto">
      {/* Admin Header */}
      <div className="p-6 bg-slate-800 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Settings size={24} /> Admin Edit
            </h3>
            <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded text-sm backdrop-blur-sm">
              ล็อค: {formData.name} ({formData.id})
            </span>
          </div>
          <button onClick={() => {onClose(); setFormData(null);}} className="text-white/80 hover:text-white">
            <XCircle size={24} />
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 space-y-6">
        
        {/* Status Control */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-2">สถานะล็อค (Status)</label>
          <div className="grid grid-cols-3 gap-2">
            {[StallStatus.AVAILABLE, StallStatus.BOOKED, StallStatus.MAINTENANCE].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                className={`
                  py-2 px-1 rounded-md text-xs sm:text-sm font-medium transition-all
                  ${formData.status === status 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {status === StallStatus.AVAILABLE && 'ว่าง'}
                {status === StallStatus.BOOKED && 'จองแล้ว'}
                {status === StallStatus.MAINTENANCE && 'ปิดปรับปรุง'}
              </button>
            ))}
          </div>
        </div>

        {/* Tenant Info (If Booked) */}
        {formData.status === StallStatus.BOOKED && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-blue-800">ผู้เช่าปัจจุบัน</label>
              <button 
                onClick={handleClearBooking}
                className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 flex items-center gap-1"
              >
                <Trash size={12} /> ยกเลิกการจอง
              </button>
            </div>
            <input
              type="text"
              value={formData.tenant || ''}
              onChange={(e) => handleChange('tenant', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-md text-sm text-blue-900 focus:ring-2 focus:ring-blue-300 outline-none"
              placeholder="ใส่ชื่อผู้เช่า"
            />
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <DollarSign size={14} /> ราคาค่าเช่า (บาท)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
               <Store size={14} /> โซน
             </label>
             <select 
               value={formData.zone}
               onChange={(e) => handleChange('zone', e.target.value)}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none bg-white"
             >
                {Object.values(ZoneType).map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
             </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Info size={14} /> จุดเด่น (Features)
            </label>
            <textarea
              rows={3}
              value={formData.features.join('\n')}
              onChange={(e) => handleChange('features', e.target.value.split('\n'))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
              placeholder="แยกบรรทัดละ 1 ข้อ"
            />
            <p className="text-xs text-gray-400 mt-1">*แยกรายการด้วยการขึ้นบรรทัดใหม่</p>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Save size={18} /> บันทึกการเปลี่ยนแปลง
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;