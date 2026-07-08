import { useState, useEffect } from 'react';
import { ArrowLeft, Gift, User, Calendar } from 'lucide-react';
import { userAPI } from '../api';

const GiftHistory = ({ user, onNavigate }) => {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Gala Live - 送出礼物';
    loadGiftHistory();
  }, []);

  const loadGiftHistory = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getTransactions(user.id);
      const data = response.data || response;
      const userGifts = Array.isArray(data) 
        ? data.filter(g => g.type === 'gift').sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setGifts(userGifts);
    } catch (error) {
      console.error('Failed to load gift history:', error);
      setGifts([]);
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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 h-16 flex items-center">
        <div className="flex items-center gap-3 px-4">
          <button
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">送出礼物</h1>
        </div>
      </div>

      <div className="flex-1 px-4 pt-24 pb-24">
        <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/10 rounded-2xl p-4 border border-pink-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs mb-1">累计送出礼物</p>
              <p className="text-2xl font-bold text-white">{gifts.length}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">累计消费钻石</p>
              <p className="text-2xl font-bold text-purple-400">
                {gifts.reduce((sum, g) => sum + (g.amount || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">送礼记录</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : gifts.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">暂无送礼记录</p>
              <p className="text-gray-600 text-xs mt-1">去直播间给喜欢的主播送礼物吧~</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gifts.map((gift) => (
                <div key={gift.id} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                      <span className="text-lg">🎁</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{gift.description || '礼物'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-3 h-3 text-gray-600" />
                        <span className="text-gray-500 text-xs">{gift.related_type === 'video' ? '视频作者' : '主播'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-400 text-sm font-bold">-{(gift.amount || 0)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-gray-600" />
                        <span className="text-gray-600 text-xs">{formatDate(gift.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftHistory;
