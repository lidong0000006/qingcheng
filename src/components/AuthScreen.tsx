import React, { useState } from 'react';
import { Heart, Mail, Lock, User, MapPin, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthScreenProps {
  onAuthSuccess: (session: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register extra fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('请填写邮箱和密码'); return; }
    setLoading(true); setError('');
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message === 'Invalid login credentials' ? '邮箱或密码错误' : err.message); setLoading(false); return; }
    onAuthSuccess(data.session);
  };

  const handleRegister = async () => {
    if (!email || !password || !name) { setError('请填写必要信息'); return; }
    if (password.length < 6) { setError('密码至少6位'); return; }
    setLoading(true); setError('');

    // 1. Create auth user
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } }
    });
    if (authErr) { setError(authErr.message); setLoading(false); return; }

    // 2. Create user profile in users table
    if (authData.user) {
      const { error: profileErr } = await supabase.from('users').insert([{
        name,
        age: age ? parseInt(age) : null,
        location: location || null,
        auth_id: authData.user.id,
        is_main_profile: false,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      }]);
      if (profileErr) { console.error('Profile creation error:', profileErr); }
    }

    onAuthSuccess(authData.session);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mode === 'login' ? handleLogin() : handleRegister();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbf9fa] via-pink-50 to-[#fbf9fa] flex items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-3xl shadow-xl shadow-primary/20 mb-6">
            <Heart className="w-10 h-10 text-white fill-current" />
          </div>
          <h1 className="text-4xl font-extrabold text-primary italic tracking-tight">Qing Cheng</h1>
          <p className="text-gray-500 mt-2 text-sm">倾城之恋 · 寻找你的故事</p>
        </div>

        {/* Tab Switch */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >登录</button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >注册</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input value={name} onChange={e => setName(e.target.value)} placeholder="你的昵称 *" className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input value={age} onChange={e => setAge(e.target.value)} placeholder="年龄" type="number" className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="城市" className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
            </>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="邮箱地址 *" type="email" className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="密码 * (至少6位)" type="password" className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl">{error}</div>
          )}

          <button type="submit" disabled={loading} className="w-full py-4 rounded-full bg-gradient-to-br from-primary to-primary-light text-white font-bold text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50">
            {loading ? '请稍候...' : mode === 'login' ? '登录' : '创建账号'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-primary font-semibold ml-1">
            {mode === 'login' ? '立即注册' : '去登录'}
          </button>
        </p>

        <p className="text-center text-[10px] text-gray-300 mt-6 uppercase tracking-widest">倾城之恋 v2.4.0</p>
      </div>
    </div>
  );
}
