import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MoreVertical, 
  Trash2, 
  UserPlus, 
  RefreshCcw, 
  ShieldCheck, 
  ShieldAlert,
  Edit,
  LayoutDashboard,
  Settings,
  LogOut,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface User {
  id: string;
  name: string;
  email?: string;
  role: string;
  created_at: string;
  bio?: string;
  age?: number;
  tags?: string[];
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ total: 0, admins: 0, newToday: 0 });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
      const admins = data?.filter(u => u.role === 'admin').length || 0;
      const today = new Date().toISOString().split('T')[0];
      const newToday = data?.filter(u => u.created_at?.startsWith(today)).length || 0;
      setStats({ total: data?.length || 0, admins, newToday });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('确定要删除此用户吗？此操作不可逆。')) return;
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      alert('删除失败: ' + error.message);
    } else {
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>倾城之恋 · 后台</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="仪表盘" active />
          <NavItem icon={<Users className="w-5 h-5" />} label="用户管理" />
          <NavItem icon={<Bell className="w-5 h-5" />} label="消息中心" />
          <NavItem icon={<Settings className="w-5 h-5" />} label="全局设置" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">管理员</p>
              <p className="text-xs text-slate-500 truncate">admin@qingcheng.app</p>
            </div>
            <LogOut className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-bold text-slate-800">仪表盘</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索用户..." 
                className="bg-slate-100 border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<Users className="text-blue-500" />} label="总注册用户" value={stats.total} color="blue" />
            <StatCard icon={<ShieldCheck className="text-emerald-500" />} label="管理员数量" value={stats.admins} color="emerald" />
            <StatCard icon={<UserPlus className="text-primary" />} label="今日新增用户" value={stats.newToday} color="rose" />
          </div>

          {/* User List Table */}
          <div className="card">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">用户管理</h2>
              <button 
                onClick={fetchUsers}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors"
              >
                <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                刷新数据
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-3">用户信息</th>
                    <th className="px-6 py-3">角色</th>
                    <th className="px-6 py-3">注册时间</th>
                    <th className="px-6 py-3">状态</th>
                    <th className="px-6 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                        未找到匹配的用户
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500 font-bold">
                              {user.name?.[0] || '?'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">{user.name}</div>
                              <div className="text-xs text-slate-500">{user.email || '未绑定邮箱'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                            user.role === 'admin' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                          )}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            正常
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-blue-600 transition-all">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-rose-600 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
              共显示 {filteredUsers.length} 位用户
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all font-medium",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20" 
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    )}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10",
    emerald: "bg-emerald-500/10",
    rose: "bg-rose-500/10"
  };
  
  return (
    <div className="card p-6 flex items-center gap-6">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", colors[color])}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-7 h-7" })}
      </div>
      <div>
        <div className="text-sm font-medium text-slate-500 mb-1">{label}</div>
        <div className="text-3xl font-extrabold text-slate-900">{value.toLocaleString()}</div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-3 bg-slate-100 rounded w-32" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-12" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
      <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded w-8 ml-auto" /></td>
    </tr>
  );
}
