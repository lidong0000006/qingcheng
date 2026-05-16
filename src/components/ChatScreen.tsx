import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { apiFetch } from '../lib/api';


interface ChatMessage {
  id: string;
  message: string;
  time: string;
  is_mine: boolean;
}

interface ChatScreenProps {
  partner: { id: string; name: string; avatar: string };
  onBack: () => void;
}

export default function ChatScreen({ partner, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch(`/api/messages/chat/${partner.id}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setMessages(data))
      .catch(() => {});
  }, [partner.id]);


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');

    // Optimistic update
    const tempMsg: ChatMessage = { id: `temp-${Date.now()}`, message: text, time: '刚刚', is_mine: true };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ receiver_id: partner.id, message: text })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...data, is_mine: true, time: '刚刚' } : m));
      }
    } catch (e) {
      console.error('Error sending:', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#fbf9fa] min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex items-center gap-4 px-4 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(4rem + env(safe-area-inset-top))' }}>
        <button onClick={onBack} className="active:scale-95 transition-transform"><ArrowLeft className="w-6 h-6" /></button>
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img src={partner.avatar || ''} alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="font-bold text-lg">{partner.name}</h2>
          <p className="text-xs text-gray-400">在线</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 pt-20 pb-24 px-4 overflow-y-auto space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">发送第一条消息吧 ✨</div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.is_mine
                ? 'bg-gradient-to-br from-primary to-primary-light text-white rounded-br-md'
                : 'bg-white text-gray-800 rounded-bl-md'
            }`}>
              {msg.message}
              <div className={`text-[10px] mt-1 ${msg.is_mine ? 'text-white/60' : 'text-gray-400'}`}>{msg.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-4 py-3 flex gap-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="输入消息..."
          className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm focus:outline-none focus:bg-gray-50 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-transform disabled:opacity-40"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
