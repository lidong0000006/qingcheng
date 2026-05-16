import React, { useEffect, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface ContactPickerProps {
  onSelect: (user: User) => void;
  onClose: () => void;
}

export default function ContactPicker({ onSelect, onClose }: ContactPickerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.ok ? r.json() : [])
      .then(data => setUsers(data))
      .catch(() => {});
  }, []);

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[90] bg-[#fbf9fa] flex flex-col">
      <header className="bg-white/80 backdrop-blur-xl flex items-center gap-4 px-4 h-16 shadow-sm">
        <button onClick={onClose} className="active:scale-95 transition-transform"><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-xl">选择联系人</h2>
      </header>
      <div className="px-4 py-3">
        <div className="relative">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索联系人..." className="w-full bg-gray-100 rounded-2xl px-12 py-3 focus:outline-none focus:bg-white transition-all placeholder:text-gray-400" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">暂无联系人</div>
        ) : filtered.map(user => (
          <button key={user.id} onClick={() => onSelect(user)} className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors active:scale-[0.98]">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
              <img src={user.avatar || ''} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-gray-900">{user.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
