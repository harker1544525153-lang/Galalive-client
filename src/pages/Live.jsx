import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  X, Heart, Send, Gift, Users, Share2, User, Crown, Flag, Mail,
  Eye, Zap, Minus, Plus, Check, ChevronLeft, ChevronRight
} from 'lucide-react';
import { streamAPI, giftAPI, userAPI, followAPI } from '../api';
import { getUserLevelByLevelNum, loadLevelConfigs } from '../utils/level';

const DANMAKU_COLORS = ['#ffffff', '#ff6b9d', '#ffd700', '#00e5ff', '#7cff6b', '#ff6b6b', '#c77dff'];
const DANMAKU_COST = 2;
const COMBO_TIMEOUT = 3000;
const REPORT_TYPES = [
  { value: 'inappropriate_content', label: '不当内容', icon: '⚠️' },
  { value: 'harassment', label: '骚扰谩骂', icon: '😤' },
  { value: 'spam', label: '垃圾广告', icon: '📢' },
  { value: 'violence', label: '暴力血腥', icon: '🔪' },
  { value: 'copyright_violation', label: '版权侵犯', icon: '©️' },
  { value: 'other', label: '其他', icon: '📝' },
];

const Live = ({ user, match, onFollowChange, showToast }) => {
  const roomId = match?.params?.roomId;

  // 核心数据
  const [stream, setStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [danmakus, setDanmakus] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [viewers, setViewers] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [diamonds, setDiamonds] = useState(user?.diamonds || 0);

  // 输入
  const [inputMessage, setInputMessage] = useState('');
  const [inputMode, setInputMode] = useState('message');

  // 弹窗
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showPM, setShowPM] = useState(false);
  const [rankingTab, setRankingTab] = useState('day');

  // 礼物
  const [selectedGift, setSelectedGift] = useState(null);
  const [giftCount, setGiftCount] = useState(1);
  const [comboData, setComboData] = useState(null);

  // 举报
  const [reportType, setReportType] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // 私信
  const [pmUsers, setPmUsers] = useState([]);
  const [pmTarget, setPmTarget] = useState(null);
  const [pmInput, setPmInput] = useState('');
  const [pmMessages, setPmMessages] = useState({});

  // Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const danmakuIdRef = useRef(0);
  const danmakuLaneRef = useRef(0);
  const comboTimerRef = useRef(null);

  // ========== 生命周期 ==========

  useEffect(() => {
    document.title = 'Gala Live - 直播间';
    loadLevelConfigs();
    loadStream();
    loadGifts();
    loadViewers();
    loadRanking();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (user && roomId) {
        streamAPI.leaveStream(roomId).catch(() => {});
      }
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (stream && user) {
      checkFollowStatus();
      enterStream();
      connectSocket();
      refreshUserDiamonds();
    }
  }, [stream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ========== 数据加载 ==========

  const loadStream = async () => {
    try {
      const response = await streamAPI.getStream(roomId);
      setStream(response.data);
    } catch (error) {
      console.error('Failed to load stream:', error);
    }
  };

  const loadGifts = async () => {
    try {
      const response = await giftAPI.getGifts();
      setGifts(response.data);
    } catch (error) {
      console.error('Failed to load gifts:', error);
    }
  };

  const loadViewers = async () => {
    try {
      const response = await streamAPI.getViewers(roomId);
      setViewers(response.data);
    } catch (error) {
      console.error('Failed to load viewers:', error);
    }
  };

  const loadRanking = async () => {
    try {
      const response = await giftAPI.getRanking(roomId);
      setRanking(response.data);
    } catch (error) {
      console.error('Failed to load ranking:', error);
    }
  };

  const enterStream = async () => {
    try {
      await streamAPI.enterStream(roomId, { roomId });
      setMessages(prev => [...prev, {
        type: 'system',
        content: `欢迎来到 ${stream?.nickname || '主播'} 的直播间`,
        timestamp: new Date().toISOString(),
      }]);
    } catch (error) {
      console.error('Failed to enter stream:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!stream?.host_id) return;
    try {
      const response = await followAPI.checkFollow(stream.host_id);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  };

  // ========== Socket 连接 ==========

  const connectSocket = () => {
    if (!user || socketRef.current) return;
    socketRef.current = io('http://localhost:3002');

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', { roomId, userId: user.id });
    });

    socketRef.current.on('chat_message', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'chat' }]);
    });

    socketRef.current.on('danmaku', (msg) => {
      addDanmaku(msg);
    });

    socketRef.current.on('send_gift', (data) => {
      setMessages(prev => [...prev, { ...data, type: 'gift' }]);
      triggerGiftCombo(data);
    });

    socketRef.current.on('user_join', (data) => {
      setMessages(prev => [...prev, {
        type: 'system',
        content: '一位新用户进入了直播间',
        timestamp: new Date().toISOString(),
      }]);
      loadViewers();
    });

    socketRef.current.on('user_leave', (data) => {
      setMessages(prev => [...prev, {
        type: 'system',
        content: '一位用户离开了直播间',
        timestamp: new Date().toISOString(),
      }]);
      loadViewers();
    });
  };

  // ========== 弹幕 ==========

  const addDanmaku = (msg) => {
    const id = danmakuIdRef.current++;
    const color = DANMAKU_COLORS[id % DANMAKU_COLORS.length];
    const lane = danmakuLaneRef.current % 8;
    danmakuLaneRef.current++;
    setDanmakus(prev => [...prev, { ...msg, id, color, lane }]);
    setTimeout(() => {
      setDanmakus(prev => prev.filter(d => d.id !== id));
    }, 12000);
  };

  // ========== 礼物连击动画 ==========

  const triggerGiftCombo = (data) => {
    setComboData(prev => {
      const newCount = (prev?.count || 0) + 1;
      return {
        gift: data.gift,
        count: newCount,
        nickname: data.nickname,
        avatar: data.cover,
      };
    });
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setComboData(null);
    }, COMBO_TIMEOUT);
  };

  // ========== 发送消息/弹幕 ==========

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current || !user) return;
    const msgData = {
      roomId,
      userId: user.id,
      content: inputMessage,
      username: user.username,
      nickname: user.nickname,
      avatar: user.cover,
    };
    socketRef.current.emit('chat_message', msgData);
    setMessages(prev => [...prev, {
      ...msgData,
      type: 'chat',
      timestamp: new Date().toISOString(),
    }]);
    setInputMessage('');
  };

  const handleSendDanmaku = () => {
    if (!inputMessage.trim() || !socketRef.current || !user) return;
    if (diamonds < DANMAKU_COST) {
      alert(`钻石不足！发送弹幕需要 ${DANMAKU_COST} 钻石`);
      return;
    }
    const msgData = {
      roomId,
      userId: user.id,
      content: inputMessage,
      username: user.username,
      nickname: user.nickname,
      avatar: user.cover,
    };
    socketRef.current.emit('danmaku', msgData);
    addDanmaku(msgData);
    setDiamonds(prev => prev - DANMAKU_COST);
    setInputMessage('');
  };

  const handleSend = () => {
    if (inputMode === 'danmaku') {
      handleSendDanmaku();
    } else {
      handleSendMessage();
    }
  };

  // ========== 礼物 ==========

  const handleSendGift = async () => {
    if (!selectedGift || !user) return;
    try {
      const response = await giftAPI.sendGift({
        roomId,
        giftId: selectedGift.id,
        count: giftCount,
      });
      if (socketRef.current) {
        socketRef.current.emit('send_gift', {
          roomId,
          userId: user.id,
          gift: response.data.gift,
          username: user.username,
          nickname: user.nickname,
          avatar: user.cover,
        });
      }
      setDiamonds(prev => prev - selectedGift.price * giftCount);
      triggerGiftCombo({
        gift: response.data.gift,
        nickname: user.nickname,
        avatar: user.cover,
      });
      setShowGiftPanel(false);
      setSelectedGift(null);
      setGiftCount(1);
      loadRanking();
    } catch (error) {
      alert(error.response?.data?.error || '发送失败');
    }
  };

  const handleComboSend = async () => {
    if (!selectedGift || !user) return;
    if (diamonds < selectedGift.price) {
      alert('钻石不足！');
      return;
    }
    try {
      const response = await giftAPI.sendGift({
        roomId,
        giftId: selectedGift.id,
        count: 1,
      });
      if (socketRef.current) {
        socketRef.current.emit('send_gift', {
          roomId,
          userId: user.id,
          gift: response.data.gift,
          username: user.username,
          nickname: user.nickname,
          avatar: user.cover,
        });
      }
      setDiamonds(prev => prev - selectedGift.price);
      triggerGiftCombo({
        gift: response.data.gift,
        nickname: user.nickname,
        avatar: user.cover,
      });
    } catch (error) {
      alert(error.response?.data?.error || '发送失败');
    }
  };

  // ========== 关注 ==========

  const handleFollow = async () => {
    if (!stream?.host_id || !user) return;
    try {
      let response;
      const willFollow = !isFollowing;
      if (isFollowing) {
        response = await followAPI.unfollow({ followeeId: stream.host_id });
      } else {
        response = await followAPI.follow({ followeeId: stream.host_id });
      }
      setIsFollowing(willFollow);
      if (onFollowChange) {
        onFollowChange();
      }
      const message = response.data?.message || (willFollow ? '关注成功' : '取消关注成功');
      if (showToast) {
        showToast(message, 'success');
      }
    } catch (error) {
      if (showToast) {
        showToast(error.response?.data?.error || '操作失败', 'error');
      }
    }
  };

  // ========== 分享 ==========

  const handleShare = async () => {
    const shareData = {
      title: stream?.title || 'Gala Live 直播间',
      text: `来观看 ${stream?.nickname || '主播'} 的直播！`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // 用户取消
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('链接已复制到剪贴板！');
      } catch {
        alert('分享链接: ' + shareData.url);
      }
    }
  };

  // ========== 举报 ==========

  const handleReport = () => {
    if (!reportType) {
      alert('请选择举报类型');
      return;
    }
    setReportSubmitting(true);
    setTimeout(() => {
      setReportSubmitting(false);
      setShowReport(false);
      setReportType('');
      setReportDesc('');
      alert('举报已提交，我们会尽快处理');
    }, 1000);
  };

  // ========== 私信 ==========

  const loadPMUsers = async () => {
    try {
      const response = await followAPI.getFollowing();
      setPmUsers(response.data);
    } catch (error) {
      console.error('Failed to load PM users:', error);
    }
  };

  const handleSendPM = () => {
    if (!pmInput.trim() || !pmTarget) return;
    setPmMessages(prev => ({
      ...prev,
      [pmTarget.id]: [...(prev[pmTarget.id] || []), {
        content: pmInput,
        sender: 'me',
        timestamp: new Date().toISOString(),
      }],
    }));
    setPmInput('');
  };

  // ========== 刷新用户钻石余额 ==========

  const refreshUserDiamonds = async () => {
    if (!user) return;
    try {
      const response = await userAPI.getUser(user.id);
      setDiamonds(response.data.diamonds || 0);
    } catch (error) {
      console.error('Failed to refresh user diamonds:', error);
    }
  };

  // ========== 渲染 ==========

  if (!stream) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden relative">

      {/* ===== 背景视频/封面 ===== */}
      <div className="absolute inset-0">
        <img
          src={stream.cover || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=live%20streaming%20background%20stage%20colorful&image_size=landscape_16_9'}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* ===== 弹幕层 ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {danmakus.map((d) => (
          <div
            key={d.id}
            className="absolute whitespace-nowrap font-medium text-shadow-lg flex items-center gap-1.5"
            style={{
              top: `${d.lane * 10 + 8}%`,
              left: '100%',
              animation: `danmakuScroll ${10 + (d.id % 4)}s linear forwards`,
              color: d.color,
            }}
          >
            {d.avatar ? (
              <img src={d.avatar} alt="" className="w-6 h-6 rounded-full border border-white/30 object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-700 border border-white/30 flex items-center justify-center text-xs text-white">
                {(d.nickname || d.username || 'U').charAt(0)}
              </div>
            )}
            <span className="font-semibold">{d.nickname || d.username || '用户'}:</span>
            <span>{d.content}</span>
          </div>
        ))}
      </div>

      {/* ===== 礼物连击动画 ===== */}
      {comboData && (
        <div className="absolute left-3 bottom-44 z-20 animate-combo-in">
          <div className="flex items-center gap-3 bg-gradient-to-r from-pink-600/80 to-purple-600/80 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-pink-400/30 shadow-lg">
            {comboData.avatar ? (
              <img src={comboData.avatar} alt="" className="w-9 h-9 rounded-full border-2 border-yellow-400 object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center border-2 border-yellow-400">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <p className="text-white text-xs font-medium">{comboData.nickname}</p>
              <p className="text-yellow-300 text-xs">送出 {comboData.gift?.name}</p>
            </div>
            <span className="text-2xl">{comboData.gift?.icon}</span>
            <div className="flex flex-col items-center">
              <span className="text-yellow-400 text-xl font-bold">x{comboData.count}</span>
              <span className="text-pink-300 text-xs">连击!</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== 顶部主播信息条 ===== */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3">
        <div className="flex items-center gap-2">
          {/* 关闭 */}
          <button
            onClick={() => window.history.back()}
            className="w-9 h-9 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 主播信息 */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full pl-1 pr-3 py-1 flex-1 min-w-0 max-w-md">
            <div className="relative flex-shrink-0">
              {stream.cover ? (
                <img src={stream.cover} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border border-black">
                <Crown className="w-2.5 h-2.5 text-black" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-white text-sm font-semibold truncate">{stream.nickname}</span>
                <span className="text-gray-400 text-xs hidden sm:inline">@{stream.username}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-xs">
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  {stream.viewers_count}
                </span>
                <span className="flex items-center gap-0.5">
                  <Heart className="w-3 h-3" />
                  {stream.likes_count}
                </span>
                <span className="bg-red-500/80 text-white px-1.5 rounded text-xs flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>
          </div>

          {/* 关注按钮 */}
          <button
            onClick={handleFollow}
            className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
              isFollowing
                ? 'bg-gray-700/80 text-gray-300'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
            }`}
          >
            {isFollowing ? '已关注' : '+ 关注'}
          </button>
        </div>
      </div>

      {/* ===== 右侧浮动按钮 ===== */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        <button onClick={() => setShowViewers(true)} className="flex flex-col items-center gap-0.5">
          <div className="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-white text-xs">{viewers.length}</span>
        </button>
        <button onClick={() => setShowRanking(true)} className="flex flex-col items-center gap-0.5">
          <div className="w-11 h-11 bg-gradient-to-br from-yellow-500/80 to-orange-600/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
            <Crown className="w-5 h-5" />
          </div>
          <span className="text-white text-xs">榜单</span>
        </button>
        <button onClick={handleShare} className="flex flex-col items-center gap-0.5">
          <div className="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-white text-xs">分享</span>
        </button>
        <button onClick={() => { setShowPM(true); loadPMUsers(); }} className="flex flex-col items-center gap-0.5">
          <div className="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-white text-xs">私信</span>
        </button>
        <button onClick={() => setShowReport(true)} className="flex flex-col items-center gap-0.5">
          <div className="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all">
            <Flag className="w-5 h-5" />
          </div>
          <span className="text-white text-xs">举报</span>
        </button>
      </div>

      {/* ===== 底部聊天 + 输入栏 ===== */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* 聊天消息 */}
        <div className="max-h-[35vh] overflow-y-auto px-3 pb-2 scrollbar-hide">
          <div className="space-y-1.5">
            {messages.slice(-50).map((msg, index) => (
              <div key={index}>
                {msg.type === 'system' ? (
                  <div className="flex justify-center">
                    <span className="bg-black/40 backdrop-blur-sm text-gray-300 text-xs px-3 py-1 rounded-full">
                      {msg.content}
                    </span>
                  </div>
                ) : msg.type === 'gift' ? (
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600/50 to-purple-600/50 backdrop-blur-md rounded-full px-3 py-1.5 border border-pink-400/30">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                      {msg.nickname?.charAt(0) || 'U'}
                    </div>
                    <span className="text-pink-200 text-xs font-medium">{msg.nickname}</span>
                    <span className="text-white text-xs">送出</span>
                    <span className="text-lg">{msg.gift?.icon}</span>
                    <span className="text-yellow-300 text-xs font-semibold">x{msg.gift?.count || 1}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-start gap-2 bg-black/40 backdrop-blur-sm rounded-2xl px-3 py-1.5 max-w-[80%]">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs text-white flex-shrink-0">
                      {msg.nickname?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <span className="text-pink-300 text-xs font-medium mr-1">{msg.nickname}</span>
                      <span className="text-white text-sm break-words">{msg.content}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入栏 */}
        <div className="bg-gradient-to-t from-black/90 to-transparent pt-2 pb-3 px-3">
          <div className="flex items-center gap-2">
            {/* 消息/弹幕切换 */}
            <div className="flex bg-black/50 backdrop-blur-md rounded-full p-0.5 flex-shrink-0">
              <button
                onClick={() => setInputMode('message')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  inputMode === 'message' ? 'bg-pink-500 text-white' : 'text-gray-400'
                }`}
              >
                消息
              </button>
              <button
                onClick={() => setInputMode('danmaku')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-0.5 ${
                  inputMode === 'danmaku' ? 'bg-pink-500 text-white' : 'text-gray-400'
                }`}
              >
                弹幕
                <span className="text-yellow-400 text-xs">{DANMAKU_COST}💎</span>
              </button>
            </div>

            {/* 输入框 */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={inputMode === 'danmaku' ? '发送弹幕...' : '说点什么...'}
              className="flex-1 bg-black/50 backdrop-blur-md text-white text-sm placeholder-gray-500 rounded-full px-4 py-2 focus:outline-none border border-white/10 focus:border-pink-500/50 min-w-0"
            />

            {/* 礼物按钮 */}
            <button
              onClick={() => setShowGiftPanel(true)}
              className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform flex-shrink-0"
            >
              <Gift className="w-5 h-5" />
            </button>

            {/* 钻石显示 */}
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-3 py-2 flex-shrink-0">
              <span className="text-sm">💎</span>
              <span className="text-yellow-400 text-sm font-semibold">{diamonds}</span>
            </div>

            {/* 发送 */}
            <button
              onClick={handleSend}
              className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:shadow-pink-500/30 transition-all flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== 礼物面板 ===== */}
      {showGiftPanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50" onClick={() => setShowGiftPanel(false)}>
          <div className="bg-gray-900 w-full max-w-lg rounded-t-3xl p-5 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* 头部 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">选择礼物</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm">💎</span>
                <span className="text-yellow-400 font-semibold">{diamonds}</span>
                <button
                  onClick={() => setShowGiftPanel(false)}
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 礼物网格 */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {gifts.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => { setSelectedGift(gift); setGiftCount(1); }}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                    selectedGift?.id === gift.id
                      ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-pink-500 scale-105'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-3xl mb-1">{gift.icon}</span>
                  <span className="text-white text-xs font-medium">{gift.name}</span>
                  <span className="text-yellow-400 text-xs">{gift.price}</span>
                </button>
              ))}
            </div>

            {/* 选中礼物操作区 */}
            {selectedGift && (
              <div className="border-t border-gray-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedGift.icon}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{selectedGift.name}</p>
                      <p className="text-yellow-400 text-xs">{selectedGift.price} 💎/个</p>
                    </div>
                  </div>
                  {/* 数量选择 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGiftCount(Math.max(1, giftCount - 1))}
                      className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-bold w-8 text-center">{giftCount}</span>
                    <button
                      onClick={() => setGiftCount(giftCount + 1)}
                      className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 发送/连发按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSendGift}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl"
                  >
                    送出 ({selectedGift.price * giftCount} 💎)
                  </button>
                  {selectedGift.can_multiply ? (
                    <button
                      onClick={handleComboSend}
                      className="flex-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1"
                    >
                      <Zap className="w-5 h-5" />
                      连发
                    </button>
                  ) : null}
                </div>
                <p className="text-center text-gray-500 text-xs mt-2">当前余额: {diamonds} 💎</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== 贡献榜弹窗 ===== */}
      {showRanking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRanking(false)}>
          <div className="bg-gray-900 w-full max-w-md rounded-3xl p-5 max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                贡献榜
              </h3>
              <button onClick={() => setShowRanking(false)} className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 日榜/累计榜切换 */}
            <div className="flex bg-gray-800 rounded-full p-1 mb-4">
              <button
                onClick={() => setRankingTab('day')}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  rankingTab === 'day' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : 'text-gray-400'
                }`}
              >
                日榜
              </button>
              <button
                onClick={() => setRankingTab('total')}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  rankingTab === 'total' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : 'text-gray-400'
                }`}
              >
                累计榜
              </button>
            </div>

            {/* 榜单列表 */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {ranking.length === 0 ? (
                <div className="text-center text-gray-500 py-8">暂无数据</div>
              ) : (
                ranking.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/30' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-transparent border border-gray-400/30' :
                      index === 2 ? 'bg-gradient-to-r from-orange-500/20 to-transparent border border-orange-500/30' :
                      'bg-gray-800/50'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                      index === 2 ? 'bg-gradient-to-br from-orange-500 to-orange-700 text-white' :
                      'bg-gray-700 text-white'
                    }`}>
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white flex-shrink-0">
                      {item.nickname?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.nickname}</p>
                      <p className="text-xs" style={{ color: getUserLevelByLevelNum(item.level || 1).color }}>Lv.{item.level || 1}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">💎</span>
                      <span className="text-yellow-400 text-sm font-semibold">{item.total_contribution || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== 观众列表弹窗 ===== */}
      {showViewers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowViewers(false)}>
          <div className="bg-gray-900 w-full max-w-md rounded-3xl p-5 max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-500" />
                在线观众
                <span className="text-gray-500 text-sm">({viewers.length})</span>
              </h3>
              <button onClick={() => setShowViewers(false)} className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {viewers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">暂无观众</div>
              ) : (
                viewers.map((viewer) => (
                  <div key={viewer.id} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-xl cursor-pointer">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white">
                        {viewer.nickname?.charAt(0) || 'U'}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{viewer.nickname}</p>
                      <p className="text-xs" style={{ color: getUserLevelByLevelNum(viewer.level || 1).color }}>Lv.{viewer.level || 1}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== 举报弹窗 ===== */}
      {showReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReport(false)}>
          <div className="bg-gray-900 w-full max-w-md rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" />
                举报
              </h3>
              <button onClick={() => setShowReport(false)} className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">举报对象：{stream.nickname} 的直播间</p>

            <div className="space-y-2 mb-4">
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setReportType(type.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    reportType === type.value
                      ? 'bg-red-500/20 border border-red-500/50'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <span className="text-white text-sm flex-1 text-left">{type.label}</span>
                  {reportType === type.value && <Check className="w-4 h-4 text-red-500" />}
                </button>
              ))}
            </div>

            <textarea
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              placeholder="请描述具体情况（选填）"
              rows={3}
              className="w-full bg-gray-800 text-white text-sm placeholder-gray-500 rounded-xl px-3 py-2 resize-none focus:outline-none border border-gray-700 focus:border-red-500/50 mb-4"
            />

            <button
              onClick={handleReport}
              disabled={!reportType || reportSubmitting}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {reportSubmitting ? '提交中...' : '提交举报'}
            </button>
          </div>
        </div>
      )}

      {/* ===== 私信弹窗 ===== */}
      {showPM && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowPM(false); setPmTarget(null); }}>
          <div className="bg-gray-900 w-full max-w-md rounded-3xl p-5 max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                {pmTarget ? (
                  <button onClick={() => setPmTarget(null)} className="flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5 text-white" />
                    <span className="text-white text-base">{pmTarget.nickname}</span>
                  </button>
                ) : (
                  <>
                    <Mail className="w-5 h-5 text-pink-500" />
                    私信
                  </>
                )}
              </h3>
              <button onClick={() => { setShowPM(false); setPmTarget(null); }} className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {pmTarget ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                  {(pmMessages[pmTarget.id] || []).length === 0 ? (
                    <div className="text-center text-gray-500 py-8">开始与 {pmTarget.nickname} 聊天</div>
                  ) : (
                    (pmMessages[pmTarget.id] || []).map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                          msg.sender === 'me' ? 'bg-pink-500 text-white' : 'bg-gray-800 text-white'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pmInput}
                    onChange={(e) => setPmInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendPM()}
                    placeholder="输入消息..."
                    className="flex-1 bg-gray-800 text-white text-sm placeholder-gray-500 rounded-full px-4 py-2 focus:outline-none border border-gray-700 focus:border-pink-500/50 min-w-0"
                  />
                  <button
                    onClick={handleSendPM}
                    className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2">
                {pmUsers.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Mail className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>暂无关注用户</p>
                    <p className="text-xs mt-1">关注主播后可发送私信</p>
                  </div>
                ) : (
                  pmUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => setPmTarget(u)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-xl cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white">
                        {u.nickname?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{u.nickname}</p>
                        <p className="text-gray-500 text-xs">@{u.username}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== 样式 ===== */}
      <style>{`
        @keyframes danmakuScroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100vw - 100%)); }
        }
        .text-shadow-lg {
          text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes combo-in {
          0% { transform: scale(0.5) translateX(-20px); opacity: 0; }
          50% { transform: scale(1.1) translateX(0); opacity: 1; }
          100% { transform: scale(1) translateX(0); opacity: 1; }
        }
        .animate-combo-in {
          animation: combo-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Live;
