import { useState, useEffect } from 'react';
import {
  Trophy, Crown, Medal, Award, User, Ticket, Coins,
  TrendingUp, TrendingDown, Minus, Sparkles, Calendar, Info,
} from 'lucide-react';

const TIME_RANGES = [
  { id: 'day', label: '日榜', desc: '今日' },
  { id: 'month', label: '月榜', desc: '本月' },
  { id: 'total', label: '总榜', desc: '历史' },
];

const Leaderboard = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('income');
  const [timeRange, setTimeRange] = useState('day');
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Gala Live - 排行榜';
    loadData();
  }, [activeTab, timeRange]);

  const loadData = () => {
    setLoading(true);

    // 收入榜：主播获得的映票数
    const incomeData = [
      { id: 1, username: 'caiyi_xiaomei', nickname: '才艺主播小美', avatar: '', gender: 'female', level: 32, tickets: 568900, rankChange: 2 },
      { id: 2, username: 'gamer_ajie', nickname: '游戏大神阿杰', avatar: '', gender: 'male', level: 28, tickets: 452300, rankChange: -1 },
      { id: 3, username: 'outdoor_explorer', nickname: '户外探险家', avatar: '', gender: 'male', level: 25, tickets: 388700, rankChange: 0 },
      { id: 4, username: 'foodie_xy', nickname: '美食达人小雨', avatar: '', gender: 'female', level: 22, tickets: 256000, rankChange: 3 },
      { id: 5, username: 'talkshow_wang', nickname: '脱口秀小王', avatar: '', gender: 'male', level: 19, tickets: 198400, rankChange: -2 },
      { id: 6, username: 'music_prince', nickname: '音乐小王子', avatar: '', gender: 'male', level: 21, tickets: 156700, rankChange: 1 },
      { id: 7, username: 'dance_fairy', nickname: '舞蹈精灵', avatar: '', gender: 'female', level: 18, tickets: 132200, rankChange: 0 },
      { id: 8, username: 'chat_master', nickname: '聊天大师', avatar: '', gender: 'male', level: 16, tickets: 98600, rankChange: -1 },
      { id: 9, username: 'sing_expert', nickname: '唱歌达人', avatar: '', gender: 'female', level: 20, tickets: 78400, rankChange: 2 },
      { id: 10, username: 'game_noob', nickname: '游戏主播小白', avatar: '', gender: 'male', level: 17, tickets: 56200, rankChange: 0 },
    ];

    // 消费榜：用户消费的映票数
    const consumeData = [
      { id: 101, username: 'tuhao_ge', nickname: '土豪哥', avatar: '', gender: 'male', level: 45, tickets: 1024000, rankChange: 0 },
      { id: 102, username: 'super_rich', nickname: '超级土豪', avatar: '', gender: 'male', level: 50, tickets: 856000, rankChange: 1 },
      { id: 103, username: 'happy_audience', nickname: '快乐观众', avatar: '', gender: 'female', level: 30, tickets: 524000, rankChange: -1 },
      { id: 104, username: 'fan_star', nickname: '追星族', avatar: '', gender: 'female', level: 25, tickets: 358000, rankChange: 2 },
      { id: 105, username: 'gift_man', nickname: '礼物狂人', avatar: '', gender: 'male', level: 35, tickets: 298000, rankChange: -2 },
      { id: 106, username: 'warm_audience', nickname: '热心观众', avatar: '', gender: 'male', level: 22, tickets: 234000, rankChange: 0 },
      { id: 107, username: 'newbie', nickname: '新人小白', avatar: '', gender: 'female', level: 12, tickets: 102000, rankChange: 3 },
      { id: 108, username: 'low_key_rich', nickname: '低调土豪', avatar: '', gender: 'male', level: 28, tickets: 88500, rankChange: -1 },
      { id: 109, username: 'loyal_fan', nickname: '忠实粉丝', avatar: '', gender: 'female', level: 18, tickets: 56300, rankChange: 0 },
      { id: 110, username: 'active_user', nickname: '活跃用户', avatar: '', gender: 'male', level: 15, tickets: 32100, rankChange: 1 },
    ];

    const data = activeTab === 'income' ? incomeData : consumeData;
    setRanking(data);
    setTimeout(() => setLoading(false), 200);
  };

  const formatTickets = (count) => {
    if (count >= 10000) return (count / 10000).toFixed(1) + '万';
    return count.toLocaleString();
  };

  const getGenderDisplay = (gender) => {
    if (gender === 'male') return { symbol: '♂', label: '男', color: 'text-blue-400', bg: 'bg-blue-500/15' };
    if (gender === 'female') return { symbol: '♀', label: '女', color: 'text-pink-400', bg: 'bg-pink-500/15' };
    return { symbol: '?', label: '保密', color: 'text-gray-400', bg: 'bg-gray-500/15' };
  };

  const getRankStyle = (index) => {
    if (index === 0) return {
      border: 'from-yellow-400 via-amber-500 to-orange-500',
      glow: 'shadow-yellow-500/30',
      ring: 'from-yellow-400 to-amber-500',
      text: 'text-yellow-400',
      bg: 'from-yellow-500/10 via-amber-500/5 to-transparent',
      label: '冠军',
      icon: Crown,
    };
    if (index === 1) return {
      border: 'from-gray-300 via-gray-400 to-slate-500',
      glow: 'shadow-gray-400/30',
      ring: 'from-gray-300 to-slate-400',
      text: 'text-gray-300',
      bg: 'from-gray-400/10 via-slate-400/5 to-transparent',
      label: '亚军',
      icon: Medal,
    };
    return {
      border: 'from-orange-400 via-orange-500 to-red-500',
      glow: 'shadow-orange-500/30',
      ring: 'from-orange-400 to-orange-600',
      text: 'text-orange-400',
      bg: 'from-orange-500/10 via-red-500/5 to-transparent',
      label: '季军',
      icon: Award,
    };
  };

  const getRankChangeDisplay = (change) => {
    if (change > 0) return { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/15', text: `+${change}` };
    if (change < 0) return { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/15', text: `${change}` };
    return { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-500/15', text: '持平' };
  };

  const renderAvatar = (avatar, size = 'w-6 h-6') => {
    if (avatar) {
      return <img src={avatar} alt="" className="w-full h-full rounded-full object-cover" />;
    }
    return (
      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
        <User className={size + ' text-gray-400'} />
      </div>
    );
  };

  const handleUserClick = (item) => {
    if (onNavigate) onNavigate('profile', { userId: item.id });
  };

  const renderTop3Card = (item, index) => {
    const style = getRankStyle(index);
    const RankIcon = style.icon;
    const gender = getGenderDisplay(item.gender);
    const change = getRankChangeDisplay(item.rankChange);
    const ChangeIcon = change.icon;

    return (
      <div
        key={item.id}
        onClick={() => handleUserClick(item)}
        className={`relative bg-gradient-to-br ${style.bg} backdrop-blur rounded-3xl p-5 border border-gray-700/40 cursor-pointer hover:shadow-2xl ${style.glow} transition-all duration-300 hover:-translate-y-1 group overflow-hidden`}
      >
        {/* 装饰光效 */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${style.border} opacity-20 blur-3xl rounded-full pointer-events-none`} />

        <div className="relative flex items-center gap-4">
          {/* 排名图标 */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${style.border} flex items-center justify-center shadow-lg ${style.glow}`}>
              <RankIcon className="w-7 h-7 text-white" />
            </div>
            <span className={`text-[10px] font-bold ${style.text}`}>NO.{index + 1}</span>
          </div>

          {/* 头像 */}
          <div className="relative shrink-0">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${style.ring} p-1 shadow-xl`}>
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                {renderAvatar(item.avatar, 'w-10 h-10')}
              </div>
            </div>
            {/* 等级徽章 */}
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-gray-900">
              Lv.{item.level}
            </div>
          </div>

          {/* 用户信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <p className="text-white font-bold text-lg truncate">{item.nickname}</p>
              <span className={`text-[10px] ${gender.color} ${gender.bg} px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0`}>
                {gender.symbol} {gender.label}
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-2 truncate">@{item.username}</p>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${style.border} bg-opacity-20`}>
              <Sparkles className={`w-3.5 h-3.5 ${style.text}`} />
              <span className={`text-xs font-bold ${style.text}`}>{style.label}</span>
            </div>
          </div>

          {/* 票数 */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1.5">
              <Ticket className={`w-5 h-5 ${style.text}`} />
              <span className={`font-bold text-xl ${style.text}`}>{formatTickets(item.tickets)}</span>
            </div>
            <p className="text-gray-500 text-xs mt-0.5">{activeTab === 'income' ? '获映票' : '消费映票'}</p>
            <div className={`flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full ${change.bg}`}>
              <ChangeIcon className={`w-3 h-3 ${change.color}`} />
              <span className={`text-xs font-medium ${change.color}`}>{change.text}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRegularCard = (item, index) => {
    const gender = getGenderDisplay(item.gender);
    const change = getRankChangeDisplay(item.rankChange);
    const ChangeIcon = change.icon;

    return (
      <div
        key={item.id}
        onClick={() => handleUserClick(item)}
        className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 cursor-pointer group"
      >
        {/* 排名 */}
        <div className="w-10 h-10 rounded-xl bg-gray-700/50 flex items-center justify-center text-gray-400 font-bold text-base shrink-0 group-hover:bg-gray-700 transition-colors">
          {index + 1}
        </div>

        {/* 头像 */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/60 to-purple-600/60 p-0.5">
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
              {renderAvatar(item.avatar, 'w-6 h-6')}
            </div>
          </div>
        </div>

        {/* 用户信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-bold truncate">{item.nickname}</p>
            <span className={`text-[10px] ${gender.color} ${gender.bg} px-1.5 py-0.5 rounded-full shrink-0`}>
              {gender.symbol}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-gray-500 text-xs truncate">@{item.username}</span>
            <span className="text-gray-700">·</span>
            <span className="text-xs text-pink-400 font-medium shrink-0">Lv.{item.level}</span>
          </div>
        </div>

        {/* 票数 */}
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 justify-end">
            <Ticket className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-white font-bold">{formatTickets(item.tickets)}</span>
          </div>
          <div className={`flex items-center gap-1 mt-1 justify-end ${change.color}`}>
            <ChangeIcon className="w-3 h-3" />
            <span className="text-xs font-medium">{change.text}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderRules = () => (
    <div className="mt-8 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur rounded-3xl p-6 border border-gray-700/40">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
          <Info className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-white font-bold">排行榜规则</h3>
      </div>
      <div className="space-y-3">
        {[
          { color: 'bg-pink-500', text: '收入榜根据主播获得的映票数进行排名，体现主播人气与收益能力' },
          { color: 'bg-purple-500', text: '消费榜根据用户消费的映票数进行排名，展示平台活跃用户' },
          { color: 'bg-blue-500', text: '日榜每日 00:00 重置，月榜每月 1 日重置，总榜累计历史数据' },
          { color: 'bg-yellow-500', text: '排名前三名可获得专属头衔与平台奖励，TOP1 将获得王者标识' },
          { color: 'bg-green-500', text: '排名变化反映了与上一周期相比的升降情况，实时更新' },
        ].map((rule, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className={`w-1.5 h-1.5 rounded-full ${rule.color} mt-2 shrink-0`} />
            <p className="text-gray-400 text-sm leading-relaxed">{rule.text}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-800/50 rounded-2xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-700/50" />
            <div className="w-12 h-12 rounded-full bg-gray-700/50" />
            <div className="flex-1">
              <div className="h-4 bg-gray-700/50 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-700/50 rounded w-1/2" />
            </div>
            <div className="h-6 w-16 bg-gray-700/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 pb-24">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              排行榜
            </h1>
          </div>

          {/* 榜单类型 Tab */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setActiveTab('income')}
              className={`flex-1 py-3.5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'income'
                  ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Trophy className="w-5 h-5" />
              收入榜
            </button>
            <button
              onClick={() => setActiveTab('consume')}
              className={`flex-1 py-3.5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'consume'
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Coins className="w-5 h-5" />
              消费榜
            </button>
          </div>

          {/* 时间范围 Tab */}
          <div className="flex gap-2 bg-gray-800/40 p-1 rounded-2xl">
            {TIME_RANGES.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  timeRange === range.id
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 票数说明条 */}
        <div className="mb-5 flex items-center justify-between bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur rounded-2xl px-4 py-3 border border-gray-700/30">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 text-sm font-medium">
              {activeTab === 'income' ? '主播收入映票榜' : '用户消费映票榜'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            {TIME_RANGES.find((r) => r.id === timeRange)?.desc}数据
          </div>
        </div>

        {loading ? (
          renderLoading()
        ) : (
          <>
            {/* TOP3 大卡片 */}
            {ranking.length >= 3 && (
              <div className="space-y-3 mb-3">
                {ranking.slice(0, 3).map((item, index) => renderTop3Card(item, index))}
              </div>
            )}

            {/* 普通排名列表 */}
            {ranking.length > 3 && (
              <div className="space-y-2.5">
                {ranking.slice(3).map((item, index) => renderRegularCard(item, index + 3))}
              </div>
            )}

            {/* 规则说明 */}
            {renderRules()}
          </>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
