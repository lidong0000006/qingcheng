import React, { useState, useEffect, useCallback } from 'react';
import { Compass, MessageCircle, User, Search, Bell, MapPin, Heart, Edit2, Check, ChevronRight, Lock, Star, Settings, LogOut, ArrowLeft, Share2, MoreVertical, Coffee, Book, Palette, X, Feather } from 'lucide-react';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import ChatScreen from './components/ChatScreen';
import EditProfileModal from './components/EditProfileModal';
import NotificationPanel from './components/NotificationPanel';
import SettingsPanel from './components/SettingsPanel';
import ContactPicker from './components/ContactPicker';
import AuthScreen from './components/AuthScreen';
import DevUserSwitcher from './components/DevUserSwitcher';
import MomentsScreen from './components/MomentsScreen';
import MatchesScreen from './components/MatchesScreen';
import { supabase } from './lib/supabase';
import { apiFetch } from './lib/api';


const FALLBACK_DISCOVER_USERS = [
  { id: '1', name: 'Mei Lin', age: 26, distance: '3 公里', tags: ['生花', '爵士乐', '现代艺术'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANs6y1EVbi-pAHJDDi8YSNnO2wEO7IeCW8MZLLDKLnlvD9ip5zDBMMuqX6rasxtvIw-NnLAHA1IWtumNToFW7MeMIBOXRs1bBMwGDsqLGnR8L4HFfGRVlDnfPVDn26phbD5jQJbvnyGtEghrxxDo99VRaHwZcgSUan2QnD5LlwSR_h_2eWoJQ72S_KHmL4E2TkU0x29lSeTX7kARqohdb9zerqDkcJBcySRPm5A1dVonJLFjsZogzi1uL-2M_qU3PBuyyO0wF7-rXo', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANs6y1EVbi-pAHJDDi8YSNnO2wEO7IeCW8MZLLDKLnlvD9ip5zDBMMuqX6rasxtvIw-NnLAHA1IWtumNToFW7MeMIBOXRs1bBMwGDsqLGnR8L4HFfGRVlDnfPVDn26phbD5jQJbvnyGtEghrxxDo99VRaHwZcgSUan2QnD5LlwSR_h_2eWoJQ72S_KHmL4E2TkU0x29lSeTX7kARqohdb9zerqDkcJBcySRPm5A1dVonJLFjsZogzi1uL-2M_qU3PBuyyO0wF7-rXo' },
  { id: '2', name: '林逸', age: 29, distance: '5 公里', tags: ['茶道', '建筑'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMI6dqJVhsmifTQ78mBgmNmRTu0KgjnftHPKo9x0cD4bMGWTkAiFJz-IhNWClQXxepFr-oDprcabJxUPj5Kdq9oxL4UrSzPdx1FSE1KUg4IYKBSZtJ1nE7QhYQ3Ie7bgLzh-f6eQAD2uY_Wh3dQnaJNPOBDYUyjwdCrMsnmHmhq72O6wsc8i8QJ53Nuz_H_hbEzqeKdyztsz10Egd79CbzbgAKpIwrHWrepwrDlTEnLN_QD7XrhJqs59fFyy70uabPG8Z7q79LS_CJ', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMI6dqJVhsmifTQ78mBgmNmRTu0KgjnftHPKo9x0cD4bMGWTkAiFJz-IhNWClQXxepFr-oDprcabJxUPj5Kdq9oxL4UrSzPdx1FSE1KUg4IYKBSZtJ1nE7QhYQ3Ie7bgLzh-f6eQAD2uY_Wh3dQnaJNPOBDYUyjwdCrMsnmHmhq72O6wsc8i8QJ53Nuz_H_hbEzqeKdyztsz10Egd79CbzbgAKpIwrHWrepwrDlTEnLN_QD7XrhJqs59fFyy70uabPG8Z7q79LS_CJ' },
  { id: '3', name: '王雅', age: 24, distance: '8 公里', tags: ['钢琴', '美食', '摄影'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9qNCcwbgKoTG3z_fYJDfhf2eUCcVFECubYWgSqAT5Wl5L7D8ymO_xvH4q-Xiwzx01qQ02vRsIlGsBOxSsmt4zQD3deFcaLcj_RQfVhtJMQYmUEGMXRvLbr1OXYkTnNEQvLEXlOYDIhBk29-dfJyhGfdtn4wFA7_Q65o_q9nHVEDl0eHkzCGBzmgLZMhiFLZ4UHwnRECfE5viNC5fA7ZdEtUH7vq2YJar0aX_DyUPrUxlW82vlpyCQkjqsQtgstHf0AgDPq1b345Fw', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9qNCcwbgKoTG3z_fYJDfhf2eUCcVFECubYWgSqAT5Wl5L7D8ymO_xvH4q-Xiwzx01qQ02vRsIlGsBOxSsmt4zQD3deFcaLcj_RQfVhtJMQYmUEGMXRvLbr1OXYkTnNEQvLEXlOYDIhBk29-dfJyhGfdtn4wFA7_Q65o_q9nHVEDl0eHkzCGBzmgLZMhiFLZ4UHwnRECfE5viNC5fA7ZdEtUH7vq2YJar0aX_DyUPrUxlW82vlpyCQkjqsQtgstHf0AgDPq1b345Fw' }
];

const FALLBACK_MESSAGES = [
  { id: '1', name: 'Chen Wei', time: '2分钟前', message: '我真的很喜欢你分享的那首诗。它让我想起...', unread: 2, sender_id: '', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRo1S1N7-Uz_uQg0cq_2m-Tei4IcCkcUJjtufrNsSaKS9X8-fKw1V_R90E8JU2y1PpW7-E-Utw_erof7NfpSvd-jwAzuH72D7sATvBBbxNmTXq0zsHzphArYwMfbaCEFNBRHT52C6wRNRupztGgGhWKnCfnaa5a6SM--DkvxB8x50eTY2-BL85bRRfZ-gH2CdUr1K9mhg6D1wOKB6tQcmAmR_yvsY85_3ahTHO9bXQ6jz1ZJia2wyfOet2pkSvVhwHxZDY1ta1pV1A' },
  { id: '2', name: 'Li Ling', time: '1小时前', message: '画展将在晚上7点开始。你想一起去吗？', unread: 0, sender_id: '', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcRIFMoCvgN0z3DKugQlWyqe8_S2H-XIuDgtFsvBij5wKUEt2M2mAbfV_oxyFbSbxrDlkFfuLxoFbC5Ny_VWoZs8blIcnASvHVDwNBNBWa3CI_obnASw6cApR0gdi0Pn6v3tHRgVSmG8ve5OAW7ESEdqRR1EwQ_-_5l0E_H_AtiDZF8cGIoPDIbjYR0h07TaZ4_VARUDfDp3-rVI4bcNylEj3mBX_zUlLuK3HVNFa-SpAbY6wG5EuYspeH3QoN4uS-CcVRWBjO2sec' },
  { id: '3', name: 'Zhang Kai', time: '3小时前', message: '关于现代艺术，这确实是一个非常有趣的视角。', unread: 0, read: true, sender_id: '', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAco_ZtSF2w7UfzZeMZJfgFezPgkQPOHxLAB20xQSbi56n8S2x5krrGhep-ICfBdkM1p5Ssf1dbTfaGyaLGVTJVFgew93Y_72dIbCbnNZo7dBi_uj145KgGzFqYtMK2b1TyH_ttZfApkdF3LT8ARCfDsz7zHPOwUuByK71XNOMjeXlOCY_bOYXrVbidnk4a8V7GtL-Hi5H34vCPEGbYG-OpVNkgzIujMZw6BeXZKlkqBYJtpgO6chAYT33mxNLmYbl6zhyclI1bYos4' }
];

const FALLBACK_PROFILE = {
  name: '李伟', age: 26, location: '上海', job: '艺术策展人',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKNjKS6hlFUA5YNX8nF0ID_DrAZqaeMKPfsOlt_I9sH3MhoI1s252OiKhJBzrWbcqjxHNc7pzm3DbVcQUY_tt-xt0DutqFHfRQ26QTJXvLKKNcHks_W4-QIB8vbvg1Rp_APY9277hCgDIHKtPhiA6LqaLPsVccVu7pIAv8zFp8Mk2AbGKFBYxDGMOhegqxHCRvMlneyYwa5a2zZ1XQBCr16dBIFdbahZR_X5y_fbTGQVJjnJY9-wpDvkPPKwrAZ3AdvwPcHhQ-FKuw',
  main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEGmyD6XEsxoRnSQEo-tL8cq6RXHLuz2c7UYpJs3EK8sgq7-xdIg6kse9reVvj7di0SZ03FhyYvmAUicsK847S2N31e5F0WUdCMpcqeJ7hLqkRx_9ItE3caVxR4W942u6Fgf8So1CXiT-wcR386GpFcEYsQDcBicrw8e0nGgbn5LYw_ubHbryUKGV3cH6tyEbE0c3vwEK6vtQNS0-cpAcHk1qYCp3Xt9j53J91wxIxyjFPtHP_-MVUNxmnCvpW3go6J2YbzKNI4EMB',
  album: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCL19bnTQy-bKErk81_g39ewlPduXazfs3og2DltczIOBd29taiUgy-aRoet3NB83Of0vRUp7OyC39Sfw4O8qO8nW7S94gIR9foSY8bQ-dYHAW6UVeq9j8UFz8z-yxJGFCtaqopaCj02QnpDmXdOaTZbl1McEOc1IR6HmLnZGMo6MioT7zcZNBF_IbyEjXL1kSliU2Dcyu-zPyMNpLqFUuRQJz9Vj3zcBDLJq9GDrhE36ogVSjeouMna_6mO-AsfbJueKkbEC126oYO',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAgSz0NDlZ5KGKJTAL20DOjaqn_Q8WiI1YTmX-p2QWlEyyR28hgsdC1J28SyKPcePmlNKYgjDRH1-b1AGvXkNhm1GPzJTlIx_ii9YUx1IZQOzBxVvNgVh73M2Hhj8Xns9CyejF__Q5vkAV-yK2z4KlQuAMIC4yVUhId_LT1Ez5ynkcAhbB1wPXeRl44lkLgsy1RG-bxM6SaQJLu96wBP9BFjXSCjF_nUR9n_wb2YPL7Is2WKWChfYtojubjMoWiJkwhE4TaSnZL7Wtk',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDn_vgCsUP2b8GovTBdKyxUkSexH-Meo70F4R8G6FAJcEHL0Bk7jYizYEbBwTcc_paXA88CTUujJzg-Jse53U18c8UOB5FxXprbBEhna6GQNJKr6tr6KpGKAzn5fLlykocziCYZez1YfHr1szaliJqCYfG433acGcLtdRkdrK4pY_Tu2ak-CK_UgYqp81ZwIXtqSjOFNwI0D6wRm43Ic2zwZxqrUg1O0b16sr_3tGrrwtlaG0AM_6Zis4nY0wl5VWOy9DKJuFulSMg_'
  ]
};

const FALLBACK_YILIN = {
  name: 'Yilin', age: 26, location: "Shanghai, Jing'an",
  tags: ['建筑师', '复旦大学', '168 厘米'],
  about: '一个在旧式石库门和现代玻璃大厦的交汇中寻找美感的城市观察者。周末我喜欢在西岸写生，或者去寻找最完美的精品咖啡。希望能遇到一个既喜欢图书馆的安静，也能享受爵士俱乐部热闹的人。',
  images: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA9wTh-qsseuKR7r5bmqHYeSHyNtcaiAn8rXnzGZgdrZZSQCfMEFcw2vxo2ktWOBkzcbRsGVhefF37yCXshefBT6mlnL5TRfF8tAhPRYO234xpTSGTQn19q-TV6ZXVGJ1AXYg7os9yB9n4fd-jHBi6qAYY07KMpkG8NRWVZblgyrAlfTa7LOd72Kc1THirQR0_H6r9DnnP2HwQcXMyM4J4b_mJQW12awyxcNox3q355mYk_eZXjLJKNMAPglODvilH8Q26LOdePVaNh',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB2U7ZybLnLOLXJaEgHkK8ITTxNZqAGX4AV8M5kp8zpCunzNi4FbPIRomsNiz4fvMAkBM2ynIj7o209Fj_b1iZE2Pbp6YAabcW7TeGJqR078gj53Ow8LVAhKglXKI_hkkl2iB4lAehtYrPW4wKjKHM93Q2W4sZiqbTap7EN-o03rZR1xUlr9pwLusb9ulTD4juWY9hOPNZBl7RRT0EdFYTx74s-TinjURnrqXpSYZGGUWfiyewSm3tbuJIUSHzlzEo_6PCY-bXfVPIo',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCy1K-x1f8oBdUWYzF9ie7HdQsFR5CImLNGShHUX4SVDXwxXpM9F-h9YoQC4OLxaB9PBQyBUqSbl5MVEOLdCFGOx6vn-9EIsLiXZ959VsvRe4SHxWzDrgoZM9qxoVleEccLzATcqGIwpmOEwUoOHmt6jGAvdz0DE2POJds1A0-GStwc9sXSWcb3eABaoMCrjO7S4Mh_IuZMcDNkqRyDHSvPev0hPAYPKNtGJigT-KVthmrRfleZ9Jmhyy5fh6XHRrz20o_gQroAA5W1'
  ]
};

// ========================
// DISCOVER SCREEN
// ========================
interface DiscoverScreenProps {
  onUserClick: (u: any) => void;
  onChatWith: (u: any) => void;
  likedIds: Set<string>;
  onLike: (id: string) => void;
  showToast: (msg: string, type?: any) => void;
  refreshKey?: number;
}
function DiscoverScreen({ onUserClick, onChatWith, likedIds, onLike, showToast, refreshKey }: DiscoverScreenProps) {
  const [users, setUsers] = useState<any[]>(FALLBACK_DISCOVER_USERS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    apiFetch('/api/discover').then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.length) setUsers(data); })
      .catch(() => {});
  }, [refreshKey]);


  const filtered = searchText ? users.filter(u => u.name.toLowerCase().includes(searchText.toLowerCase()) || (u.tags || []).some((t: string) => t.includes(searchText))) : users;

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
      {searchOpen && (
        <div className="mb-6 relative animate-[slideDown_0.2s_ease-out]">
          <input autoFocus value={searchText} onChange={e => setSearchText(e.target.value)} className="w-full bg-gray-100 border-none rounded-2xl px-12 py-4 focus:ring-0 focus:bg-white transition-all placeholder:text-gray-400" placeholder="搜索名字或标签..." />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button onClick={() => { setSearchOpen(false); setSearchText(''); }} className="absolute right-4 top-1/2 -translate-y-1/2"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
      )}
      <section className="mb-10">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">今日精选</h2>
        <p className="text-gray-600">为您的数字沙龙精心挑选。</p>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((user, idx) => (
          <div key={user.id} className="group relative flex flex-col gap-4 h-full" onClick={() => onUserClick(user)}>
            <div className="relative rounded-2xl overflow-hidden h-[500px] flex-shrink-0 shadow-lg transition-transform duration-500 group-hover:-translate-y-2 cursor-pointer">
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 -left-2 bg-white py-3 px-8 rounded-r-full shadow-xl">
                <div className="flex items-end gap-2">
                  <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                  <span className="text-sm text-gray-500 mb-1">{user.age}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-4 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">{user.distance || user.location}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {(user.tags || []).map((tag: string) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-gray-200 text-xs font-semibold text-gray-700">{tag}</span>
                ))}
              </div>
              <div className="flex gap-3 mt-auto">
                <button
                  className={`flex-1 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-all ${likedIds.has(user.id) ? 'bg-white text-primary border-2 border-primary shadow-primary/10' : 'bg-gradient-to-br from-primary to-primary-light text-white shadow-primary/20'}`}
                  onClick={(e) => { e.stopPropagation(); onLike(user.id); }}
                >
                  {likedIds.has(user.id) ? '已喜欢 ♥' : '喜欢'}
                </button>
                <button className="w-12 h-12 flex items-center justify-center bg-white text-primary rounded-full shadow-md active:scale-95 transition-transform" onClick={(e) => { e.stopPropagation(); onChatWith({ id: user.id, name: user.name, avatar: user.avatar || user.image }); }}>
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

