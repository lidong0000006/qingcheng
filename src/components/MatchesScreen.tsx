import React, { useState, useEffect } from 'react';
import { Heart, Search, MessageCircle, MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import { apiFetch } from '../lib/api';


interface UserDetail {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  image: string;
  avatar: string;
  job: string;
  liked_at: string;
}

interface MatchesScreenProps {
  onUserClick: (u: any) => void;
  onChatWith: (u: any) => void;
  showToast: (msg: string, type?: any) => void;
  refreshKey?: number;
}

export default function MatchesScreen({ onUserClick, onChatWith, showToast, refreshKey }: MatchesScreenProps) {
  const [activeSubTab, setActiveSubTab] = useState<'liked_me' | 'liked_by_me'>('liked_by_me');
  const [likedMe, setLikedMe] = useState<UserDetail[]>([]);
  const [likedByMe, setLikedByMe] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/matches/all?t=${Date.now()}`)

      .then(r => r.ok ? r.json() : { liked_me: [], liked_by_me: [] })
      .then(data => {
        setLikedMe(data.liked_me || []);
        setLikedByMe(data.liked_by_me || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch matches error:', err);
        setLoading(false);
      });
  }, [refreshKey]);

  const currentList = activeSubTab === 'liked_me' ? likedMe : likedByMe;
  const filtered = searchText 
    ? currentList.filter(u => u.name.toLowerCase().includes(searchText.toLowerCase()) || (u.job || '').toLowerCase().includes(searchText.toLowerCase()))
    : currentList;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days} 天前`;
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto min-h-screen">
      <section className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">匹配</h1>
        <p className="text-gray-500">查看谁对你感兴趣，以及你心动的人。</p>
      </section>

      {/* Sub Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
        <button 
          onClick={() => setActiveSubTab('liked_me')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeSubTab === 'liked_me' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          喜欢我的
          {likedMe.length > 0 && <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{likedMe.length}</span>}
        </button>
        <button 
          onClick={() => setActiveSubTab('liked_by_me')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeSubTab === 'liked_by_me' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          我喜欢的
          {likedByMe.length > 0 && <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">{likedByMe.length}</span>}
        </button>
      </div>

      {/* Search */}
      <div className="mb-8 relative">
        <input 
          value={searchText} 
          onChange={e => setSearchText(e.target.value)} 
          className="w-full bg-gray-50 border-none rounded-2xl px-12 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm" 
          placeholder="搜索名字或职业..." 
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">暂无发现</h3>
          <p className="text-gray-500 mt-2">快去主页探索更多有趣的人吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((user) => (
            <div 
              key={user.id} 
              onClick={() => onUserClick(user)}
              className="group bg-white rounded-3xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-50"
            >
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-gray-50 group-hover:ring-primary/5 transition-all">
                  <img src={user.avatar || user.image} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-sm text-primary">
                  <Heart className="w-3 h-3 fill-current" />
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{user.name}, {user.age}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {user.distance || user.location} • {user.job}
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                     <Calendar className="w-3 h-3" /> {formatDate(user.liked_at)}
                  </div>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatWith({ id: user.id, name: user.name, avatar: user.avatar || user.image });
                    }}
                    className="flex-1 py-1.5 bg-primary/5 text-primary text-xs font-bold rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" /> 发送消息
                  </button>
                  <button className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg hover:text-primary transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
