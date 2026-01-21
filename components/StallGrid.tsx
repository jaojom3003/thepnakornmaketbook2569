import React from 'react';
import { Stall, StallStatus, ZoneType } from '../types';
import { Store, Utensils, Shirt, Palette, Box } from '../icons';

interface StallGridProps {
  stalls: Stall[];
  selectedStallId: string | null;
  onSelectStall: (stall: Stall) => void;
  filterZone: ZoneType | 'ALL';
  isAdminMode?: boolean;
}

const StallGrid: React.FC<StallGridProps> = ({ stalls, selectedStallId, onSelectStall, filterZone, isAdminMode = false }) => {
  
  const filteredStalls = filterZone === 'ALL' 
    ? stalls 
    : stalls.filter(s => s.zone === filterZone);

  const getStallColor = (stall: Stall) => {
    if (selectedStallId === stall.id) return 'bg-yellow-400 border-yellow-600 shadow-lg scale-105 ring-2 ring-yellow-300';
    
    // In admin mode, we want to clearly see the status, but still interact
    if (stall.status === StallStatus.BOOKED) return 'bg-gray-300 border-gray-400 text-gray-500';
    if (stall.status === StallStatus.MAINTENANCE) return 'bg-slate-200 border-slate-300 opacity-70';
    
    switch (stall.zone) {
      case ZoneType.FOOD: return 'bg-red-100 border-red-300 hover:bg-red-200 text-red-800';
      case ZoneType.FASHION: return 'bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-800';
      case ZoneType.CRAFT: return 'bg-teal-100 border-teal-300 hover:bg-teal-200 text-teal-800';
      default: return 'bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-800';
    }
  };

  const getZoneIcon = (zone: ZoneType) => {
    switch (zone) {
      case ZoneType.FOOD: return <Utensils size={14} />;
      case ZoneType.FASHION: return <Shirt size={14} />;
      case ZoneType.CRAFT: return <Palette size={14} />;
      default: return <Box size={14} />;
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Store className="text-indigo-600" /> ผังตลาดนัด {isAdminMode && <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-md">Admin Mode</span>}
        </h2>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div> ว่าง</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-300 border border-gray-400 rounded"></div> ไม่ว่าง</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 border border-yellow-600 rounded"></div> เลือกอยู่</div>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 auto-rows-fr">
        {filteredStalls.map((stall) => {
          const isInteractable = isAdminMode || stall.status === StallStatus.AVAILABLE;
          
          return (
            <button
              key={stall.id}
              onClick={() => isInteractable && onSelectStall(stall)}
              disabled={!isInteractable}
              className={`
                relative p-2 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center h-24 sm:h-28
                ${getStallColor(stall)}
                ${!isInteractable ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
              `}
            >
              <span className="absolute top-1 right-1 opacity-50">
                  {getZoneIcon(stall.zone)}
              </span>
              <span className="font-bold text-lg">{stall.name}</span>
              <span className="text-xs mt-1 font-medium opacity-80">{stall.price}฿</span>
              
              {/* Status Badges */}
              {stall.status === StallStatus.BOOKED && (
                <span className="absolute inset-0 flex items-center justify-center bg-gray-900/10 rounded-md">
                  <span className="bg-gray-800 text-white text-[10px] px-1 py-0.5 rounded shadow-sm">จองแล้ว</span>
                </span>
              )}
              {stall.status === StallStatus.MAINTENANCE && (
                <span className="absolute inset-0 flex items-center justify-center bg-gray-900/10 rounded-md">
                   <span className="bg-red-500 text-white text-[10px] px-1 py-0.5 rounded shadow-sm">ซ่อมแซม</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {filteredStalls.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          ไม่พบข้อมูลในโซนนี้
        </div>
      )}
    </div>
  );
};

export default StallGrid;