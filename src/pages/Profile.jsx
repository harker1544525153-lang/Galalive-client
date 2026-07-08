import { useState, useEffect } from 'react';
import {
  User, Heart, Users, Star, Coins, CreditCard, Settings, LogOut, Camera, Gift,
  Video, ArrowRight, Edit3, Play, Wallet, Award, Scan, Bell, HelpCircle,
  MessageSquare, TrendingUp, Shield, Crown, Share2, ChevronRight,
  Smartphone, Apple, X, Check, Image as ImageIcon, Ticket, Diamond, Banknote,
} from 'lucide-react';
import { authAPI, followAPI, userAPI, certificationAPI } from '../api';

const Profile = ({ user, onLogout, onNavigate, onUpdateUser }) => {
  const [profile, setProfile] = useState(null);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [activeTab, setActiveTab] = useState('replay');
  const [loading, setLoading] = useState(true);
  const [certification, setCertification] = useState(null);
  const [replays, setReplays] = useState([]);
  const [videos, setVideos] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [contribution, setContribution] = useState([]);

  // 弹窗状态
  const [modal, setModal] = useState(null); // edit / recharge / withdraw / verify / account / income
  const [editForm, setEditForm] = useState({});
  const [rechargeForm, setRechargeForm] = useState({ amount: 10, method: 'google' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', alipayAccount: '', alipayName: '' });
  const [verifyForm, setVerifyForm] = useState({ realName: '', idCard: '', frontPhoto: null, backPhoto: null, handPhoto: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Gala Live - 我的';
    loadProfile();
    loadFollowing();
    loadFollowers();
    loadCertification();
    loadReplays();
    loadVideos();
    loadTransactions();
    loadContribution();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authAPI.profile();
      const data = response.data || response;
      setProfile(data);
      if (data.cover) {
        setCoverImage(data.cover);
      }
      setEditForm({
        nickname: data.nickname || '',
        signature: data.signature || '',
        gender: data.gender || 'unknown',
        address: data.address || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async () => {
    try {
      const response = await followAPI.getFollowing();
      const data = response.data || response;
      setFollowing(data || []);
    } catch (error) {
      console.error('Failed to load following:', error);
      setFollowing([]);
    }
  };

  const loadFollowers = async () => {
    try {
      const response = await followAPI.getFollowers();
      const data = response.data || response;
      setFollowers(data || []);
    } catch (error) {
      console.error('Failed to load followers:', error);
      setFollowers([]);
    }
  };

  const loadCertification = async () => {
    try {
      const response = await certificationAPI.getMy();
      const data = response.data || response;
      setCertification(data);
    } catch (error) {
      console.error('Failed to load certification:', error);
      setCertification(null);
    }
  };

  const loadReplays = async () => {
    try {
      const response = await userAPI.getStreams(user?.id || profile?.id);
      const data = response.data || response;
      setReplays(data || []);
    } catch (error) {
      console.error('Failed to load replays:', error);
      setReplays([]);
    }
  };

  const loadVideos = async () => {
    try {
      const response = await userAPI.getVideos(user?.id || profile?.id);
      const data = response.data || response;
      setVideos(data || []);
    } catch (error) {
      console.error('Failed to load videos:', error);
      setVideos([]);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await userAPI.getTransactions(user?.id || profile?.id);
      const data = response.data || response;
      setTransactions(data || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    }
  };

  const loadContribution = async () => {
    try {
      const response = await userAPI.getContribution(user?.id || profile?.id);
      const data = response.data || response;
      setContribution(data || []);
    } catch (error) {
      console.error('Failed to load contribution:', error);
      setContribution([]);
    }
  };

  const handleUpdateProfile = async () => {
    setSubmitting(true);
    try {
      await authAPI.updateProfile(editForm);
      setModal(null);
      loadProfile();
      alert('个人资料更新成功');
    } catch (error) {
      alert(error.response?.data?.error || '更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecharge = async () => {
    setSubmitting(true);
    try {
      const response = await userAPI.recharge({ amount: parseFloat(rechargeForm.amount), method: rechargeForm.method });
      const result = response.data || response;
      setModal(null);
      await loadProfile();
      const updatedUser = { ...user, diamonds: (user.diamonds || 0) + (result.diamonds || 0) };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert(`充值成功！钻石 +${result.diamonds || 0}`);
    } catch (error) {
      alert(error.response?.data?.error || '充值失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawForm.amount || !withdrawForm.alipayAccount || !withdrawForm.alipayName) {
      alert('请填写完整提现信息');
      return;
    }
    setSubmitting(true);
    try {
      await userAPI.withdraw({
        amount: parseInt(withdrawForm.amount),
        alipayAccount: withdrawForm.alipayAccount,
        alipayName: withdrawForm.alipayName,
      });
      setModal(null);
      setWithdrawForm({ amount: '', alipayAccount: '', alipayName: '' });
      loadProfile();
      alert('提现申请已提交');
    } catch (error) {
      alert(error.response?.data?.error || '提现失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyForm.realName || !verifyForm.idCard) {
      alert('请填写真实姓名和身份证号');
      return;
    }
    setSubmitting(true);
    try {
      await certificationAPI.submit({
        real_name: verifyForm.realName,
        id_card: verifyForm.idCard,
        front_photo: verifyForm.frontPhoto,
        back_photo: verifyForm.backPhoto,
        hand_photo: verifyForm.handPhoto,
      });
      setModal(null);
      loadProfile();
      loadCertification();
      alert('实名认证已提交，等待审核');
    } catch (error) {
      alert(error.response?.data?.error || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (profile && profile.is_host !== user.is_host) {
      const updatedUser = { ...user, is_host: profile.is_host };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
    }
  }, [profile?.is_host]);

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (onLogout) onLogout();
      if (onNavigate) onNavigate('login');
    }
  };

  const handleShareVideo = (video) => {
    if (navigator.share) {
      navigator.share({ title: video.title, text: `来看看这个视频: ${video.title}` }).catch(() => {});
    } else {
      alert(`分享视频: ${video.title}`);
    }
  };

  const handleCoverUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      if (e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          setCoverImage(event.target.result);
        };
        reader.readAsDataURL(file);

        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const result = await response.json();
          if (result.url) {
            await authAPI.updateProfile({ cover: result.url });
          }
        } catch (error) {
          console.error('Upload cover failed:', error);
        }
      }
    };
    input.click();
  };

  const DEFAULT_COVER_IMAGE = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=purple%20pink%20gradient%20abstract%20cover%20dark&image_size=landscape_16_9';
  const [coverImage, setCoverImage] = useState(DEFAULT_COVER_IMAGE);
  const [coverImageLoaded, setCoverImageLoaded] = useState(false);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  const stats = [
    { label: '粉丝', value: followers.length || profile.fans_count || 0, key: 'followers' },
    { label: '关注', value: following.length || profile.follow_count || 0, key: 'following' },
    { label: '获赞', value: profile.like_count || 0, key: 'likes' },
    { label: '映票', value: profile.tickets || 0, key: 'tickets' },
  ];

  const tabs = [
    { key: 'replay', label: '回播', count: replays.length },
    { key: 'video', label: '小视频', count: videos.length },
    { key: 'following', label: '关注', count: following.length },
    { key: 'followers', label: '粉丝', count: followers.length },
  ];

  const functionEntries = [
    { icon: Wallet, label: '账户', desc: '余额与流水', color: 'from-blue-500 to-cyan-500', onClick: () => setModal('account') },
    { icon: CreditCard, label: '充值', desc: '购买钻石', color: 'from-purple-500 to-pink-500', onClick: () => setModal('recharge') },
    { icon: Banknote, label: '收益', desc: '提现与兑换', color: 'from-green-500 to-emerald-500', onClick: () => setModal('income') },
    { icon: Shield, label: '实名认证', desc: certification?.status === 'approved' ? '已通过' : certification?.status === 'pending' ? '审核中' : certification?.status === 'rejected' ? '已拒绝' : '身份认证', color: certification?.status === 'approved' ? 'from-green-500 to-emerald-500' : certification?.status === 'pending' ? 'from-yellow-500 to-amber-500' : 'from-orange-500 to-red-500', onClick: () => setModal('verify') },
    { icon: Crown, label: '贡献榜', desc: '收益贡献榜', color: 'from-yellow-500 to-amber-500', onClick: () => setModal('ranking') },
    { icon: Settings, label: '设置', desc: '应用设置', color: 'from-gray-500 to-slate-500', onClick: () => onNavigate('settings') },
  ];

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-white">我的</h1>
          <button
            onClick={() => onNavigate('settings')}
            className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* 封面图 + 头像 + 基本信息 */}
        <div className="relative">
        <div className="h-40 sm:h-48 w-full overflow-hidden relative cursor-pointer group" onClick={handleCoverUpload}>
          <div className="w-full h-full bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-indigo-900/50">
            <img 
              src={coverImage} 
              alt="cover" 
              className={`w-full h-full object-cover transition-opacity duration-500 ${coverImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setCoverImageLoaded(true)}
              onError={() => setCoverImageLoaded(false)}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/30 to-gray-900" />
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

          <div className="px-4 -mt-16 relative z-10">
            <div className="flex items-end gap-4">
              {/* 头像 */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-1 shadow-xl shadow-pink-500/30">
                  <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-14 h-14 text-gray-400" />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setModal('edit')}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-pink-500/40 border-2 border-gray-900"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* 昵称 + ID */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-white">{profile.nickname}</h2>
                  {profile.is_host && (
                    <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      认证主播
                    </span>
                  )}
                  <button
                    onClick={() => setModal('edit')}
                    className="w-7 h-7 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-300 hover:text-pink-500 hover:bg-gray-700 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Scan className="w-3.5 h-3.5" /> ID: {profile.id}
                  </span>
                  <span className="flex items-center gap-1">
                    {profile.gender === 'male' ? '♂ 男' : profile.gender === 'female' ? '♀ 女' : '⚥ 未知'}
                  </span>
                </div>
              </div>
            </div>

            {/* 签名 */}
            <p className="text-gray-300 mt-3 text-sm">{profile.signature || '暂无签名，快来添加吧~'}</p>

            {/* 等级徽章 */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 px-3 py-1.5 rounded-full">
                <Award className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-xs font-bold">用户等级 Lv.{profile.level || 1}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 px-3 py-1.5 rounded-full">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-bold">主播等级 Lv.{profile.host_level || 0}</span>
              </div>
            </div>

            {/* 数据统计条 */}
            <div className="grid grid-cols-4 gap-2 mt-4 bg-gray-800/40 backdrop-blur rounded-2xl p-3 border border-gray-700/30">
              {stats.map((s) => (
                <button
                  key={s.key}
                  onClick={() => s.key === 'following' ? setActiveTab('following') : s.key === 'followers' ? setActiveTab('followers') : null}
                  className="text-center p-2 rounded-xl hover:bg-gray-700/50 transition-all"
                >
                  <p className="text-xl font-bold text-white">{s.value.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 余额卡片 */}
        <div className="px-4 mt-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/10 backdrop-blur rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Diamond className="w-5 h-5 text-purple-300" />
                </div>
                <span className="text-gray-300 text-sm">钻石余额</span>
              </div>
              <p className="text-2xl font-bold text-white mb-3">{(profile.diamonds || 0).toLocaleString()}</p>
              <button
                onClick={() => setModal('recharge')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-purple-500/30"
              >
                充值
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-emerald-500/10 backdrop-blur rounded-2xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-green-300" />
                </div>
                <span className="text-gray-300 text-sm">直播收益</span>
              </div>
              <p className="text-2xl font-bold text-white mb-3">{(profile.coins || 0).toLocaleString()}</p>
              <button
                onClick={() => setModal('withdraw')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-green-500/30"
              >
                提现
              </button>
            </div>
          </div>
        </div>

        {/* 功能入口网格 */}
        <div className="px-4 mt-5">
          <div className="bg-gray-800/40 backdrop-blur rounded-2xl p-4 border border-gray-700/30">
            <div className="grid grid-cols-3 gap-3">
              {functionEntries.map((entry, idx) => (
                <button
                  key={idx}
                  onClick={entry.onClick}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-700/40 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${entry.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <entry.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-bold">{entry.label}</p>
                    <p className="text-gray-500 text-xs">{entry.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="px-4 mt-5">
          <div className="bg-gray-800/40 backdrop-blur rounded-2xl overflow-hidden border border-gray-700/30">
            <div className="flex border-b border-gray-700/50 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 min-w-fit py-3.5 px-3 text-sm font-bold transition-all relative whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-pink-500/30 text-pink-300' : 'bg-gray-700/50 text-gray-400'}`}>
                      {tab.count}
                    </span>
                  </span>
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* 回播 */}
            {activeTab === 'replay' && (
              <div className="p-4 space-y-3">
                {replays.map((replay) => (
                  <div key={replay.id} className="flex gap-3 bg-gray-700/30 rounded-xl p-3 hover:bg-gray-700/50 transition-all cursor-pointer">
                    <div className="relative w-36 h-20 flex-shrink-0">
                      <img src={replay.cover || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=live%20stream%20cover&image_size=landscape_16_9'} alt="" className="w-full h-full object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-white font-bold text-sm mb-1">{replay.title}</p>
                      <p className="text-gray-400 text-xs">{(replay.viewers_count || 0).toLocaleString()}次观看 · {(replay.created_at || '').substring(0, 10)}</p>
                    </div>
                  </div>
                ))}
                {replays.length === 0 && (
                  <EmptyState icon={Video} text="暂无回播" />
                )}
              </div>
            )}

            {/* 小视频 */}
            {activeTab === 'video' && (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {videos.map((video) => (
                    <div key={video.id} className="bg-gray-700/30 rounded-xl overflow-hidden hover:bg-gray-700/50 transition-all">
                      <div className="relative aspect-[9/16]">
                        <img src={video.cover || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=short%20video%20cover&image_size=portrait_9_16'} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                            <Play className="w-6 h-6 text-white ml-0.5" />
                          </div>
                        </div>
                        <button
                          onClick={() => handleShareVideo(video)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60 transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-2.5">
                        <p className="text-white text-xs font-bold truncate">{video.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span className="text-gray-400 text-xs">{video.likes || 0}</span>
                          <span className="text-gray-600 text-xs">·</span>
                          <span className="text-gray-400 text-xs">{(video.created_at || '').substring(0, 10)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {videos.length === 0 && (
                  <EmptyState icon={Video} text="暂无小视频" />
                )}
              </div>
            )}

            {/* 关注 */}
            {activeTab === 'following' && (
              <div className="p-4 space-y-3">
                {following.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                        {f.avatar ? <img src={f.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{f.nickname}</p>
                      <p className="text-gray-500 text-xs">@{f.username}</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-700 text-gray-400 hover:bg-gray-600 transition-all">
                      已关注
                    </button>
                  </div>
                ))}
                {following.length === 0 && <EmptyState icon={Users} text="暂无关注" />}
              </div>
            )}

            {/* 粉丝 */}
            {activeTab === 'followers' && (
              <div className="p-4 space-y-3">
                {followers.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                        {f.avatar ? <img src={f.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{f.nickname}</p>
                      <p className="text-gray-500 text-xs">@{f.username}</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 transition-all shadow-lg shadow-pink-500/30">
                      + 关注
                    </button>
                  </div>
                ))}
                {followers.length === 0 && <EmptyState icon={Users} text="暂无粉丝" />}
              </div>
            )}
          </div>
        </div>

        {/* 快捷入口 */}
        <div className="px-4 mt-5">
          <div className="bg-gray-800/40 backdrop-blur rounded-2xl overflow-hidden border border-gray-700/30">
            <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">更多服务</h3>
            </div>
            <div className="divide-y divide-gray-700/30">
              {[
                { icon: Gift, label: '送出礼物', desc: `共送出 ${profile.gift_count || 0} 个礼物`, onClick: () => onNavigate('gifthistory') },
                { icon: Video, label: '我的直播', desc: '前往开播', onClick: () => onNavigate('broadcast') },
                { icon: Ticket, label: '直播间收益记录', desc: '付费与收费记录', onClick: () => setModal('income') },
                { icon: Share2, label: '分享收益', desc: '邀请好友赚取收益', onClick: () => onNavigate('shareprofit') },
                { icon: MessageSquare, label: '私信', desc: '查看私信消息', onClick: () => onNavigate('message') },
                { icon: Bell, label: '消息通知', desc: '互动与系统通知', onClick: () => onNavigate('notifications') },
                { icon: HelpCircle, label: '帮助中心', desc: '常见问题与反馈', onClick: () => onNavigate('help') },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-700/40 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-700/50 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{item.label}</p>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 退出登录 */}
        <div className="px-4 mt-5">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 py-3.5 rounded-xl font-bold hover:from-red-500/30 hover:to-pink-500/30 transition-all border border-red-500/20 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>
      </main>

      {/* ============ 弹窗：编辑资料 ============ */}
      {modal === 'edit' && (
        <Modal title="编辑资料" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-1">
                  <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                    {editForm.avatar ? (
                      <img src={editForm.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-gray-900">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>

            <Field label="昵称">
              <input
                type="text"
                value={editForm.nickname}
                onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                className="input-field"
                placeholder="请输入昵称"
              />
            </Field>

            <Field label="签名">
              <textarea
                value={editForm.signature}
                onChange={(e) => setEditForm({ ...editForm, signature: e.target.value })}
                className="input-field resize-none"
                rows={2}
                placeholder="介绍一下自己吧~"
              />
            </Field>

            <Field label="性别">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'male', label: '男' },
                  { key: 'female', label: '女' },
                  { key: 'unknown', label: '保密' },
                ].map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setEditForm({ ...editForm, gender: g.key })}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                      editForm.gender === g.key
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="地区">
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="input-field"
                placeholder="请输入所在地区"
              />
            </Field>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50"
              >
                {submitting ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============ 弹窗：充值 ============ */}
      {modal === 'recharge' && (
        <Modal title="充值钻石" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-4 flex items-center justify-between border border-purple-500/20">
              <div className="flex items-center gap-2">
                <Diamond className="w-6 h-6 text-purple-300" />
                <span className="text-gray-300 text-sm">当前钻石</span>
              </div>
              <span className="text-2xl font-bold text-white">{(profile.diamonds || 0).toLocaleString()}</span>
            </div>

            <Field label="选择金额">
              <div className="grid grid-cols-3 gap-2">
                {[10, 30, 50, 100, 300, 500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setRechargeForm({ ...rechargeForm, amount: amt })}
                    className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                      rechargeForm.amount === amt
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-lg shadow-pink-500/30'
                        : 'bg-gray-700/50 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    ${amt}
                    <div className="text-xs opacity-70 mt-0.5">{(amt * 10).toLocaleString()}钻</div>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="支付方式">
              <div className="space-y-2">
                <button
                  onClick={() => setRechargeForm({ ...rechargeForm, method: 'google' })}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    rechargeForm.method === 'google'
                      ? 'bg-purple-500/20 border-purple-500'
                      : 'bg-gray-700/50 border-gray-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  <div className="flex-1 text-left">
                    <p className="text-white text-sm font-bold">Google Pay</p>
                    <p className="text-gray-500 text-xs">Android 设备</p>
                  </div>
                  {rechargeForm.method === 'google' && <Check className="w-5 h-5 text-purple-400" />}
                </button>
                <button
                  onClick={() => setRechargeForm({ ...rechargeForm, method: 'apple' })}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    rechargeForm.method === 'apple'
                      ? 'bg-pink-500/20 border-pink-500'
                      : 'bg-gray-700/50 border-gray-700'
                  }`}
                >
                  <Apple className="w-5 h-5 text-pink-400" />
                  <div className="flex-1 text-left">
                    <p className="text-white text-sm font-bold">Apple Pay</p>
                    <p className="text-gray-500 text-xs">iOS 设备</p>
                  </div>
                  {rechargeForm.method === 'apple' && <Check className="w-5 h-5 text-pink-400" />}
                </button>
              </div>
            </Field>

            <div className="bg-gray-700/30 rounded-xl p-3 flex items-center justify-between">
              <span className="text-gray-400 text-sm">支付金额</span>
              <span className="text-xl font-bold text-yellow-400">${rechargeForm.amount}</span>
            </div>

            <button
              onClick={handleRecharge}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50"
            >
              {submitting ? '支付中...' : `立即支付 $${rechargeForm.amount}`}
            </button>
          </div>
        </Modal>
      )}

      {/* ============ 弹窗：提现 ============ */}
      {modal === 'withdraw' && (
        <Modal title="收益提现" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-4 flex items-center justify-between border border-green-500/20">
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-green-300" />
                <span className="text-gray-300 text-sm">可提现收益</span>
              </div>
              <span className="text-2xl font-bold text-white">{(profile.coins || 0).toLocaleString()}</span>
            </div>

            <Field label="提现金额">
              <input
                type="number"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                className="input-field"
                placeholder="请输入提现金额"
              />
              <p className="text-gray-500 text-xs mt-1">最低提现 100 金币，1 金币 = $0.01</p>
            </Field>

            <Field label="支付宝账号">
              <input
                type="text"
                value={withdrawForm.alipayAccount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, alipayAccount: e.target.value })}
                className="input-field"
                placeholder="请输入支付宝账号（手机号或邮箱）"
              />
            </Field>

            <Field label="真实姓名">
              <input
                type="text"
                value={withdrawForm.alipayName}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, alipayName: e.target.value })}
                className="input-field"
                placeholder="请输入支付宝实名姓名"
              />
            </Field>

            <button
              onClick={handleWithdraw}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50"
            >
              {submitting ? '提交中...' : '提交提现申请'}
            </button>
            <p className="text-gray-500 text-xs text-center">提现申请将在 1-3 个工作日内到账</p>
          </div>
        </Modal>
      )}

      {/* ============ 弹窗：实名认证 ============ */}
      {modal === 'verify' && (
        <Modal title="实名认证" onClose={() => setModal(null)}>
          <div className="space-y-4">
            {certification?.status === 'approved' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">实名认证已通过</h3>
                <p className="text-gray-400 text-sm">您已完成实名认证，可享受直播、提现等功能</p>
              </div>
            ) : certification?.status === 'pending' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">实名认证审核中</h3>
                <p className="text-gray-400 text-sm">请耐心等待审核结果</p>
              </div>
            ) : certification?.status === 'rejected' ? (
              <>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-xs">实名认证未通过，原因：{certification.remark || '信息不符合要求'}</p>
                    <p className="text-gray-500 text-xs mt-1">请重新提交认证信息</p>
                  </div>
                </div>
                <Field label="真实姓名">
                  <input
                    type="text"
                    value={verifyForm.realName}
                    onChange={(e) => setVerifyForm({ ...verifyForm, realName: e.target.value })}
                    className="input-field"
                    placeholder="请输入真实姓名"
                  />
                </Field>
                <Field label="身份证号">
                  <input
                    type="text"
                    value={verifyForm.idCard}
                    onChange={(e) => setVerifyForm({ ...verifyForm, idCard: e.target.value })}
                    className="input-field"
                    placeholder="请输入18位身份证号"
                    maxLength={18}
                  />
                </Field>
                <Field label="身份证正面照">
                  <UploadBox
                    photo={verifyForm.frontPhoto}
                    onChange={(file) => setVerifyForm({ ...verifyForm, frontPhoto: file })}
                  />
                </Field>
                <Field label="身份证反面照">
                  <UploadBox
                    photo={verifyForm.backPhoto}
                    onChange={(file) => setVerifyForm({ ...verifyForm, backPhoto: file })}
                  />
                </Field>
                <Field label="手持身份证照">
                  <UploadBox
                    photo={verifyForm.handPhoto}
                    onChange={(file) => setVerifyForm({ ...verifyForm, handPhoto: file })}
                  />
                </Field>
                <button
                  onClick={handleVerify}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50"
                >
                  {submitting ? '提交中...' : '重新提交认证'}
                </button>
              </>
            ) : (
              <>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-xs">实名认证后可享受直播、提现等功能，信息仅用于身份验证，请如实填写。</p>
                </div>
                <Field label="真实姓名">
                  <input
                    type="text"
                    value={verifyForm.realName}
                    onChange={(e) => setVerifyForm({ ...verifyForm, realName: e.target.value })}
                    className="input-field"
                    placeholder="请输入真实姓名"
                  />
                </Field>
                <Field label="身份证号">
                  <input
                    type="text"
                    value={verifyForm.idCard}
                    onChange={(e) => setVerifyForm({ ...verifyForm, idCard: e.target.value })}
                    className="input-field"
                    placeholder="请输入18位身份证号"
                    maxLength={18}
                  />
                </Field>
                <Field label="身份证正面照">
                  <UploadBox
                    photo={verifyForm.frontPhoto}
                    onChange={(file) => setVerifyForm({ ...verifyForm, frontPhoto: file })}
                  />
                </Field>
                <Field label="身份证反面照">
                  <UploadBox
                    photo={verifyForm.backPhoto}
                    onChange={(file) => setVerifyForm({ ...verifyForm, backPhoto: file })}
                  />
                </Field>
                <Field label="手持身份证照">
                  <UploadBox
                    photo={verifyForm.handPhoto}
                    onChange={(file) => setVerifyForm({ ...verifyForm, handPhoto: file })}
                  />
                </Field>
                <button
                  onClick={handleVerify}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50"
                >
                  {submitting ? '提交中...' : '提交认证'}
                </button>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ============ 弹窗：账户 ============ */}
      {modal === 'account' && (
        <Modal title="我的账户" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-2xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Diamond className="w-4 h-4 text-purple-300" />
                  <span className="text-gray-400 text-xs">钻石余额</span>
                </div>
                <p className="text-xl font-bold text-white">{(profile.diamonds || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-green-300" />
                  <span className="text-gray-400 text-xs">金币余额</span>
                </div>
                <p className="text-xl font-bold text-white">{(profile.coins || 0).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-2">账户流水</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map((trans) => {
                  const isRecharge = trans.type === 'recharge';
                  const isIncome = trans.type === 'income' || trans.type === 'gift';
                  const isWithdraw = trans.type === 'withdraw';
                  return (
                    <div key={trans.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isRecharge ? 'bg-green-500/20' :
                          isIncome && !isRecharge ? 'bg-blue-500/20' :
                          trans.type === 'gift' && trans.user_id === profile?.id ? 'bg-pink-500/20' : 'bg-orange-500/20'
                        }`}>
                          {isRecharge && <CreditCard className="w-4 h-4 text-green-500" />}
                          {isIncome && !isRecharge && trans.user_id !== profile?.id && <TrendingUp className="w-4 h-4 text-blue-500" />}
                          {trans.type === 'gift' && <Gift className="w-4 h-4 text-pink-500" />}
                          {isWithdraw && <Wallet className="w-4 h-4 text-orange-500" />}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{trans.description || (trans.type === 'recharge' ? '充值' : trans.type === 'withdraw' ? '提现' : '交易')}</p>
                          <p className="text-gray-500 text-xs">{(trans.created_at || '').substring(0, 16).replace('T', ' ')}</p>
                        </div>
                      </div>
                      <p className={`font-bold text-sm ${isRecharge || (isIncome && trans.user_id !== profile?.id) ? 'text-green-500' : 'text-red-500'}`}>
                        {isRecharge || (isIncome && trans.user_id !== profile?.id) ? '+' : ''}{trans.amount || 0}
                      </p>
                    </div>
                  );
                })}
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">暂无交易记录</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModal('recharge')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
              >
                充值
              </button>
              <button
                onClick={() => setModal('withdraw')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
              >
                提现
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============ 弹窗：收益 ============ */}
      {modal === 'income' && (
        <Modal title="直播收益" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-green-300" />
                  <span className="text-gray-300 text-sm">直播收益</span>
                </div>
                <span className="text-2xl font-bold text-white">{(profile.coins || 0).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setModal('withdraw'); }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                >
                  提现
                </button>
                <button
                  onClick={() => { alert('已兑换为钻石'); loadProfile(); }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                >
                  兑换钻石
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-2">收益领取记录</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.filter(t => t.type === 'income' || t.type === 'withdraw').map((trans) => (
                  <div key={trans.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        trans.type === 'income' ? 'bg-blue-500/20' : 'bg-orange-500/20'
                      }`}>
                        {trans.type === 'income' ? <TrendingUp className="w-4 h-4 text-blue-500" /> : <Wallet className="w-4 h-4 text-orange-500" />}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{trans.description || (trans.type === 'income' ? '直播收益' : '提现')}</p>
                        <p className="text-gray-500 text-xs">{(trans.created_at || '').substring(0, 16).replace('T', ' ')}</p>
                      </div>
                    </div>
                    <p className={`font-bold text-sm ${trans.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {trans.type === 'income' ? '+' : '-'}{trans.amount || 0}
                    </p>
                  </div>
                ))}
                {transactions.filter(t => t.type === 'income' || t.type === 'withdraw').length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">暂无收益记录</div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ============ 弹窗：收益贡献榜 ============ */}
      {modal === 'ranking' && (
        <Modal title="收益贡献榜" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/10 rounded-2xl p-3 border border-yellow-500/20 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <p className="text-gray-300 text-xs">直播中收益票贡献排行榜，感谢粉丝们的支持！</p>
            </div>

            {contribution.map((item) => (
              <div
                key={item.user_id || item.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  item.rank <= 3
                    ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20'
                    : 'bg-gray-700/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  item.rank === 1 ? 'bg-yellow-500 text-gray-900' :
                  item.rank === 2 ? 'bg-gray-300 text-gray-900' :
                  item.rank === 3 ? 'bg-orange-700 text-white' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {item.rank}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                    {item.avatar ? <img src={item.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-bold">{item.nickname || item.username}</p>
                  <p className="text-gray-500 text-xs">贡献 {(item.total_amount || item.amount || 0).toLocaleString()} 票</p>
                </div>
                {item.rank <= 3 && <Crown className="w-4 h-4 text-yellow-400" />}
              </div>
            ))}
            {contribution.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">暂无贡献记录</div>
            )}
          </div>
        </Modal>
      )}

      {/* 内联样式 */}
      <style>{`
        .input-field {
          width: 100%;
          background: rgba(31, 41, 55, 0.5);
          border: 1px solid rgba(75, 85, 99, 0.5);
          border-radius: 0.75rem;
          padding: 0.625rem 1rem;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: rgba(236, 72, 153, 0.5);
        }
        .input-field::placeholder {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

// 通用弹窗组件
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full sm:max-w-md bg-gray-800 rounded-t-3xl sm:rounded-3xl border border-gray-700/50 max-h-[90vh] overflow-y-auto pb-safe">
      <div className="sticky top-0 bg-gray-800/95 backdrop-blur px-5 py-4 border-b border-gray-700/50 flex items-center justify-between z-10">
        <h3 className="text-white font-bold text-lg">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

// 表单字段组件
const Field = ({ label, children }) => (
  <div>
    <label className="block text-gray-400 text-sm mb-2 font-medium">{label}</label>
    {children}
  </div>
);

// 上传组件
const UploadBox = ({ photo, onChange }) => {
  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      if (e.target.files[0]) {
        const file = e.target.files[0];
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const result = await response.json();
          if (result.url) {
            onChange(result.url);
          } else {
            alert('图片上传失败，请重试');
          }
        } catch (error) {
          console.error('Upload failed:', error);
          alert('图片上传失败，请检查网络连接');
        }
      }
    };
    input.click();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full aspect-[16/10] rounded-xl border-2 border-dashed border-gray-600 hover:border-pink-500 bg-gray-700/20 flex flex-col items-center justify-center gap-2 transition-all overflow-hidden"
    >
      {photo ? (
        <div className="w-full h-full relative">
          <img src={photo.startsWith('http') || photo.startsWith('data:') || photo.startsWith('/') ? photo : URL.createObjectURL(photo)} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
        </div>
      ) : (
        <>
          <ImageIcon className="w-8 h-8 text-gray-500" />
          <span className="text-gray-500 text-xs">点击上传照片</span>
        </>
      )}
    </button>
  );
};

// 空状态组件
const EmptyState = ({ icon: Icon, text }) => (
  <div className="text-center py-12">
    <Icon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
    <p className="text-gray-400">{text}</p>
  </div>
);

export default Profile;
