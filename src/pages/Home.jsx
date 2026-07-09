import { useState, useEffect, useRef } from 'react';
import {
  Search, Flame, Clock, Heart, MessageCircle, User, Sparkles,
  Play, ChevronRight, Eye, X, Coins, ChevronLeft,
} from 'lucide-react';
import { streamAPI, bannerAPI, userAPI, followAPI } from '../api';
import { getUserLevelByLevelNum, loadLevelConfigs } from '../utils/level';

const TABS = [
  { id: 'following', label: '关注', icon: Heart },
  { id: 'hot', label: '热门', icon: Flame },
  { id: 'latest', label: '最新', icon: Clock },
];

const CATEGORY_ICONS = {
  '才艺': '🎤',
  '游戏': '🎮',
  '聊天': '💬',
  '娱乐': '🎭',
  '户外': '🏕️',
  '美食': '🍔',
  '音乐': '🎵',
  '舞蹈': '💃',
};

const DAILY_REWARD_AMOUNT = 100;
const DAILY_REWARD_KEY = 'gala_last_reward_date';
const FALLBACK_COVER = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=live%20stream%20cover%20colorful%20modern&image_size=landscape_16_9';

const Home = ({ user, onNavigate, followingVersion }) => {
  const [streams, setStreams] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeTab, setActiveTab] = useState('hot');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [followingStreams, setFollowingStreams] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardClaiming, setRewardClaiming] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const bannerTimerRef = useRef(null);
  const bannerPausedRef = useRef(false);
  const touchStartXRef = useRef(0);
  const searchTimerRef = useRef(null);

  useEffect(() => {
    document.title = 'Gala Live - 首页';
    loadLevelConfigs();
    loadBanners();
    loadStreams('hot');
    if (user) {
      loadFollowingStreams();
      checkDailyReward();
    }
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'following') {
      loadFollowingStreams();
    } else {
      loadStreams(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'following') {
      console.log('[Home.jsx] loadFollowingStreams triggered - followingVersion:', followingVersion);
      loadFollowingStreams();
    }
  }, [followingVersion, activeTab]);

  // Banner autoplay, pause on hover
  useEffect(() => {
    if (banners.length <= 1) return;
    bannerTimerRef.current = setInterval(() => {
      if (!bannerPausedRef.current) {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }
    }, 4000);
    return () => clearInterval(bannerTimerRef.current);
  }, [banners.length]);

  const checkDailyReward = () => {
    const today = new Date().toDateString();
    const lastReward = localStorage.getItem(DAILY_REWARD_KEY);
    if (lastReward !== today) {
      setShowRewardModal(true);
    }
  };

  const claimReward = () => {
    setRewardClaiming(true);
    setTimeout(() => {
      const today = new Date().toDateString();
      localStorage.setItem(DAILY_REWARD_KEY, today);
      setRewardClaiming(false);
      setRewardClaimed(true);
      setTimeout(() => setShowRewardModal(false), 1500);
    }, 800);
  };

  const loadStreams = async (sort) => {
    setLoading(true);
    try {
      const response = await streamAPI.getStreams({ sort });
      setStreams(response.data || []);
    } catch (error) {
      console.error('Failed to load streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBanners = async () => {
    try {
      const response = await bannerAPI.getBanners();
      setBanners(response.data || []);
    } catch (error) {
      console.error('Failed to load banners:', error);
    }
  };

  const loadFollowingStreams = async () => {
    try {
      const response = await streamAPI.getFollowingStreams();
      setFollowingStreams(response.data || []);
    } catch (error) {
      console.error('Failed to load following streams:', error);
    }
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.trim().length >= 2) {
      searchTimerRef.current = setTimeout(async () => {
        try {
          const response = await userAPI.searchUsers({ keyword: value.trim() });
          setSearchSuggestions(response.data || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Search suggestions failed:', error);
        }
      }, 300);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      setShowSuggestions(false);
      onNavigate('search', { keyword: searchKeyword.trim() });
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    onNavigate('search', { keyword: suggestion.nickname || suggestion.username });
  };

  // Banner controls
  const goToBanner = (index) => {
    if (banners.length === 0) return;
    setCurrentBanner(((index % banners.length) + banners.length) % banners.length);
  };
  const nextBanner = () => goToBanner(currentBanner + 1);
  const prevBanner = () => goToBanner(currentBanner - 1);

  const handleBannerTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleBannerTouchEnd = (e) => {
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextBanner();
      else prevBanner();
    }
  };

  const formatViewers = (count) => {
    if (count >= 10000) return (count / 10000).toFixed(1) + 'w';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count || 0;
  };

  const getCategoryIcon = (category) => CATEGORY_ICONS[category] || '📹';

  const displayStreams = activeTab === 'following' ? followingStreams : streams;

  const renderAvatar = (cover, size = 'w-5 h-5') => {
    if (cover) {
      return (
        <img src={cover} alt="" className="w-full h-full rounded-full object-cover" />
      );
    }
    return (
      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
        <User className={size + ' text-gray-400'} />
      </div>
    );
  };

  const renderStreamCard = (stream) => {
    const isLive = stream.status === 'live';
    return (
      <div
        key={stream.room_id || stream.id}
        onClick={() => isLive && onNavigate('live', { roomId: stream.room_id })}
        className={`group bg-gray-800/50 rounded-2xl overflow-hidden transition-all duration-300 border border-gray-700/30 ${
          isLive 
            ? 'cursor-pointer hover:shadow-xl hover:shadow-pink-500/10 hover:border-pink-500/30 hover:-translate-y-1' 
            : 'opacity-75'
        }`}
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={stream.stream_cover || stream.cover || FALLBACK_COVER}
            alt={stream.title}
            className={`w-full h-full object-cover ${isLive ? 'group-hover:scale-110 transition-transform duration-500' : ''}`}
            onError={(e) => {
              e.target.src = FALLBACK_COVER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {isLive ? (
              <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-lg">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-gray-600/80 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                离线
              </span>
            )}
            {stream.category && (
              <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                {getCategoryIcon(stream.category)} {stream.category}
              </span>
            )}
          </div>

          {isLive && (
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
              <Eye className="w-3.5 h-3.5" />
              {formatViewers(stream.viewers_count)}
            </div>
          )}

          {isLive && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/50 transform scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-6 h-6 text-white ml-1" fill="white" />
              </div>
            </div>
          )}
        </div>

        <div className="p-3.5">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
                {renderAvatar(stream.user_cover || stream.cover, 'w-4 h-4')}
              </div>
              {stream.is_host === 1 && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-[8px]">
                  👑
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{stream.nickname || '主播'}</p>
              <p className="text-gray-500 text-xs truncate">@{stream.username || 'host'}</p>
            </div>
            {stream.level && (
              <span className="text-xs font-medium shrink-0" style={{ color: getUserLevelByLevelNum(stream.level).color }}>Lv.{stream.level}</span>
            )}
          </div>
          <p className="text-gray-300 text-sm line-clamp-2 mb-2.5 min-h-[2.5rem]">
            {stream.title || (isLive ? '精彩直播中...' : '暂无直播')}
          </p>
          {isLive && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {formatViewers(stream.likes_count || 0)}
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {formatViewers(stream.gifts_count || 0)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBanner = () => {
    if (banners.length === 0) return null;
    return (
      <div
        className="relative mb-6 rounded-2xl overflow-hidden shadow-2xl group w-full"
        onMouseEnter={() => {
          bannerPausedRef.current = true;
        }}
        onMouseLeave={() => {
          bannerPausedRef.current = false;
        }}
        onTouchStart={handleBannerTouchStart}
        onTouchEnd={handleBannerTouchEnd}
      >
        <div className="aspect-video relative w-full">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ${
                index === currentBanner
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <img
                src={banner.image_url || banner.image}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={prevBanner}
              aria-label="上一张"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextBanner}
              aria-label="下一张"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToBanner(index)}
                  aria-label={`第 ${index + 1} 张`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentBanner
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/70 w-2'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderTabs = () => (
    <div className="relative flex gap-6 sm:gap-8 mb-5 border-b border-gray-800">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 pb-3 pt-1 font-semibold transition-colors whitespace-nowrap ${
              isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-pink-500' : ''}`} />
            <span>{tab.label}</span>
            {tab.id === 'following' && followingStreams.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                {followingStreams.length}
              </span>
            )}
            <span
              className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-transform duration-300 origin-left ${
                isActive ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </button>
        );
      })}
    </div>
  );

  const renderEmpty = () => (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
        {activeTab === 'following' ? (
          <Heart className="w-10 h-10 text-gray-600" />
        ) : (
          <Sparkles className="w-10 h-10 text-gray-600" />
        )}
      </div>
      <h3 className="text-xl text-gray-300 font-semibold mb-2">
        {activeTab === 'following' ? '暂无关注的主播开播' : '暂无直播'}
      </h3>
      <p className="text-gray-500 mb-6">
        {activeTab === 'following'
          ? '快去发现并关注你喜欢的主播吧'
          : '当前没有主播在直播'}
      </p>
      {activeTab === 'following' && (
        <button
          onClick={() => setActiveTab('hot')}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center gap-2 mx-auto"
        >
          发现热门主播
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse">
          <div className="aspect-video bg-gray-700/50" />
          <div className="p-3.5">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-10 h-10 rounded-full bg-gray-700/50" />
              <div className="flex-1">
                <div className="h-3 bg-gray-700/50 rounded w-2/3 mb-2" />
                <div className="h-2 bg-gray-700/50 rounded w-1/2" />
              </div>
            </div>
            <div className="h-3 bg-gray-700/50 rounded mb-2" />
            <div className="h-3 bg-gray-700/50 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderRewardModal = () => {
    if (!showRewardModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => {
            if (!rewardClaiming && !rewardClaimed) setShowRewardModal(false);
          }}
        />
        <div className="relative w-full max-w-sm bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-pink-500/30 shadow-2xl shadow-pink-500/20 overflow-hidden">
          {/* Floating coins animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${10 + i * 11}%`,
                  bottom: '45%',
                  animation: `coinFloat 2.5s ease-out ${i * 0.18}s infinite`,
                }}
              >
                <Coins className="w-6 h-6 text-yellow-400" />
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (!rewardClaiming && !rewardClaimed) setShowRewardModal(false);
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Coins className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">今日登录奖励</h2>
            <p className="text-gray-400 text-sm mb-6">每天首次登录可领取平台币奖励</p>

            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl py-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-6 h-6 text-yellow-400" />
                <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  +{DAILY_REWARD_AMOUNT}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1">平台币</p>
            </div>

            {rewardClaimed ? (
              <div className="py-3 text-green-400 font-semibold flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                领取成功！
              </div>
            ) : (
              <button
                onClick={claimReward}
                disabled={rewardClaiming}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {rewardClaiming ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    领取中...
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5" />
                    立即领取
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <style>{`
          @keyframes coinFloat {
            0% { transform: translateY(0) scale(0.5); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(-220px) scale(1.2) rotate(360deg); opacity: 0; }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Fixed top navigation */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent hidden sm:block">
                Gala Live
              </h1>
            </div>

            {/* Search bar with suggestions */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
              <div className="relative group">
                <div className="relative flex items-center bg-gray-800/80 border border-gray-700/50 rounded-full px-4 py-2.5 group-focus-within:border-pink-500/50 transition-all">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={handleSearchInput}
                    onFocus={() => {
                      if (searchSuggestions.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="搜索主播或房间..."
                    className="flex-1 bg-transparent ml-3 text-white placeholder-gray-500 focus:outline-none text-sm min-w-0"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchKeyword('');
                        setSearchSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className="text-gray-500 hover:text-white shrink-0"
                      aria-label="清除"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search suggestions dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl z-50">
                  {searchSuggestions.slice(0, 5).map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5 shrink-0">
                        {renderAvatar(suggestion.cover, 'w-4 h-4')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {suggestion.nickname}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          @{suggestion.username}
                        </p>
                      </div>
                      {suggestion.is_host === 1 && (
                        <span className="text-xs text-yellow-400 shrink-0">主播</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Message entry + profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => onNavigate('message')}
                className="relative w-10 h-10 bg-gray-800/80 hover:bg-gray-700/80 rounded-full flex items-center justify-center transition-all group"
                aria-label="私信"
              >
                <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-gray-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 px-2 sm:px-4 py-1.5 rounded-full transition-all border border-pink-500/20"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
                  {renderAvatar(user?.cover, 'w-4 h-4')}
                </div>
                <span className="text-sm text-white font-medium hidden sm:inline">
                  {user?.nickname || '登录'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-5">
        {renderBanner()}
        {renderTabs()}

        {loading
          ? renderLoadingSkeleton()
          : displayStreams.length === 0
          ? (
            <div className="min-h-[300px] w-full">
              {renderEmpty()}
            </div>
          )
          : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayStreams.map((stream) => renderStreamCard(stream))}
            </div>
          )}
      </main>

      {renderRewardModal()}
    </div>
  );
};

export default Home;
