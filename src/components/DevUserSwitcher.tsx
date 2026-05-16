import React, { useState, useEffect } from 'react';
import { Users, X, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
  is_main_profile: boolean;
}

export default function DevUserSwitcher({ onSwitch }: { onSwitch: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        const mainUser = data.find((u: User) => u.is_main_profile);
        if (mainUser) setCurrentUserId(mainUser.id);
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) fetchUsers();
  }, [isOpen]);

  const handleSwitch = async (userId: string) => {
    if (userId === currentUserId) return; // Already this user
    setLoading(true);
    try {
      const res = await fetch('/api/dev/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) {
        setCurrentUserId(userId);
        // Refresh users list to update is_main_profile flags
        await fetchUsers();
        setIsOpen(false);
        onSwitch();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 text-gray-700 bg-white font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 rounded-full transition-colors border border-gray-200 shadow-sm"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Users className="w-5 h-5" />}
        <span>身份切换</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-[slideUp_0.2s_ease-out]">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">切换测试身份</h4>
            <button onClick={fetchUsers} className="text-gray-400 hover:text-primary transition-colors">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleSwitch(user.id)}
                disabled={loading || user.is_main_profile}
                className={`w-full p-4 flex items-center gap-3 text-left transition-all hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  user.is_main_profile ? 'bg-primary/5' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                  <img src={user.avatar} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-900">{user.name}</div>
                  {user.is_main_profile && <div className="text-[10px] text-primary font-bold">当前身份</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
