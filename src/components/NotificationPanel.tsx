import React, { useEffect, useState } from 'react';
import { X, Heart, MessageCircle, Star } from 'lucide-react';
import { apiFetch } from '../lib/api';


interface Notification {
  id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
  related_user?: { id: string; name: string; avatar: string };
}

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/notifications')

      .then(r => r.ok ? r.json() : [])
      .then(data => { setNotifications(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = () => {
    apiFetch('/api/notifications/read-all', { method: 'PUT' })

      .then(() => setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))));
  };

  const iconForType = (type: string) => {
    if (type === 'like') return <Heart className="w-4 h-4 text-primary fill-current" />;
    if (type === 'message') return <MessageCircle className="w-4 h-4 text-blue-500" />;
    return <Star className="w-4 h-4 text-yellow-500" />;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-[80]" onClick={onClose}>
      <div className="absolute top-16 right-4 w-[340px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-lg">通知</h3>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary font-semibold">全部已读</button>
            )}
            <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(70vh-70px)]">
          {loading ? (
            <div className="p-8 text-center text-gray-400">加载中...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">暂无通知</div>
          ) : notifications.map(n => (
            <div key={n.id} className={`flex items-start gap-3 p-4 border-b border-gray-50 ${!n.is_read ? 'bg-primary/5' : ''}`}>
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                {n.related_user?.avatar ? (
                  <img src={n.related_user.avatar} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">{iconForType(n.type)}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{n.related_user?.name || ''}</span>{' '}
                  {n.type === 'like' ? '喜欢了你' : n.type === 'message' ? '给你发了消息' : n.content}
                </p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString('zh-CN')}</p>
              </div>
              {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
