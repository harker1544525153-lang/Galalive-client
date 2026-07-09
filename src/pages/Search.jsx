import { useState, useEffect, useRef } from 'react';
import {
  Search as SearchIcon, ArrowLeft, User, Video, MessageSquare,
  Sparkles, X, Play, Eye, Flame, ChevronRight, Star,
} from 'lucide-react';
import { userAPI, streamAPI } from '../api';

const HOT_KEYWORDS = [
  { text: '才艺主播', hot: 9821 },
  { text: '游戏直播', hot: 8234 },
  { text: '户外探险', hot: 6532 },
  { text: '美食直播', hot: 5421 },
  { text: '唱歌跳舞', hot: 4982 },
  { text: '王者荣耀', hot: 4321 },
  { text: '英雄联盟', hot: 3876 },
  { text: '脱口秀', hot: 3214 },
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

const TABS = [
  { id: 'all', label: '全部' },
  { id: 'user', label: '用户' },
  { id: 'stream', label: '直播' },
];

const FALLBACK_COVER = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=live%20stream%20colorful%20stage%20modern&image_size=landscape_16_9';

const Search = ({ user, keyword, onNavigate }) => {
  const [searchKeyword, setSearchKeyword] = useState(keyword || '');
  const [users, setUsers] = useState([]);
  const [streams, setStreams] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [followedIds, setFollowedIds] = useState(new Set());
  const inputRef = useRef(null);

  useEffect(() => {
    document.title = 'Gala Live - 搜索';
    if (keyword) {
      doSearch(keyword);
    }
  }, [keyword]);

  useEffect(() => {
    setSearchKeyword(keyword || '');
  }, [keyword]);

  const doSearch = async (kw) => {
    const query = (kw ?? searchKeyword).trim();
    if (!query) return;
    setLoading(true);
    setSearched(true);
    try {
      const [userRes, streamRes] = await Promise.all([
        userAPI.searchUsers({ keyword: query }).catch(() => ({ data: [] })),
        streamAPI.getStreams({ keyword: query }).catch(() => ({ data: [] })),
      ]);
      setUsers(userRes.data || []);
      setStreams(streamRes.data || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    doSearch(searchKeyword);
  };

  const handleClear = () => {
    setSearchKeyword('');
    setUsers([]);
    setStreams([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const handleHotKeyword = (kw) => {
    setSearchKeyword(kw);
    doSearch(kw);
  };

  const handleFollow = (userId) => {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleMessage = (userId) => {
    if (onNavigate) onNavigate('pm', { userId });
  };

  const handleEnterLive = (roomId) => {
    if (onNavigate) onNavigate('live', { roomId });
  };

  const handleUserClick = (u) => {
    if (onNavigate) onNavigate('profile', { userId: u.id });
  };

  const getCategoryIcon = (category) => CATEGORY_ICONS[category] || '📹';

  const formatViewers = (count) => {
    if (count >= 10000) return (count / 10000).toFixed(1) + 'w';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count || 0;
  };

  const renderAvatar = (cover, size = 'w-6 h-6') => {
    if (cover) {
      return <img src={cover} alt="" className="w-full h-full rounded-full object-cover" />;
    }
    return (
      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
        <User className={size + ' text-gray-400'} />
      </div>
    );
  };

  const getGenderDisplay = (gender) => {
    if (gender === 'male') return { symbol: '♂', color: 'text-blue-400', bg: 'bg-blue-500/15' };
    if (gender === 'female') return { symbol: '♀', color: 'text-pink-400', bg: 'bg-pink-500/15' };
    return null;
  };

  const filteredUsers = activeTab === 'all' || activeTab === 'user' ? users : [];
  const filteredStreams = activeTab === 'all' || activeTab === 'stream' ? streams : [];

  const renderUserCard = (u) => {
    const gender = getGenderDisplay(u.gender);
    const isFollowed = followedIds.has(u.id);
    const isLiving = u.is_living === 1 || u.is_living === true || u.room_id;

    return (
      <div
        key={u.id}
        className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700/30 hover:border-pink-500/30 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          {/* 头像 */}
          <div
            onClick={() => handleUserClick(u)}
            className="relative shrink-0 cursor-pointer"
          >
            <div className={`w-14 h-14 rounded-full p-0.5 ${
              isLiving
                ? 'bg-gradient-to-br from-red-500 via-pink-500 to-purple-600'
                : 'bg-gradient-to-br from-pink-500 to-purple-600'
            }`}>
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                {renderAvatar(u.cover, 'w-7 h-7')}
              </div>
            </div>
            {isLiving && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap border border-gray-900 flex items-center gap-0.5">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
            )}
          </div>

          {/* 用户信息 */}
          <div
            onClick={() => handleUserClick(u)}
            className="flex-1 min-w-0 cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-bold truncate">{u.nickname}</p>
              {gender && (
                <span className={`text-[10px] ${gender.color} ${gender.bg} px-1.5 py-0.5 rounded-full`}>
                  {gender.symbol}
                </span>
              )}
              {u.is_host === 1 && (
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5" />
                  主播
                </span>
              )}
              {u.level && (
                <span className="text-[10px] text-pink-400 font-medium">Lv.{u.level}</span>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-1 truncate">
              @{u.username}
              {u.signature && <span className="ml-2 hidden sm:inline">· {u.signature}</span>}
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleFollow(u.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isFollowed
                  ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/30'
              }`}
            >
              {isFollowed ? '已关注' : '+ 关注'}
            </button>
            <button
              onClick={() => handleMessage(u.id)}
              className="w-9 h-9 flex items-center justify-center bg-gray-700/60 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-all"
              aria-label="私信"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 直播中提示条 */}
        {isLiving && (
          <div className="mt-3 flex items-center justify-between bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold shrink-0">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                正在直播中
              </span>
              {u.stream_title && (
                <span className="text-gray-400 text-xs truncate">{u.stream_title}</span>
              )}
            </div>
            <button
              onClick={() => handleEnterLive(u.room_id)}
              className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:shadow-lg hover:shadow-red-500/30 transition-all shrink-0"
            >
              <Play className="w-3 h-3" fill="white" />
              进入直播间
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderStreamCard = (stream) => (
    <div
      key={stream.room_id || stream.id}
      onClick={() => handleEnterLive(stream.room_id || stream.id)}
      className="group bg-gray-800/50 backdrop-blur rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 border border-gray-700/30 hover:border-pink-500/30 hover:-translate-y-1"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={stream.cover || FALLBACK_COVER}
          alt={stream.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = FALLBACK_COVER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
          {stream.category && (
            <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              {getCategoryIcon(stream.category)} {stream.category}
            </span>
          )}
        </div>

        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
          <Eye className="w-3.5 h-3.5" />
          {formatViewers(stream.viewers_count)}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/50 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 text-white ml-1" fill="white" />
          </div>
        </div>
      </div>

      <div className="p-3.5">
        <p className="text-white font-bold text-sm mb-2 line-clamp-1">{stream.title}</p>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5 shrink-0">
            {renderAvatar(stream.cover, 'w-4 h-4')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{stream.nickname}</p>
            <p className="text-gray-500 text-[10px] truncate">@{stream.username}</p>
          </div>
          {stream.level && (
            <span className="text-[10px] text-pink-400 font-medium shrink-0">Lv.{stream.level}</span>
          )}
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-2xl" />
        <div className="relative w-24 h-24 bg-gray-800/60 rounded-full flex items-center justify-center border border-gray-700/50">
          <SearchIcon className="w-10 h-10 text-gray-600" />
        </div>
      </div>
      <h3 className="text-xl text-gray-300 font-bold mb-2">未找到相关结果</h3>
      <p className="text-gray-500 mb-6">换个关键词试试，或浏览热门搜索</p>
      <button
        onClick={handleClear}
        className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-pink-500/30 transition-all inline-flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        查看热门推荐
      </button>
    </div>
  );

  const renderLoading = () => (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-800/50 rounded-2xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-700/50" />
            <div className="flex-1">
              <div className="h-4 bg-gray-700/50 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-700/50 rounded w-1/2" />
            </div>
            <div className="h-8 w-16 bg-gray-700/50 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-8">
      {/* 热门搜索 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-white font-bold">热门搜索</h3>
          <Sparkles className="w-4 h-4 text-yellow-400 ml-1" />
        </div>
        <div className="flex flex-wrap gap-2.5">
          {HOT_KEYWORDS.map((kw, idx) => (
            <button
              key={kw.text}
              onClick={() => handleHotKeyword(kw.text)}
              className="group flex items-center gap-2 bg-gray-800/50 text-gray-300 pl-3 pr-4 py-2.5 rounded-full text-sm font-medium hover:bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:text-white transition-all border border-gray-700/40 hover:border-pink-500/30"
            >
              <span className={`text-xs font-bold ${idx < 3 ? 'text-orange-400' : 'text-gray-500'}`}>
                {idx + 1}
              </span>
              <span>{kw.text}</span>
              {idx < 3 && <Flame className="w-3 h-3 text-orange-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* 推荐主播 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-bold">推荐主播</h3>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('home')}
            className="text-gray-400 text-xs hover:text-white flex items-center gap-1 transition-colors"
          >
            查看更多 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { id: 1, nickname: '才艺主播小美', username: 'caiyi_xiaomei', avatar: '', isHost: true, level: 32, category: '才艺', living: true, roomId: 1001 },
            { id: 2, nickname: '游戏大神阿杰', username: 'gamer_ajie', avatar: '', isHost: true, level: 28, category: '游戏', living: true, roomId: 1002 },
            { id: 3, nickname: '户外探险家', username: 'outdoor_explorer', avatar: '', isHost: true, level: 25, category: '户外', living: false, roomId: null },
            { id: 4, nickname: '美食达人小雨', username: 'foodie_xy', avatar: '', isHost: true, level: 22, category: '美食', living: true, roomId: 1004 },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => item.living ? handleEnterLive(item.roomId) : handleHotKeyword(item.nickname)}
              className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700/30 hover:border-pink-500/30 hover:bg-gray-800 transition-all cursor-pointer group text-center relative overflow-hidden"
            >
              {item.living && (
                <span className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                  LIVE
                </span>
              )}
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5 mx-auto mb-3 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                  {renderAvatar(item.avatar, 'w-8 h-8')}
                </div>
              </div>
              <p className="text-white font-bold text-sm truncate">{item.nickname}</p>
              <p className="text-gray-500 text-xs mt-0.5 truncate">@{item.username}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="text-[10px] text-pink-400 font-medium">Lv.{item.level}</span>
                <span className="text-gray-700 text-[10px]">·</span>
                <span className="text-[10px] text-gray-400">{getCategoryIcon(item.category)} {item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 搜索小贴士 */}
      <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl p-5 border border-pink-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">搜索小贴士</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              输入用户名或ID可快速查找好友，搜索主播昵称可直接进入直播间。关注的主播开播时会显示在首页"关注"Tab 中。
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/5 to-gray-900 pb-24">
      {/* 顶部搜索栏 */}
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="w-10 h-10 rounded-full bg-gray-800/60 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all shrink-0"
              aria-label="返回"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative group">
                {/* 渐变光效 */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full opacity-0 group-focus-within:opacity-60 blur transition-opacity duration-300 pointer-events-none" />
                <div className="relative flex items-center bg-gray-800/90 border border-gray-700/50 rounded-full pl-4 pr-2 py-2.5 group-focus-within:border-pink-500/50 transition-all">
                  <SearchIcon className="w-5 h-5 text-gray-500 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="搜索用户、主播或直播间..."
                    className="flex-1 bg-transparent ml-3 text-white placeholder-gray-500 focus:outline-none text-sm min-w-0"
                    autoFocus
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-700 rounded-full transition-all shrink-0"
                      aria-label="清除"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="ml-1 px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-pink-500/30 transition-all shrink-0"
                  >
                    搜索
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 筛选 Tab */}
          {searched && !loading && (users.length > 0 || streams.length > 0) && (
            <div className="flex gap-2 mt-3">
              {TABS.map((tab) => {
                const count = tab.id === 'all'
                  ? users.length + streams.length
                  : tab.id === 'user'
                  ? users.length
                  : streams.length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                        : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.id ? 'bg-white/20' : 'bg-gray-700/60'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          renderLoading()
        ) : searched ? (
          (filteredUsers.length > 0 || filteredStreams.length > 0) ? (
            <>
              {/* 用户结果 */}
              {filteredUsers.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-white font-bold">用户</h3>
                    <span className="text-gray-500 text-sm">({filteredUsers.length})</span>
                  </div>
                  <div className="space-y-3">
                    {filteredUsers.map(renderUserCard)}
                  </div>
                </div>
              )}

              {/* 直播结果 */}
              {filteredStreams.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                      <Video className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-white font-bold">直播</h3>
                    <span className="text-gray-500 text-sm">({filteredStreams.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStreams.map(renderStreamCard)}
                  </div>
                </div>
              )}
            </>
          ) : renderEmptyState()
        ) : renderRecommendations()}
      </main>
    </div>
  );
};

export default Search;
