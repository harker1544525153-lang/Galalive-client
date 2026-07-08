import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Heart, Gift, Users, CheckCircle, Clock } from 'lucide-react';
import { userAPI } from '../api';

const Notifications = ({ user, onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Gala Live - 消息通知';
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getNotifications();
      const data = response.data || response;
      const userNotifications = Array.isArray(data) 
        ? data.filter(n => n.user_id === user.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}天前`;
    return dateStr.substring(0, 10);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return Heart;
      case 'gift': return Gift;
      case 'follow': return Users;
      case 'system': return Bell;
      default: return Bell;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'like': return 'text-red-500 bg-red-500/20';
      case 'gift': return 'text-purple-400 bg-purple-500/20';
      case 'follow': return 'text-blue-400 bg-blue-500/20';
      case 'system': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-700/50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 h-16 flex items-center">
        <div className="flex items-center justify-between px-4 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('profile')}
              className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-bold text-white">消息通知</h1>
          </div>
          <button className="text-sm text-blue-400">全部已读</button>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">暂无新通知</p>
            <p className="text-gray-600 text-xs mt-1">有新消息时会在这里通知你</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const iconColor = getIconColor(notification.type);
              return (
                <div key={notification.id} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{notification.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-600" />
                        <span className="text-gray-600 text-xs">{formatDate(notification.created_at)}</span>
                      </div>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
