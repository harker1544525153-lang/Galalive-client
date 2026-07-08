import { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Users, Coins, Gift, Copy, Check } from 'lucide-react';
import { authAPI } from '../api';

const ShareProfit = ({ user, onNavigate }) => {
  const [shareData, setShareData] = useState({
    referrerCode: '',
    totalReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    referrals: [],
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = 'Gala Live - 分享收益';
    loadShareData();
  }, []);

  const loadShareData = async () => {
    try {
      const response = await authAPI.profile();
      const data = response.data || response;
      setShareData({
        referrerCode: data.referrer_code || `GALA${user.id}`,
        totalReferrals: data.referral_count || 0,
        totalEarnings: data.referral_earnings || 0,
        pendingEarnings: data.pending_referral_earnings || 0,
        referrals: data.referrals || [],
      });
    } catch (error) {
      console.error('Failed to load share data:', error);
      setShareData({
        referrerCode: `GALA${user.id}`,
        totalReferrals: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        referrals: [],
      });
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/register?referrer=${shareData.referrerCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareToFriend = () => {
    const link = `${window.location.origin}/register?referrer=${shareData.referrerCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Gala Live',
        text: '邀请你加入 Gala Live，一起看精彩直播！',
        url: link,
      });
    } else {
      copyLink();
    }
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
          <h1 className="text-lg font-bold text-white">分享收益</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 pb-24">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-2xl p-5 border border-green-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-bold">邀请好友，赚取丰厚奖励</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">邀请好友</p>
              <p className="text-2xl font-bold text-white">{shareData.totalReferrals}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">累计收益</p>
              <p className="text-2xl font-bold text-green-400">{shareData.totalEarnings}</p>
            </div>
          </div>

          <div className="mt-4 bg-gray-800/50 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">待结算收益</span>
              <span className="text-yellow-400 font-bold">{shareData.pendingEarnings}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
          <h2 className="text-sm font-bold text-white mb-3">邀请码</h2>
          <div className="flex items-center gap-3 bg-gray-900 rounded-xl px-4 py-3">
            <span className="text-green-400 font-mono text-lg font-bold">{shareData.referrerCode}</span>
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-xl transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="text-sm font-medium">{copied ? '已复制' : '复制'}</span>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={shareToFriend}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/30"
          >
            <Share2 className="w-5 h-5" />
            <span>分享给好友</span>
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold text-white mb-3">奖励规则</h2>
          <div className="space-y-3">
            {[
              { icon: Users, title: '好友注册奖励', desc: '每邀请1位好友注册，奖励10钻石' },
              { icon: Gift, title: '好友首充奖励', desc: '好友首次充值，额外奖励充值金额的10%' },
              { icon: Coins, title: '好友消费奖励', desc: '好友消费钻石，奖励消费金额的5%' },
            ].map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                <div className="w-10 h-10 rounded-xl bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                  <rule.icon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{rule.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {shareData.referrals.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-bold text-white mb-3">邀请列表</h2>
            <div className="space-y-2">
              {shareData.referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between bg-gray-800/40 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white text-sm">{ref.nickname || ref.username}</span>
                  </div>
                  <span className="text-green-400 text-sm font-medium">+{(ref.earnings || 0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareProfit;
