import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Lock, Star, Settings, ChevronRight } from 'lucide-react';
import { apiFetch } from '../lib/api';


interface SettingsPanelProps {
  page: 'preferences' | 'privacy' | 'premium' | 'general';
  onBack: () => void;
}

const TITLES: Record<string, string> = {
  preferences: '匹配偏好',
  privacy: '隐私与安全',
  premium: '高级会员',
  general: '常规设置'
};

export default function SettingsPanel({ page, onBack }: SettingsPanelProps) {
  return (
    <div className="fixed inset-0 z-[85] bg-[#fbf9fa] flex flex-col">
      <header className="bg-white/80 backdrop-blur-xl flex items-center gap-4 px-6 h-16 shadow-sm">
        <button onClick={onBack} className="active:scale-95 transition-transform"><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-xl">{TITLES[page]}</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        {page === 'preferences' && <MatchPreferences />}
        {page === 'privacy' && <PrivacySettings />}
        {page === 'premium' && <PremiumPage />}
        {page === 'general' && <GeneralSettings />}
      </div>
    </div>
  );
}

function MatchPreferences() {
  const [minAge, setMinAge] = useState(22);
  const [maxAge, setMaxAge] = useState(35);
  const [distance, setDistance] = useState(30);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch('/api/profile')
      .then(res => res.json())

      .then(data => {
        if (data.pref_min_age) setMinAge(data.pref_min_age);
        if (data.pref_max_age) setMaxAge(data.pref_max_age);
        if (data.pref_distance) setDistance(data.pref_distance);
        setLoaded(true);
      })
      .catch(err => {
        console.error('Error fetching preferences:', err);
        setLoaded(true);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ 
          pref_min_age: minAge, 
          pref_max_age: maxAge, 
          pref_distance: distance 
        })
      });

      if (res.ok) {
        alert('偏好设置已保存！');
      } else {
        alert('保存失败，请重试。');
      }
    } catch (e) {
      console.error(e);
      alert('网络错误，请重试。');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return <div className="text-center text-gray-500 py-10">加载中...</div>;
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-white rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-lg">基本偏好</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-2">年龄范围</label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-center" 
              />
              <span className="text-gray-400">—</span>
              <input 
                type="number" 
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-center" 
              />
              <span className="text-sm text-gray-500">岁</span>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">最大距离</label>
            <input 
              type="range" 
              min={1} 
              max={100} 
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full accent-primary" 
            />
            <p className="text-sm text-gray-600 mt-1">{distance} 公里</p>
          </div>
        </div>
      </div>
      <button 
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-full bg-gradient-to-br from-primary to-primary-light text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-70 disabled:scale-100"
      >
        {saving ? '保存中...' : '保存偏好'}
      </button>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100">
        {['隐藏在线状态', '隐藏距离', '隐藏年龄', '屏蔽已喜欢的人'].map(label => (
          <div key={label} className="flex items-center justify-between p-5">
            <span className="font-medium text-gray-700">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function PremiumPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-8 text-white text-center">
        <Star className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">高级会员</h3>
        <p className="text-white/80 text-sm">已激活 · 有效期至 2027年4月</p>
      </div>
      <div className="bg-white rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg">会员特权</h3>
        {['无限喜欢', '查看谁喜欢了你', '高级筛选', '优先推荐', '已读回执'].map(item => (
          <div key={item} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-3 h-3 text-primary fill-current" />
            </div>
            <span className="text-sm text-gray-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100">
        {[
          { label: '推送通知', toggle: true },
          { label: '声音提醒', toggle: true },
          { label: '深色模式', toggle: true },
          { label: '语言', value: '简体中文' },
          { label: '清除缓存', value: '' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between p-5">
            <span className="font-medium text-gray-700">{item.label}</span>
            {item.toggle ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            ) : (
              <div className="flex items-center gap-2">
                {item.value && <span className="text-sm text-gray-500">{item.value}</span>}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
