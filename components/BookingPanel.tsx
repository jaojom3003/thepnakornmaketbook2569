import React, { useState } from 'react';
import { Stall, BookingFormData } from '../types';
import { CheckCircle, XCircle, Info, DollarSign, Ruler } from '../icons';

interface BookingPanelProps {
  selectedStall: Stall | null;
  onBook: (data: BookingFormData) => void;
  onCancel: () => void;
}

const BookingPanel: React.FC<BookingPanelProps> = ({ selectedStall, onBook, onCancel }) => {
  const [formData, setFormData] = useState<BookingFormData>({
    vendorName: '',
    shopName: '',
    phone: '',
    products: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook(formData);
  };

  if (!selectedStall) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 border-l border-gray-100 bg-gray-50/50">
        <StorePlaceholder />
        <p className="mt-4 text-center">เลือกล็อคที่ต้องการจากแผนที่<br/>เพื่อดูรายละเอียดและทำการจอง</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-100 shadow-xl shadow-gray-200/50 relative z-20 overflow-y-auto">
      <div className="p-6 bg-indigo-600 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold">ล็อค {selectedStall.name}</h3>
            <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded text-sm backdrop-blur-sm">
              โซน: {selectedStall.zone}
            </span>
          </div>
          <button onClick={onCancel} className="text-white/80 hover:text-white">
            <XCircle size={24} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4 border-b border-gray-100">
        <div className="flex items-center gap-3 text-gray-700">
          <DollarSign className="text-green-600" size={20} />
          <div>
            <p className="text-xs text-gray-500">ราคาค่าเช่า</p>
            <p className="font-semibold text-lg">{selectedStall.price.toLocaleString()} บาท / วัน</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Ruler className="text-blue-600" size={20} />
          <div>
            <p className="text-xs text-gray-500">ขนาดพื้นที่</p>
            <p className="font-medium">{selectedStall.size}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-gray-700">
          <Info className="text-purple-600 mt-1" size={20} />
          <div>
            <p className="text-xs text-gray-500">จุดเด่น</p>
            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
              {selectedStall.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle size={18} className="text-indigo-600" /> ข้อมูลการจอง
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้จอง</label>
            <input
              required
              type="text"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="สมชาย ใจดี"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อร้าน</label>
            <input
              required
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="ร้านสมชาย ขายดี"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
            <input
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="081-234-5678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สินค้าที่ขาย</label>
            <textarea
              required
              name="products"
              rows={3}
              value={formData.products}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="เช่น ลูกชิ้นปิ้ง, เสื้อยืดวินเทจ"
            />
          </div>
          
          <button
            type="submit"
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            ยืนยันการจอง
          </button>
        </form>
      </div>
    </div>
  );
};

const StorePlaceholder = () => (
  <svg className="w-32 h-32 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default BookingPanel;