// ========================
// MESSAGES SCREEN
// ========================
interface MessagesScreenProps {
  onOpenChat: (partner: any) => void;
  onNewMessage: () => void;
  refreshKey?: number;
}
function MessagesScreen({ onOpenChat, onNewMessage, refreshKey }: MessagesScreenProps) {
  const [messages, setMessages] = useState<any[]>(FALLBACK_MESSAGES);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    apiFetch('/api/messages').then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.length) setMessages(data); })
      .catch(() => {});
  }, [refreshKey]);


  const filtered = searchText ? messages.filter(m => m.name.toLowerCase().includes(searchText.toLowerCase()) || m.message.toLowerCase().includes(searchText.toLowerCase())) : messages;

  return (
    <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
      <section className="mb-10">
        <h1 className="font-extrabold text-4xl tracking-tight mb-2 text-gray-900">对话</h1>
        <p className="text-gray-500 text-lg">为您挑选的缘分正等待开启。</p>
      </section>
      <div className="mb-8 relative">
        <input value={searchText} onChange={e => setSearchText(e.target.value)} className="w-full bg-gray-100 border-none rounded-2xl px-12 py-4 focus:ring-0 focus:bg-white transition-all placeholder:text-gray-400" placeholder="搜索匹配项..." type="text" />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        {searchText && <button onClick={() => setSearchText('')} className="absolute right-4 top-1/2 -translate-y-1/2"><X className="w-5 h-5 text-gray-400" /></button>}
      </div>
      <div className="space-y-4">
        {filtered.map(msg => (
          <div key={msg.id} onClick={() => onOpenChat({ id: msg.sender_id || msg.id, name: msg.name, avatar: msg.avatar })} className={`group relative rounded-2xl p-5 flex items-center gap-5 cursor-pointer transition-all ${msg.unread > 0 ? 'bg-white shadow-md border border-primary/5' : 'bg-gray-50 hover:bg-gray-100'}`}>
            <div className="relative flex-shrink-0">
              <div className={`w-16 h-16 rounded-2xl overflow-hidden ${msg.unread > 0 ? 'ring-2 ring-primary/20' : ''}`}>
                <img src={msg.avatar || ''} alt={msg.name} className="w-full h-full object-cover" />
              </div>
              {msg.unread > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white"></div>}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-lg text-gray-900 truncate">{msg.name}</h3>
                <span className={`text-xs ${msg.unread > 0 ? 'font-semibold text-primary' : 'text-gray-400'}`}>{msg.time || msg.time_display}</span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-1 text-gray-500 min-w-0">
                  {msg.read && <Check className="w-4 h-4 flex-shrink-0" />}
                  <p className={`text-sm truncate ${msg.unread > 0 ? 'text-gray-900 font-semibold' : ''}`}>{msg.message}</p>
                </div>
                {msg.unread > 0 && <span className="flex-shrink-0 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{msg.unread}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onNewMessage} className="fixed right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-light text-white rounded-full shadow-lg shadow-primary/20 flex items-center justify-center active:scale-90 transition-transform z-40" style={{ bottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>
        <Edit2 className="w-6 h-6" />
      </button>
    </main>
  );
}

// ========================
// MY PROFILE SCREEN
// ========================
function MyProfileScreen({ showToast, onEditProfile, profile, onSettingsOpen, onLogout, onSwitchIdentity }: {
  showToast: (m: string, t?: any) => void; onEditProfile: () => void; profile: any;
  onSettingsOpen: (page: string) => void;
  onLogout: () => void;
  onSwitchIdentity: () => void;
}) {
  const [showLogout, setShowLogout] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => showToast('分享链接已复制', 'success')).catch(() => showToast('分享链接已复制', 'success'));
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-10">
      {showLogout && (
        <ConfirmDialog title="退出登录" message="确定要退出登录吗？退出后需要重新登录。" confirmText="退出" danger onConfirm={() => { setShowLogout(false); onLogout(); showToast('已退出登录', 'success'); }} onCancel={() => setShowLogout(false)} />
      )}
      <section className="relative flex flex-col items-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-500">
            <img src={profile.main_image || profile.avatar || FALLBACK_PROFILE.main_image} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-2 shadow-lg flex items-center justify-center border-4 border-[#fbf9fa]">
            <Check className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-6 text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{profile.name}, {profile.age}</h1>
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" /> {profile.location} • {profile.job}
          </p>
        </div>
        <div className="mt-8 flex gap-4 w-full">
          <button onClick={onEditProfile} className="flex-1 bg-gradient-to-br from-primary to-primary-light text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform">
            <Edit2 className="w-5 h-5" /> 编辑个人资料
          </button>
          <button onClick={handleShare} className="px-6 bg-white text-primary font-semibold py-4 rounded-full shadow-md active:scale-95 transition-transform">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-bold text-xl">视觉相册</h2>
          <button onClick={onEditProfile} className="text-sm font-medium text-primary hover:opacity-80 active:scale-95 transition-all">管理相册</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(profile.album && profile.album.length > 0 ? profile.album : FALLBACK_PROFILE.album).slice(0, 9).map((img: string, idx: number) => (
             <div key={idx} className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm relative group cursor-pointer hover:shadow-md transition-shadow">
               <img src={img} className="w-full h-full object-cover" />
             </div>
          ))}
          {(!profile.album || profile.album.length < 9) && (
             <div onClick={onEditProfile} className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-primary transition-colors cursor-pointer group">
                <span className="text-3xl font-light mb-1 group-hover:scale-110 transition-transform">+</span>
                <span className="text-[10px] font-medium tracking-wider">上传照片</span>
             </div>
          )}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="font-bold text-xl px-2">账户与设置</h2>
        <div className="bg-gray-50 rounded-2xl overflow-hidden divide-y divide-gray-200">
          <a onClick={() => onSettingsOpen('preferences')} className="flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Heart className="w-5 h-5" /></div><span className="font-medium">匹配偏好</span></div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </a>
          <a onClick={() => onSettingsOpen('privacy')} className="flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Lock className="w-5 h-5" /></div><span className="font-medium">隐私与安全</span></div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </a>
          <a onClick={() => onSettingsOpen('premium')} className="flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><Star className="w-5 h-5" /></div><span className="font-medium">高级会员</span></div>
            <div className="flex items-center gap-2"><span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">已激活</span><ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" /></div>
          </a>
          <a onClick={() => onSettingsOpen('general')} className="flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><Settings className="w-5 h-5" /></div><span className="font-medium">常规设置</span></div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>
      <section className="pt-4 space-y-4">
        <DevUserSwitcher onSwitch={onSwitchIdentity} />
        <button onClick={() => setShowLogout(true)} className="w-full py-4 text-red-600 font-semibold flex items-center justify-center gap-2 hover:bg-red-50 rounded-full transition-colors">
          <LogOut className="w-5 h-5" /> 退出登录
        </button>
        <p className="mt-4 text-center text-xs text-gray-400 uppercase tracking-widest">版本 2.4.0 • 倾城之恋</p>
      </section>
    </main>
  );
}

// ========================
// USER PROFILE SCREEN
// ========================
function UserProfileScreen({ onBack, userDetail, likedIds, onLike, onChatWith, showToast }: {
  onBack: () => void; userDetail: any; likedIds: Set<string>;
  onLike: (id: string) => void; onChatWith: (u: any) => void; showToast: (m: string, t?: any) => void;
}) {
  const profile = { ...FALLBACK_YILIN, ...userDetail };
  const isLiked = likedIds.has(profile.id);
  const [showMore, setShowMore] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => showToast('分享链接已复制', 'success')).catch(() => showToast('分享链接已复制', 'success'));
  };

  return (
    <div className="bg-[#fbf9fa] min-h-screen pb-32">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(4rem + env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="active:scale-95 transition-transform text-gray-900"><ArrowLeft className="w-6 h-6" /></button>
          <span className="font-bold tracking-tight text-xl text-primary italic">倾城</span>
        </div>
        <div className="flex items-center gap-3 relative">
          <button onClick={handleShare} className="hover:opacity-80 transition-opacity active:scale-95 text-gray-500"><Share2 className="w-5 h-5" /></button>
          <button onClick={() => setShowMore(!showMore)} className="hover:opacity-80 transition-opacity active:scale-95 text-gray-500"><MoreVertical className="w-5 h-5" /></button>
          {showMore && (
            <div className="absolute top-10 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-40 z-50" onClick={() => setShowMore(false)}>
              <button onClick={() => showToast('已举报该用户', 'success')} className="w-full px-5 py-3 text-left text-sm hover:bg-gray-50 text-gray-700">举报用户</button>
              <button onClick={() => showToast('已拉黑该用户', 'success')} className="w-full px-5 py-3 text-left text-sm hover:bg-gray-50 text-red-500">拉黑用户</button>
            </div>
          )}
        </div>
      </header>

      <main className="pt-16 max-w-2xl mx-auto">
        <section className="relative px-4 mt-6">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-2">
            {(profile.images || profile.album || FALLBACK_YILIN.images).map((img: string, idx: number) => (
              <div key={idx} className="flex-none w-[85%] aspect-[3/4] rounded-2xl overflow-hidden snap-center relative group">
                <img src={img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 -mt-12 relative z-10">
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-black/5">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-bold text-3xl tracking-tight text-gray-900">{profile.name}, {profile.age}</h1>
                <p className="text-red-800 font-medium mt-1 flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location || profile.distance}</p>
              </div>
              <div className="bg-pink-100 px-3 py-1 rounded-full"><span className="text-pink-800 text-[10px] font-bold uppercase tracking-widest">已认证</span></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {(profile.tags || []).map((tag: string) => (
                <div key={tag} className="bg-gray-100 px-4 py-2 rounded-full text-gray-600 text-sm font-medium">{tag}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 px-6">
          <h2 className="font-bold text-xl mb-4 text-gray-900">关于我</h2>
          <div className="bg-gray-50 rounded-2xl p-6"><p className="text-gray-600 leading-relaxed font-light">{profile.about || FALLBACK_YILIN.about}</p></div>
        </section>

        <section className="mt-12 px-6">
          <h2 className="font-bold text-xl mb-4 text-gray-900">兴趣爱好</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-pink-100/50 rounded-2xl p-5 flex flex-col justify-between aspect-square"><Compass className="text-pink-800 w-8 h-8" /><span className="font-bold text-pink-900">城市设计</span></div>
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-3"><Coffee className="text-orange-800 w-5 h-5" /><span className="font-medium text-orange-900">咖啡烘焙</span></div>
              <div className="bg-rose-50 rounded-2xl p-4 flex items-center gap-3"><Book className="text-rose-800 w-5 h-5" /><span className="font-medium text-rose-900">经典文学</span></div>
              <div className="bg-gray-100 rounded-2xl p-4 flex items-center gap-3"><Palette className="text-gray-600 w-5 h-5" /><span className="font-medium text-gray-700">水彩画</span></div>
            </div>
          </div>
        </section>

        <section className="mt-12 px-6">
          <h2 className="font-bold text-xl mb-4 text-gray-900">感情目标</h2>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center"><Heart className="text-primary w-6 h-6 fill-current" /></div>
              <div><h3 className="font-bold text-gray-900">长期稳定关系</h3><p className="text-xs text-gray-500 uppercase tracking-wider">寻找人生伴侣</p></div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">建立在共同成长和求知欲基础上的关系。我正在寻找一位重视深度交流并有共同抱负的伴侣。</p>
          </div>
        </section>

        <section className="mt-12 px-6">
          <h2 className="font-bold text-xl mb-4 text-gray-900">择偶标准</h2>
          <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200"><span className="text-gray-500 text-sm">年龄范围</span><span className="font-bold text-gray-900">26 - 34</span></div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200"><span className="text-gray-500 text-sm">地理位置</span><span className="font-bold text-gray-900">上海及周边</span></div>
            <div className="flex justify-between items-center py-2"><span className="text-gray-500 text-sm">价值观</span><span className="font-bold text-gray-900">事业心，有创意</span></div>
          </div>
        </section>

        <section className="mt-16 px-6 flex items-center gap-4">
          <button onClick={onBack} className="flex-none w-14 h-14 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-md active:scale-90 transition-transform"><X className="w-6 h-6" /></button>
          <button onClick={() => onChatWith({ id: profile.id, name: profile.name, avatar: profile.avatar || profile.image })} className="flex-1 h-14 rounded-full bg-gradient-to-r from-primary to-primary-light text-white font-bold tracking-tight shadow-lg shadow-primary/20 active:scale-95 transition-transform">发送消息</button>
          <button onClick={() => onLike(profile.id)} className={`flex-none w-14 h-14 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform ${isLiked ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </section>
      </main>
    </div>
  );
}

// ========================
// MAIN APP
// ========================
export default function App() {
  const [authSession, setAuthSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [sessionUser, setSessionUser] = useState<any>(FALLBACK_PROFILE);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [identityVersion, setIdentityVersion] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatPartner, setChatPartner] = useState<any>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [settingsPage, setSettingsPage] = useState<string | null>(null);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  // Auth: check session on mount + listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load profile + likes when authenticated
  useEffect(() => {
    if (!authSession) return;
    const token = authSession.access_token;
    const headers = { 'Authorization': `Bearer ${token}` };
    apiFetch('/api/profile', { headers }).then(r => r.ok ? r.json() : FALLBACK_PROFILE)
      .then(data => { if (data && !data.error) setSessionUser(data); })
      .catch(() => setSessionUser(FALLBACK_PROFILE));
    apiFetch('/api/likes', { headers }).then(r => r.ok ? r.json() : [])
      .then(ids => setLikedIds(new Set(ids)))
      .catch(() => {});

  }, [authSession]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthSession(null);
    setSessionUser(FALLBACK_PROFILE);
    setActiveTab('discover');
  };

  const handleIdentitySwitch = useCallback(() => {
    // Re-fetch profile and likes
    apiFetch('/api/profile').then(r => r.ok ? r.json() : FALLBACK_PROFILE)
      .then(data => { if (data && !data.error) setSessionUser(data); })
      .catch(() => setSessionUser(FALLBACK_PROFILE));
    
    apiFetch('/api/likes').then(r => r.ok ? r.json() : [])
      .then(ids => setLikedIds(new Set(ids)))
      .catch(() => {});


    // Reset UI state that may reference the old identity
    setSelectedUser(null);
    setChatPartner(null);
    setShowNotifications(false);
    setSettingsPage(null);
    setShowContactPicker(false);
    setShowEditProfile(false);

    // Increment version to force child components to re-mount and re-fetch data
    setIdentityVersion(v => v + 1);

    showToast('已切换测试身份', 'success');
  }, [showToast]);

  // Show loading
  // if (authLoading) return (
  //   <div className="min-h-screen bg-[#fbf9fa] flex items-center justify-center">
  //     <div className="text-center">
  //       <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
  //       <p className="text-gray-400 text-sm">加载中...</p>
  //     </div>
  //   </div>
  // );

  // Show auth screen if not logged in
  // if (!authSession) return <AuthScreen onAuthSuccess={(session) => setAuthSession(session)} />;

  const handleLike = async (userId: string) => {
    const wasLiked = likedIds.has(userId);
    const newSet = new Set(likedIds);
    if (wasLiked) { newSet.delete(userId); } else { newSet.add(userId); }
    setLikedIds(newSet);
    try {
      if (wasLiked) {
        const r = await apiFetch(`/api/likes/${userId}`, { method: 'DELETE' });
        if (!r.ok) throw new Error('Failed');
        showToast('已取消喜欢', 'info');
      } else {
        const r = await apiFetch('/api/likes', { method: 'POST', body: JSON.stringify({ liked_id: userId }) });
        if (!r.ok) throw new Error('Failed');
        showToast('已喜欢 ❤️', 'success');
      }
      setIdentityVersion(v => v + 1); // Trigger re-fetch for MatchesScreen
    } catch { 
      showToast('操作失败，请检查网络或登录状态', 'error'); 
      setLikedIds(likedIds); // Revert local state
    }
  };

  const handleChatWith = (partner: any) => setChatPartner(partner);

  // Full-screen overlays
  if (chatPartner) return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ChatScreen partner={chatPartner} onBack={() => setChatPartner(null)} />
    </>
  );
  if (settingsPage) return <SettingsPanel page={settingsPage as any} onBack={() => setSettingsPage(null)} />;
  if (showContactPicker) return (
    <ContactPicker onClose={() => setShowContactPicker(false)} onSelect={(user) => { setShowContactPicker(false); setChatPartner(user); }} />
  );

  if (selectedUser) return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <UserProfileScreen onBack={() => setSelectedUser(null)} userDetail={selectedUser} likedIds={likedIds} onLike={handleLike} onChatWith={handleChatWith} showToast={showToast} />
    </>
  );

  return (
    <div className="bg-[#fbf9fa] min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
      {showEditProfile && <EditProfileModal profile={sessionUser} onClose={() => setShowEditProfile(false)} showToast={showToast} onSave={(data) => { setSessionUser(data); setShowEditProfile(false); showToast('资料已更新', 'success'); }} />}

      {/* Top Nav */}
      {activeTab !== 'profile' ? (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(4rem + env(safe-area-inset-top))' }}>
          <div className="flex items-center gap-3">
            {activeTab === 'discover' && (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/10">
                <img src={sessionUser.avatar || FALLBACK_PROFILE.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="font-bold tracking-tight text-2xl text-primary italic">Qing Cheng</h1>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'discover' && <button onClick={() => setSearchOpen(!searchOpen)} className="text-gray-500 hover:opacity-80 transition-opacity"><Search className="w-6 h-6" /></button>}
            <button onClick={() => setShowNotifications(true)} className="text-gray-500 hover:opacity-80 transition-opacity relative">
              <Bell className="w-6 h-6" />
            </button>
            {activeTab === 'messages' && (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                <img src={sessionUser.avatar || FALLBACK_PROFILE.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </header>
      ) : (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-6" style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(4rem + env(safe-area-inset-top))' }}>
          <div className="flex items-center gap-3"><span className="text-2xl font-extrabold text-primary italic">Qing Cheng</span></div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowNotifications(true)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:opacity-80 transition-opacity"><Bell className="w-6 h-6" /></button>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
              <img src={sessionUser.avatar || FALLBACK_PROFILE.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>
      )}

      {activeTab === 'discover' && <DiscoverScreen onUserClick={setSelectedUser} onChatWith={handleChatWith} likedIds={likedIds} onLike={handleLike} showToast={showToast} refreshKey={identityVersion} />}
      {activeTab === 'moments' && <MomentsScreen showToast={showToast} refreshKey={identityVersion} />}
      {activeTab === 'matches' && <MatchesScreen onUserClick={setSelectedUser} onChatWith={handleChatWith} showToast={showToast} refreshKey={identityVersion} />}
      {activeTab === 'messages' && <MessagesScreen onOpenChat={handleChatWith} onNewMessage={() => setShowContactPicker(true)} refreshKey={identityVersion} />}
      {activeTab === 'profile' && <MyProfileScreen showToast={showToast} onEditProfile={() => setShowEditProfile(true)} profile={sessionUser} onSettingsOpen={setSettingsPage} onLogout={handleSignOut} onSwitchIdentity={handleIdentitySwitch} />}

      {/* Bottom Nav */}
      <nav className="fixed left-1/2 -translate-x-1/2 flex justify-around items-center z-50 w-[92%] max-w-lg bg-white/90 backdrop-blur-md rounded-full px-4 py-3 shadow-xl" style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
        <button onClick={() => setActiveTab('discover')} className={`flex flex-col items-center justify-center transition-all duration-200 ${activeTab === 'discover' ? 'text-primary scale-110' : 'text-gray-400 opacity-60 hover:text-primary active:scale-90'}`}>
          <Compass className={`w-6 h-6 ${activeTab === 'discover' ? 'fill-current' : ''}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wider mt-1">发现</span>
        </button>
        <button onClick={() => setActiveTab('moments')} className={`flex flex-col items-center justify-center transition-all duration-200 ${activeTab === 'moments' ? 'text-primary scale-110' : 'text-gray-400 opacity-60 hover:text-primary active:scale-90'}`}>
          <Feather className={`w-6 h-6 ${activeTab === 'moments' ? 'fill-current' : ''}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wider mt-1">动态</span>
        </button>
        <button onClick={() => setActiveTab('matches')} className={`flex flex-col items-center justify-center transition-all duration-200 ${activeTab === 'matches' ? 'text-primary scale-110' : 'text-gray-400 opacity-60 hover:text-primary active:scale-90'}`}>
          <Heart className={`w-6 h-6 ${activeTab === 'matches' ? 'fill-current' : ''}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wider mt-1">匹配</span>
        </button>
        <button onClick={() => setActiveTab('messages')} className={`flex flex-col items-center justify-center transition-all duration-200 ${activeTab === 'messages' ? 'text-primary scale-110' : 'text-gray-400 opacity-60 hover:text-primary active:scale-90'}`}>
          <MessageCircle className={`w-6 h-6 ${activeTab === 'messages' ? 'fill-current' : ''}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wider mt-1">消息</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center justify-center transition-all duration-200 ${activeTab === 'profile' ? 'text-primary scale-110' : 'text-gray-400 opacity-60 hover:text-primary active:scale-90'}`}>
          <User className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-current' : ''}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wider mt-1">我的</span>
        </button>
      </nav>
    </div>
  );
}
