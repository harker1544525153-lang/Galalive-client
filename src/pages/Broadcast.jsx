import { useState, useEffect, useRef } from 'react';
import {
  Camera, Mic, MicOff, VideoOff, SwitchCamera, Sparkles, Palette, Shield,
  Clock, Lock, Users, Gift, X, Video, Share2, Swords,
  ChevronLeft, Image as ImageIcon, Ban, UserX, Send, RotateCcw, Film, Crown,
} from 'lucide-react';
import { streamAPI, giftAPI } from '../api';

const beautyModes = [
  { id: 'natural', name: '自然' },
  { id: 'skin', name: '美肤' },
  { id: 'soft', name: '柔肤' },
  { id: 'simple', name: '简单' },
  { id: 'lightTender', name: '轻度嫩肤' },
  { id: 'white', name: '白皙' },
  { id: 'tender', name: '嫩肤' },
];

const categories = [
  { name: '才艺', icon: '🎤' },
  { name: '女神', icon: '👸' },
  { name: '娱乐', icon: '🎉' },
  { name: '游戏', icon: '🎮' },
  { name: '户外', icon: '🌿' },
];

const Broadcast = ({ user, onNavigate }) => {
  // 开播前配置
  const [streamTitle, setStreamTitle] = useState('');
  const [streamCategory, setStreamCategory] = useState('才艺');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [isTimedCharge, setIsTimedCharge] = useState(false);
  const [timedChargeAmount, setTimedChargeAmount] = useState(10);
  const [coverImage, setCoverImage] = useState('');

  // 直播状态
  const [isLive, setIsLive] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [viewers, setViewers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [danmakus, setDanmakus] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [danmakuInput, setDanmakuInput] = useState('');
  const [earnings, setEarnings] = useState(0);
  const [duration, setDuration] = useState(0);
  const [peakViewers, setPeakViewers] = useState(0);

  // 摄像头/麦克风/镜像
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isMirror, setIsMirror] = useState(true);

  // 弹层
  const [showBeautyPanel, setShowBeautyPanel] = useState(false);
  const [showManagePanel, setShowManagePanel] = useState(false);
  const [showPKPanel, setShowPKPanel] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // 美颜
  const [beautyMode, setBeautyMode] = useState('natural');
  const [beautyLevel, setBeautyLevel] = useState(50);

  // PK
  const [pkHosts, setPkHosts] = useState([]);
  const [pkTarget, setPkTarget] = useState(null);
  const [pkStatus, setPkStatus] = useState('idle'); // idle | inviting | inPK
  const [pkCountdown, setPkCountdown] = useState(0);
  const [pkSelfScore, setPkSelfScore] = useState(0);
  const [pkTargetScore, setPkTargetScore] = useState(0);

  // 结束直播
  const [endStreamData, setEndStreamData] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const durationTimerRef = useRef(null);
  const dataTimerRef = useRef(null);
  const pkTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    document.title = 'Gala Live - 开播';
    startCamera();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isLive) {
      loadViewers();
      loadEarnings();
      durationTimerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      dataTimerRef.current = setInterval(() => {
        loadViewers();
        loadEarnings();
      }, 5000);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (dataTimerRef.current) clearInterval(dataTimerRef.current);
    };
  }, [isLive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (pkStatus === 'inPK' && pkCountdown > 0) {
      pkTimerRef.current = setInterval(() => {
        setPkCountdown((prev) => {
          if (prev <= 1) {
            setPkStatus('idle');
            setPkTarget(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(pkTimerRef.current);
    }
  }, [pkStatus, pkCountdown]);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (dataTimerRef.current) clearInterval(dataTimerRef.current);
    if (pkTimerRef.current) clearInterval(pkTimerRef.current);
  };

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const constraints = {
        video: { facingMode: isFrontCamera ? 'user' : 'environment' },
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      // 同步麦克风状态
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = micEnabled;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = cameraEnabled;
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  };

  const toggleCamera = () => {
    const newVal = !cameraEnabled;
    setCameraEnabled(newVal);
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = newVal;
    }
  };

  const toggleMic = () => {
    const newVal = !micEnabled;
    setMicEnabled(newVal);
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = newVal;
    }
  };

  const switchCamera = async () => {
    const newVal = !isFrontCamera;
    setIsFrontCamera(newVal);
    setTimeout(() => startCamera(), 100);
  };

  const toggleMirror = () => setIsMirror((v) => !v);

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 计算视频滤镜样式（美颜模式可视化）
  const getVideoFilterStyle = () => {
    const level = beautyLevel / 100;
    const base = { filter: '' };
    switch (beautyMode) {
      case 'natural':
        base.filter = `brightness(${1 + level * 0.05}) contrast(${1 + level * 0.05})`;
        break;
      case 'skin':
        base.filter = `brightness(${1 + level * 0.08}) saturate(${1 - level * 0.1})`;
        break;
      case 'soft':
        base.filter = `brightness(${1 + level * 0.1}) blur(${level * 0.4}px)`;
        break;
      case 'simple':
        base.filter = `contrast(${1 + level * 0.06}) brightness(${1 + level * 0.04})`;
        break;
      case 'lightTender':
        base.filter = `sepia(${level * 0.15}) brightness(${1 + level * 0.06})`;
        break;
      case 'white':
        base.filter = `brightness(${1 + level * 0.15}) saturate(${1 - level * 0.15})`;
        break;
      case 'tender':
        base.filter = `sepia(${level * 0.25}) brightness(${1 + level * 0.1}) saturate(${1 - level * 0.1})`;
        break;
      default:
        break;
    }
    return base;
  };

  const startStream = async () => {
    if (!streamTitle.trim()) {
      alert('请输入直播标题');
      return;
    }
    if (isPrivate && !password.trim()) {
      alert('请设置私密直播密码');
      return;
    }

    try {
      const response = await streamAPI.createStream({
        title: streamTitle,
        category: streamCategory,
        is_private: isPrivate ? 1 : 0,
        password: isPrivate ? password : undefined,
        is_timed_charge: isTimedCharge ? 1 : 0,
        timed_charge_amount: isTimedCharge ? timedChargeAmount : undefined,
        cover: coverImage,
      });

      setRoomId(response.data.roomId || response.data.room_id || '');
      setIsLive(true);
      setPeakViewers(0);
      setEarnings(0);
      setDuration(0);
    } catch (error) {
      alert(error.response?.data?.error || '开播失败');
    }
  };

  const handleEndStream = async () => {
    if (!confirm('确定要结束直播吗？')) return;

    try {
      await streamAPI.endStream(roomId);
      const data = {
        duration,
        viewers: viewers.length,
        peakViewers,
        earnings,
      };
      setEndStreamData(data);
      setShowEndModal(true);
      setIsLive(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setPkStatus('idle');
      setPkTarget(null);
      setPkCountdown(0);
    } catch (error) {
      alert(error.response?.data?.error || '结束直播失败');
    }
  };

  const closeEndModal = () => {
    setShowEndModal(false);
    setEndStreamData(null);
    setRoomId('');
    setViewers([]);
    setMessages([]);
    setDanmakus([]);
    setDuration(0);
    setEarnings(0);
    setPeakViewers(0);
    onNavigate('home');
  };

  const loadViewers = async () => {
    if (!roomId) return;
    try {
      const response = await streamAPI.getViewers(roomId);
      const newViewers = response.data || [];
      setViewers(newViewers);
      setPeakViewers((prev) => (newViewers.length > prev ? newViewers.length : prev));
    } catch (error) {
      console.error('Failed to load viewers:', error);
    }
  };

  const loadEarnings = async () => {
    if (!roomId) return;
    try {
      const response = await giftAPI.getGiftRecords(roomId, { limit: 100 });
      const total = (response.data || []).reduce(
        (sum, r) => sum + (r.total_amount || r.amount || r.value || 0),
        0
      );
      setEarnings(total);
      // PK 模式下自方得分按收益累计
      if (pkStatus === 'inPK') {
        setPkSelfScore(total);
        setPkTargetScore(Math.floor(total * 0.8 + pkCountdown * 5));
      }
    } catch (error) {
      console.error('Failed to load earnings:', error);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        userId: user.id,
        nickname: user.nickname,
        content: inputMessage,
        isHost: true,
        timestamp: new Date().toISOString(),
      },
    ]);
    setInputMessage('');
  };

  const handleSendDanmaku = () => {
    if (!danmakuInput.trim()) return;
    const danmaku = {
      id: Date.now(),
      content: danmakuInput,
      nickname: user.nickname,
      isHost: true,
    };
    setDanmakus((prev) => [...prev, danmaku]);
    setDanmakuInput('');
    setTimeout(() => {
      setDanmakus((prev) => prev.filter((d) => d.id !== danmaku.id));
    }, 8000);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/live/${roomId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: streamTitle || 'Gala Live',
          text: `来看看我的直播: ${streamTitle}`,
          url: shareUrl,
        });
      } catch (err) {
        // 用户取消分享
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('直播链接已复制到剪贴板');
      } catch {
        prompt('复制直播链接:', shareUrl);
      }
    }
  };

  const loadPKHosts = async () => {
    try {
      const response = await streamAPI.getStreams({ status: 'live' });
      const hosts = (response.data || []).filter(
        (s) => s.host_id !== user?.id && s.roomId !== roomId && s.room_id !== roomId
      );
      setPkHosts(hosts);
    } catch (error) {
      console.error('Failed to load PK hosts:', error);
    }
  };

  const openPKPanel = () => {
    loadPKHosts();
    setShowPKPanel(true);
  };

  const sendPKInvite = (host) => {
    setPkTarget(host);
    setPkStatus('inviting');
    // 模拟对方3秒后接受邀请
    setTimeout(() => {
      setPkStatus('inPK');
      setPkCountdown(180); // 3分钟 PK
      setPkSelfScore(0);
      setPkTargetScore(0);
      setShowPKPanel(false);
    }, 3000);
  };

  const cancelPK = () => {
    setPkStatus('idle');
    setPkTarget(null);
    setPkCountdown(0);
    setPkSelfScore(0);
    setPkTargetScore(0);
  };

  const kickViewer = (viewerId) => {
    if (!confirm('确定要踢出该观众吗？')) return;
    setViewers((prev) => prev.filter((v) => v.id !== viewerId));
    setMessages((prev) => [
      ...prev,
      {
        userId: 'system',
        nickname: '系统消息',
        content: '已踢出观众',
        isSystem: true,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const muteViewer = (viewerId) => {
    setViewers((prev) =>
      prev.map((v) => (v.id === viewerId ? { ...v, muted: !v.muted } : v))
    );
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (n) => {
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n;
  };

  // ============ 右侧工具栏按钮 ============
  const renderToolbar = (forLive) => (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => setShowBeautyPanel(true)}
        className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white hover:bg-black/60 transition-all active:scale-95"
        title="美颜"
      >
        <Sparkles className="w-5 h-5" />
      </button>
      <button
        onClick={switchCamera}
        className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all active:scale-95"
        title="切换摄像头"
      >
        <SwitchCamera className="w-5 h-5" />
      </button>
      <button
        onClick={toggleMic}
        className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-95 ${
          micEnabled ? 'bg-black/40 text-white hover:bg-black/60' : 'bg-red-500/80 text-white'
        }`}
        title="麦克风"
      >
        {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>
      <button
        onClick={toggleMirror}
        className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-95 ${
          isMirror ? 'bg-pink-500/80 text-white' : 'bg-black/40 text-white hover:bg-black/60'
        }`}
        title="镜像"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
      <button
        onClick={toggleCamera}
        className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-95 ${
          cameraEnabled ? 'bg-black/40 text-white hover:bg-black/60' : 'bg-red-500/80 text-white'
        }`}
        title="摄像头"
      >
        {cameraEnabled ? <Camera className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>
      {forLive && (
        <button
          onClick={openPKPanel}
          className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-95 ${
            pkStatus === 'inPK' ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white animate-pulse' : 'bg-black/40 text-white hover:bg-black/60'
          }`}
          title="PK"
        >
          <Swords className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  // ============ 美颜面板 ============
  const renderBeautyPanel = () => {
    if (!showBeautyPanel) return null;
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
        onClick={() => setShowBeautyPanel(false)}
      >
        <div
          className="bg-gray-900/95 backdrop-blur-xl w-full max-w-md rounded-t-3xl p-6 border-t border-gray-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-500" />
              美颜设置
            </h3>
            <button
              onClick={() => setShowBeautyPanel(false)}
              className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <span className="text-gray-300 font-medium mb-3 block text-sm">美颜模式</span>
            <div className="grid grid-cols-4 gap-2">
              {beautyModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setBeautyMode(mode.id)}
                  className={`py-3 rounded-xl text-xs font-medium transition-all duration-300 ${
                    beautyMode === mode.id
                      ? 'bg-gradient-to-br from-pink-500/40 to-purple-500/40 border border-pink-500 text-white shadow-lg shadow-pink-500/20'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300 font-medium text-sm">美化度</span>
              <span className="text-pink-500 font-semibold">{beautyLevel}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={beautyLevel}
              onChange={(e) => setBeautyLevel(Number(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${beautyLevel}%, #374151 ${beautyLevel}%, #374151 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>关闭</span>
              <span>自然</span>
              <span>极致</span>
            </div>
          </div>

          <button
            onClick={() => setShowBeautyPanel(false)}
            className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium py-3.5 rounded-xl hover:opacity-90 transition-all"
          >
            完成
          </button>
        </div>
      </div>
    );
  };

  // ============ PK 列表弹窗 ============
  const renderPKPanel = () => {
    if (!showPKPanel) return null;
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setShowPKPanel(false)}
      >
        <div
          className="bg-gray-900/95 backdrop-blur-xl w-full max-w-md rounded-3xl p-6 border border-gray-700/50 shadow-2xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Swords className="w-5 h-5 text-orange-500" />
              发起 PK
            </h3>
            <button
              onClick={() => setShowPKPanel(false)}
              className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-400 text-sm mb-4">选择正在直播的主播发起 PK 邀请，对方接受后开始 PK，以礼物收益决定胜负。</p>

          <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1">
            {pkHosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm">暂无可 PK 的主播</p>
              </div>
            ) : (
              pkHosts.map((host) => (
                <div
                  key={host.id || host.roomId || host.room_id}
                  className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-2xl hover:bg-gray-800 transition-all"
                >
                  <div className="relative">
                    {host.cover || host.avatar ? (
                      <img
                        src={host.cover || host.avatar}
                        alt={host.nickname || host.title}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {(host.nickname || host.title || 'U').charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      LIVE
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {host.nickname || host.title}
                    </p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {formatNumber(host.viewers_count || host.viewers || 0)}
                      <span className="ml-2">{host.category}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => sendPKInvite(host)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold rounded-full hover:opacity-90 transition-all active:scale-95"
                  >
                    邀请 PK
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============ 管理面板 ============
  const renderManagePanel = () => {
    if (!showManagePanel) return null;
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setShowManagePanel(false)}
      >
        <div
          className="bg-gray-900/95 backdrop-blur-xl w-full max-w-md rounded-3xl p-6 border border-gray-700/50 shadow-2xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-pink-500" />
              直播间管理
            </h3>
            <button
              onClick={() => setShowManagePanel(false)}
              className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1">
            {viewers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm">暂无观众</p>
              </div>
            ) : (
              viewers.map((viewer) => (
                <div
                  key={viewer.id}
                  className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-2xl"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                    <span className="text-sm text-white">
                      {viewer.nickname?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {viewer.nickname}
                      {viewer.muted && (
                        <span className="ml-2 text-xs text-red-400">已禁言</span>
                      )}
                    </p>
                    <p className="text-gray-500 text-xs">Lv.{viewer.level || 1}</p>
                  </div>
                  <button
                    onClick={() => muteViewer(viewer.id)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      viewer.muted
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-700/50 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                    }`}
                    title="禁言"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => kickViewer(viewer.id)}
                    className="w-9 h-9 rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    title="踢出"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============ 结束直播弹窗 ============
  const renderEndModal = () => {
    if (!showEndModal || !endStreamData) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 w-full max-w-sm rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-red-500 flex items-center justify-center shadow-lg shadow-pink-500/30 mb-3">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white text-xl font-bold">直播已结束</h3>
            <p className="text-gray-400 text-sm mt-1">感谢您的精彩直播</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-800/60 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-300 text-sm">直播时长</span>
              </div>
              <span className="text-white font-bold">{formatDuration(endStreamData.duration)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/60 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-gray-300 text-sm">观看人数</span>
              </div>
              <span className="text-white font-bold">{endStreamData.viewers}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/60 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-gray-300 text-sm">峰值人数</span>
              </div>
              <span className="text-white font-bold">{endStreamData.peakViewers}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-sm font-medium">获得映票</span>
              </div>
              <span className="text-pink-400 font-bold text-lg">{formatNumber(endStreamData.earnings)}</span>
            </div>
          </div>

          <button
            onClick={closeEndModal}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-pink-500/30"
          >
            完成
          </button>
        </div>
      </div>
    );
  };

  // ============ 视频元素 ============
  const videoStyle = {
    ...getVideoFilterStyle(),
    transform: isMirror ? 'scaleX(-1)' : 'none',
  };

  // ============ 开播前页面 ============
  const renderPreStream = () => (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden">
      {/* 摄像头预览 */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={videoStyle}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

      {/* 顶部栏 */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              maxLength={30}
              placeholder="添加直播标题..."
              className="w-full bg-black/40 backdrop-blur-md text-white placeholder-gray-300 rounded-full px-5 py-2.5 text-sm focus:outline-none border border-white/10 focus:border-pink-500/50 transition-all"
            />
          </div>

          {/* 封面预览 */}
          <button
            onClick={() => coverInputRef.current?.click()}
            className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden flex items-center justify-center hover:bg-black/60 transition-all active:scale-95"
            title="上传封面"
          >
            {coverImage ? (
              <img src={coverImage} alt="封面" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-white" />
            )}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* 右侧工具栏 */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
        {renderToolbar(false)}
      </div>

      {/* 底部设置区 */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-6">
        <div className="bg-black/50 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl">
          {/* 分类选择 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-300 text-xs font-medium">直播分类</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setStreamCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    streamCategory === cat.name
                      ? 'bg-gradient-to-r from-pink-500/40 to-purple-500/40 border border-pink-500 text-white'
                      : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 设置开关行 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                isPrivate
                  ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 border border-pink-500/50 text-white'
                  : 'bg-gray-800/60 text-gray-400'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                私密直播
              </span>
              <span className={`w-8 h-4 rounded-full relative transition-all ${isPrivate ? 'bg-pink-500' : 'bg-gray-600'}`}>
                <span
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                    isPrivate ? 'left-4' : 'left-0.5'
                  }`}
                />
              </span>
            </button>

            <button
              onClick={() => setIsTimedCharge(!isTimedCharge)}
              className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                isTimedCharge
                  ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 border border-orange-500/50 text-white'
                  : 'bg-gray-800/60 text-gray-400'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                计时收费
              </span>
              <span className={`w-8 h-4 rounded-full relative transition-all ${isTimedCharge ? 'bg-orange-500' : 'bg-gray-600'}`}>
                <span
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                    isTimedCharge ? 'left-4' : 'left-0.5'
                  }`}
                />
              </span>
            </button>
          </div>

          {/* 私密直播密码 */}
          {isPrivate && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="设置房间密码"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-500 mb-3"
            />
          )}

          {/* 计时收费金额 */}
          {isTimedCharge && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-400 text-xs">每分钟</span>
              <input
                type="number"
                min="1"
                value={timedChargeAmount}
                onChange={(e) => setTimedChargeAmount(Math.max(1, Number(e.target.value)))}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
              <span className="text-gray-400 text-xs">映票</span>
            </div>
          )}

          {/* 开播按钮 */}
          <button
            onClick={startStream}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Video className="w-5 h-5" />
            开始直播
          </button>

          {/* 发布小视频入口 */}
          <button
            onClick={() => onNavigate('video')}
            className="w-full mt-2 text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Film className="w-4 h-4" />
            发布小视频
          </button>
        </div>
      </div>

      {renderBeautyPanel()}
    </div>
  );

  // ============ 直播中页面 ============
  const renderLiveStream = () => (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden">
      {/* 摄像头预览 */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={videoStyle}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

      {/* 弹幕层 */}
      <div className="absolute top-24 left-0 right-0 z-10 overflow-hidden pointer-events-none">
        <div className="space-y-2 px-4">
          {danmakus.map((d) => (
            <div
              key={d.id}
              className={`inline-block px-3 py-1.5 rounded-full text-sm shadow-lg whitespace-nowrap animate-[slidein_8s_linear] ${
                d.isHost
                  ? 'bg-gradient-to-r from-pink-500/80 to-purple-500/80 text-white'
                  : 'bg-black/50 backdrop-blur-md text-white'
              }`}
            >
              <span className="font-medium mr-1">{d.nickname}:</span>
              {d.content}
            </div>
          ))}
        </div>
      </div>

      {/* PK 进行中横幅 */}
      {pkStatus === 'inPK' && pkTarget && (
        <div className="absolute top-20 left-4 right-4 z-20">
          <div className="bg-gradient-to-r from-orange-500/90 to-red-600/90 backdrop-blur-md rounded-2xl p-3 shadow-lg shadow-red-500/30">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4" />
                <span className="text-sm font-bold">PK 中</span>
                <span className="text-xs opacity-80">{formatDuration(pkCountdown)}</span>
              </div>
              <button
                onClick={cancelPK}
                className="text-xs bg-white/20 px-2 py-0.5 rounded-full hover:bg-white/30"
              >
                结束 PK
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 text-right">
                <p className="text-white text-xs font-bold">{pkSelfScore}</p>
                <p className="text-white/70 text-[10px]">我</p>
              </div>
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden flex">
                <div
                  className="bg-pink-400 transition-all"
                  style={{ width: `${(pkSelfScore / (pkSelfScore + pkTargetScore + 1)) * 100}%` }}
                />
                <div
                  className="bg-blue-400 transition-all"
                  style={{ width: `${(pkTargetScore / (pkSelfScore + pkTargetScore + 1)) * 100}%` }}
                />
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-bold">{pkTargetScore}</p>
                <p className="text-white/70 text-[10px] truncate">
                  {pkTarget.nickname || pkTarget.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PK 邀请中提示 */}
      {pkStatus === 'inviting' && pkTarget && (
        <div className="absolute top-20 left-4 right-4 z-20">
          <div className="bg-orange-500/90 backdrop-blur-md rounded-2xl p-3 text-center text-white">
            <p className="text-sm font-bold flex items-center justify-center gap-2">
              <Swords className="w-4 h-4 animate-pulse" />
              正在向 {pkTarget.nickname || pkTarget.title} 发送 PK 邀请...
            </p>
          </div>
        </div>
      )}

      {/* 顶部状态栏 */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleEndStream}
            className="w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-red-500/30">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
            <div className="bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs">
              <Users className="w-4 h-4" />
              <span>{formatNumber(viewers.length)}</span>
            </div>
            <div className="bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(duration)}</span>
            </div>
            <div className="bg-gradient-to-r from-pink-500/80 to-purple-500/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium">
              <Gift className="w-4 h-4" />
              <span>{formatNumber(earnings)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧工具栏 */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
        {renderToolbar(true)}
      </div>

      {/* 左侧聊天/消息浮层 */}
      <div className="absolute left-4 bottom-32 z-20 w-72 max-w-[60vw]">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 max-h-64 overflow-y-auto space-y-2" style={{ scrollbarWidth: 'thin' }}>
          {messages.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-2">等待观众互动...</p>
          ) : (
            messages.slice(-30).map((msg, index) => (
              <div key={index} className="flex gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                    msg.isHost
                      ? 'bg-gradient-to-br from-pink-500 to-purple-600'
                      : msg.isSystem
                      ? 'bg-gray-600'
                      : 'bg-gray-700'
                  }`}
                >
                  <span className="text-white">{msg.nickname?.charAt(0) || 'U'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-xs font-medium mr-1.5 ${
                      msg.isHost ? 'text-pink-400' : msg.isSystem ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    {msg.isHost ? '[主播] ' : ''}
                    {msg.nickname}
                  </span>
                  <span className="text-white text-xs break-words">{msg.content}</span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部操作区 */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-6">
        {/* 弹幕输入 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={danmakuInput}
              onChange={(e) => setDanmakuInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendDanmaku()}
              maxLength={30}
              placeholder="发送弹幕..."
              className="w-full bg-black/40 backdrop-blur-md text-white placeholder-gray-300 rounded-full px-5 py-2.5 text-sm focus:outline-none border border-white/10 focus:border-pink-500/50 transition-all"
            />
          </div>
          <button
            onClick={handleSendDanmaku}
            className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-all active:scale-95"
            title="发送弹幕"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* 操作按钮行 */}
        <div className="flex items-center gap-2">
          {/* 文字消息输入 */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="回复观众..."
              className="w-full bg-black/40 backdrop-blur-md text-white placeholder-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none border border-white/10 focus:border-pink-500/50 transition-all"
            />
          </div>

          <button
            onClick={() => setShowManagePanel(true)}
            className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all active:scale-95"
            title="管理"
          >
            <Shield className="w-5 h-5" />
          </button>

          <button
            onClick={handleShare}
            className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all active:scale-95"
            title="分享"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleEndStream}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-red-500/30 flex items-center gap-2 active:scale-95"
          >
            <Video className="w-5 h-5" />
            结束直播
          </button>
        </div>
      </div>

      {renderBeautyPanel()}
      {renderPKPanel()}
      {renderManagePanel()}
      {renderEndModal()}

      <style>{`
        @keyframes slidein {
          0% { transform: translateX(100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(-100%); opacity: 0; }
        }
      `}</style>
    </div>
  );

  return isLive ? renderLiveStream() : renderPreStream();
};

export default Broadcast;
