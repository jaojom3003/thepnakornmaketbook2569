import React, { useState, useEffect } from 'react';
import { MOCK_STALLS, ZONE_LABELS } from './constants';
import { Stall, BookingFormData, StallStatus, ZoneType } from './types';
import MarketMap from './components/MarketMap';
import BookingPanel from './components/BookingPanel';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import AIChat from './components/AIChat';
import { ShoppingBag, Search, Filter, Menu, Shield, Save, Database } from './icons';

// Import Supabase Service
import { supabase, isSupabaseConnected } from './services/supabaseClient';

const App: React.FC = () => {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [filterZone, setFilterZone] = useState<ZoneType | 'ALL'>('ALL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    if (isSupabaseConnected() && supabase) {
      fetchStallsFromSupabase();

      // Setup Realtime Subscription
      const channel = supabase
        .channel('public:stalls')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stalls' }, () => {
          fetchStallsFromSupabase();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    } else {
      // Fallback to Mock Data
      console.log('Using Mock Data (Supabase not connected)');
      setStalls(MOCK_STALLS);
    }
  }, []);

  const fetchStallsFromSupabase = async () => {
    if (!supabase) return;
    setIsSyncing(true);
    setDbError(null);
    const { data, error } = await supabase
      .from('stalls')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Error fetching stalls:', error);
      // แปลง Error ให้เข้าใจง่ายขึ้น
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
         setDbError('ยังไม่พบตาราง "stalls" ในฐานข้อมูล (กรุณาใช้เมนู Admin > Copy SQL ไปรันใน Supabase)');
      } else {
         setDbError(error.message);
      }
    } else if (data) {
      // แปลงข้อมูลให้ตรง Type (เผื่อกรณี JSON ใน DB)
      const formattedData = data.map((item: any) => ({
        ...item,
        features: Array.isArray(item.features) ? item.features : JSON.parse(item.features || '[]')
      }));
      setStalls(formattedData);
    }
    setIsSyncing(false);
  };

  const handleSelectStall = (stall: Stall) => {
    setSelectedStall(stall);
    setIsSidebarOpen(true);
  };

  const handleBookStall = async (data: BookingFormData) => {
    if (!selectedStall) return;

    if (isSupabaseConnected() && supabase) {
      setIsSyncing(true);
      const { error } = await supabase
        .from('stalls')
        .update({ 
          status: StallStatus.BOOKED, 
          tenant: data.vendorName 
        })
        .eq('id', selectedStall.id);
      
      setIsSyncing(false);

      if (error) {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        console.error(error);
        return;
      }
    } else {
      // Local Mock Update
      setStalls(prev => prev.map(s => 
        s.id === selectedStall.id ? { 
          ...s, 
          status: StallStatus.BOOKED,
          tenant: data.vendorName 
        } : s
      ));
    }

    alert(`จองล็อค ${selectedStall.name} สำเร็จ!\nขอบคุณคุณ ${data.vendorName}`);
    setSelectedStall(null);
    setIsSidebarOpen(false);
  };

  // Admin Update Function
  const handleAdminUpdate = async (updatedStall: Stall) => {
    if (isSupabaseConnected() && supabase) {
      setIsSyncing(true);
      
      // Prepare data for DB (convert undefined tenant to null)
      const dbPayload = {
        name: updatedStall.name,
        zone: updatedStall.zone,
        price: updatedStall.price,
        status: updatedStall.status,
        tenant: updatedStall.tenant || null,
        features: updatedStall.features // Supabase handles array automatically if column is jsonb/text[]
      };

      const { error } = await supabase
        .from('stalls')
        .update(dbPayload)
        .eq('id', updatedStall.id);

      setIsSyncing(false);

      if (error) {
        alert('แก้ไขข้อมูลไม่สำเร็จ');
        console.error(error);
        return;
      }
    } else {
      // Local Mock Update
      setStalls(prev => prev.map(s => 
        s.id === updatedStall.id ? updatedStall : s
      ));
    }
    
    setSelectedStall(null);
    setIsSidebarOpen(false);
  };

  // Function to seed initial data to Supabase
  const handleSeedData = async () => {
    if (!supabase) return;
    
    if (!confirm('ยืนยันการล้างข้อมูลเดิมและลงข้อมูลใหม่ทั้งหมด?')) return;

    setIsSyncing(true);

    try {
      // 1. Delete all
      await supabase.from('stalls').delete().neq('id', 'placeholder');

      // 2. Insert Mock Data
      const { error } = await supabase
        .from('stalls')
        .insert(MOCK_STALLS.map(s => ({
          ...s,
          tenant: s.tenant || null // Fix undefined for DB
        })));

      if (error) throw error;

      alert('ลงข้อมูลเริ่มต้นเรียบร้อยแล้ว!');
      fetchStallsFromSupabase();
    } catch (err: any) {
      console.error(err);
      alert('เกิดข้อผิดพลาด: ' + (err.message || 'Unknown error'));
      if (err.message?.includes('does not exist')) {
        alert('กรุณาสร้างตาราง "stalls" ใน Supabase ก่อน (ดู SQL ใน Admin)');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAdminToggle = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      setSelectedStall(null);
      setIsSidebarOpen(false);
    } else {
      setShowLoginModal(true);
    }
  };

  const filteredStalls = stalls.filter(s => {
      const matchZone = filterZone === 'ALL' || s.zone === filterZone;
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchZone && matchSearch;
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-prompt">
      {/* Navbar Mobile */}
      <div className={`lg:hidden fixed top-0 w-full h-16 shadow-sm z-30 flex items-center justify-between px-4 transition-colors ${isAdminMode ? 'bg-slate-800 text-white' : 'bg-white text-indigo-600'}`}>
        <div className="flex items-center gap-2 font-bold">
           <ShoppingBag /> {isAdminMode ? 'MarketBook [Admin]' : 'MarketBook'}
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 ${isAdminMode ? 'text-white' : 'text-gray-600'}`}>
          <Menu />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full lg:mr-96 pt-16 lg:pt-0 transition-all duration-300">
        
        {/* Header (Desktop) */}
        <header className={`border-b border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${isAdminMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
          <div className={`hidden lg:flex items-center gap-2 text-2xl font-bold ${isAdminMode ? 'text-white' : 'text-indigo-600'}`}>
             <div className={`p-2 rounded-lg ${isAdminMode ? 'bg-slate-700' : 'bg-indigo-100'}`}>
                <ShoppingBag /> 
             </div>
             {isAdminMode ? 'MarketBook Admin System' : 'MarketBook'}
             
             {/* Connection Status Badge */}
             {!isSupabaseConnected() ? (
               <span className="text-xs px-2 py-1 bg-gray-200 text-gray-500 rounded-full font-normal">Offline / Mock Mode</span>
             ) : (
               <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-normal flex items-center gap-1">
                 <div className={`w-2 h-2 rounded-full bg-green-500 ${isSyncing ? 'animate-ping' : ''}`}></div> 
                 {isSyncing ? 'Syncing...' : 'Online DB'}
               </span>
             )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
             
             {/* Admin Toggle */}
             <button 
                onClick={handleAdminToggle}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border
                  ${isAdminMode 
                    ? 'bg-red-500 border-red-600 text-white hover:bg-red-600' 
                    : 'bg-white border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400'
                  }
                `}
             >
                <Shield size={16} /> {isAdminMode ? 'ออกจากระบบ Admin' : 'เข้าสู่ระบบ Admin'}
             </button>

             <div className="relative w-full sm:w-auto">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isAdminMode ? 'text-gray-400' : 'text-gray-400'}`} size={18} />
                <input 
                  type="text" 
                  placeholder="ค้นหาเลขล็อค..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none w-full sm:w-64
                    ${isAdminMode 
                      ? 'bg-slate-700 border-slate-600 text-white focus:ring-slate-500 placeholder-slate-400' 
                      : 'bg-white border-gray-300 focus:ring-indigo-500'
                    }
                  `}
                />
             </div>
          </div>
        </header>

        {/* Filters */}
        <div className="p-4 sm:p-6 pb-0">
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            <Filter size={18} className="text-gray-500 mr-2 flex-shrink-0" />
            {(Object.keys(ZONE_LABELS) as Array<ZoneType | 'ALL'>).map((zone) => (
              <button
                key={zone}
                onClick={() => setFilterZone(zone)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${filterZone === zone 
                    ? (isAdminMode ? 'bg-slate-700 text-white' : 'bg-indigo-600 text-white shadow-md shadow-indigo-200') 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }
                `}
              >
                {ZONE_LABELS[zone]}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {isSupabaseConnected() && stalls.length === 0 && !isSyncing ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
               <Database size={48} className="text-orange-400 mb-2" />
               <h3 className="font-bold text-xl text-gray-800">เชื่อมต่อ Database สำเร็จแล้ว!</h3>
               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-md">
                 <p className="text-gray-600 font-medium mb-2">
                   {dbError 
                     ? <span className="text-red-500 flex items-center justify-center gap-2"><Shield size={16}/> {dbError}</span>
                     : "สถานะ: ตารางว่างเปล่า (ยังไม่มีข้อมูลร้านค้า)"
                   }
                 </p>
                 <p className="text-sm text-gray-400">
                    สิ่งที่คุณต้องทำ: กดเข้าสู่ระบบ Admin แล้วเลือกปุ่ม <strong>"ลงข้อมูลเริ่มต้น (Seed Data)"</strong> เพื่อใส่ข้อมูลตัวอย่าง
                 </p>
               </div>
               <button 
                 onClick={() => { setShowLoginModal(true); }}
                 className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 flex items-center gap-2 animate-bounce"
               >
                 <Shield size={20} /> เข้าสู่ระบบ Admin เพื่อเริ่มใช้งาน
               </button>
            </div>
          ) : (
            <MarketMap 
              stalls={filteredStalls}
              selectedStallId={selectedStall?.id || null}
              onSelectStall={handleSelectStall}
              filterZone={filterZone}
              isAdminMode={isAdminMode} 
            />
          )}
        </main>
      </div>

      {/* Right Sidebar (Booking Panel OR Admin Panel) */}
      <div className={`
        fixed inset-y-0 right-0 w-full lg:w-96 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen || selectedStall ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 lg:border-l lg:shadow-none
      `}>
        {isAdminMode ? (
          <AdminPanel 
            selectedStall={selectedStall}
            onUpdate={handleAdminUpdate}
            onClose={() => {
              setSelectedStall(null);
              setIsSidebarOpen(false);
            }}
            onSeedData={handleSeedData}
          />
        ) : (
          <BookingPanel 
            selectedStall={selectedStall} 
            onBook={handleBookStall}
            onCancel={() => {
              setSelectedStall(null);
              setIsSidebarOpen(false);
            }}
          />
        )}
      </div>

      {(isSidebarOpen || selectedStall) && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => {
            setSelectedStall(null);
            setIsSidebarOpen(false);
          }}
        />
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setIsAdminMode(true);
          setShowLoginModal(false);
          setIsSidebarOpen(true); // Open sidebar automatically
        }}
      />

      {/* Hide AI Chat in Admin Mode */}
      {!isAdminMode && <AIChat stalls={stalls} />}
    </div>
  );
};

export default App;