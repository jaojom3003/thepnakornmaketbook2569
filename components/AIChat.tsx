import React, { useState, useRef, useEffect } from 'react';
import { getGeminiRecommendation } from '../services/geminiService';
import { Stall } from '../types';
import { Sparkles, Send, Bot, User, Minimize2, Maximize2 } from '../icons';

interface AIChatProps {
  stalls: Stall[];
}

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

const AIChat: React.FC<AIChatProps> = ({ stalls }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'model', text: 'สวัสดีครับ! ผมคือผู้ช่วย Market Guru 🤖\nบอกผมได้เลยครับว่าคุณอยากขายอะไร ผมจะช่วยเลือกล็อคทำเลทองให้เอง!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userText }]);
    setIsLoading(true);

    const responseText = await getGeminiRecommendation(userText, stalls);
    
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isOpen ? 'w-80 sm:w-96' : 'w-auto'}`}>
      <div 
        className={`bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-t-xl shadow-2xl cursor-pointer flex items-center justify-between p-4 ${!isOpen && 'rounded-xl'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 font-semibold">
          <div className="p-1.5 bg-white/20 rounded-full">
            <Sparkles size={18} />
          </div>
          <span>{isOpen ? 'Market Guru AI' : 'ให้ AI ช่วยหาทำเล'}</span>
        </div>
        <button className="text-white/80 hover:text-white">
          {isOpen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="bg-white h-96 border-x border-b border-gray-200 rounded-b-xl flex flex-col shadow-2xl">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="flex max-w-[85%] gap-2">
                   <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                     <Bot size={16} />
                   </div>
                   <div className="p-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-500 italic flex items-center gap-2">
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                     กำลังวิเคราะห์ทำเล...
                   </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-100 rounded-b-xl">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="พิมพ์สินค้าที่จะขาย..."
                className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;