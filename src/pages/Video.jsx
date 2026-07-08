import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Heart,
  MessageCircle,
  Share2,
  User,
  MoreHorizontal,
  X,
  Flame,
  Clock,
  Users,
  Volume2,
  VolumeX,
  Flag,
  Send,
  Eye,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Gift,
  Minus,
  Plus,
  Zap,
} from 'lucide-react';
import { followAPI, giftAPI, userAPI, favoriteAPI } from '../api';

const VideoPage = ({ user, onNavigate }) => {
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('hot');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [selectedGift, setSelectedGift] = useState(null);
  const [giftCount, setGiftCount] = useState(1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [diamonds, setDiamonds] = useState(user?.diamonds || 0);
  const progressTimerRef = useRef(null);

  useEffect(() => {
    document.title = 'Gala Live - 视频';
    loadVideos();
    loadGifts();
    if (user) {
      refreshUserDiamonds();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedVideo && user) {
      checkFollowStatus();
    }
  }, [selectedVideo]);

  useEffect(() => {
    if (isPlaying && selectedVideo) {
      progressTimerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressTimerRef.current);
            setIsPlaying(false);
            return 100;
          }
          return prev + 0.4;
        });
      }, 200);
    } else {
      clearInterval(progressTimerRef.current);
    }
    return () => clearInterval(progressTimerRef.current);
  }, [isPlaying, selectedVideo]);

  const loadVideos = async () => {
    if (activeTab === 'following') {
      try {
        const response = await userAPI.getFollowingVideos();
        const data = response.data || [];
        
        let favoritedIds = [];
        if (user) {
          try {
            const favResponse = await favoriteAPI.getVideos();
            favoritedIds = (favResponse.data || []).map(f => f.id);
          } catch (favError) {
            console.error('Failed to load favorites:', favError);
          }
        }
        
        const formattedVideos = data.map(v => ({
          id: v.id,
          userId: v.user_id,
          username: v.username,
          nickname: v.nickname,
          avatar: v.avatar,
          cover: v.cover,
          title: v.title,
          description: v.description,
          likes: v.likes || 0,
          comments: v.comments || 0,
          shares: v.shares || 0,
          views: v.views || 0,
          isLiked: false,
          isFavorited: favoritedIds.includes(v.id),
          duration: formatDuration(v.duration),
          durationSec: v.duration || 180,
          createdAt: formatTimeAgo(v.created_at),
        }));
        setVideos(formattedVideos);
      } catch (error) {
        console.error('Failed to load following videos:', error);
        setVideos([]);
      }
    } else {
      const mockVideos = [
        {
          id: 1,
          userId: 1,
          username: 'host1',
          nickname: '才艺主播小美',
          avatar: '',
          cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20female%20singer%20performing%20on%20stage&image_size=portrait_9_16',
          title: '今天给大家唱一首好听的歌',
          description: '这是我最喜欢的一首歌，从前奏到副歌都充满感情，希望你们也能感受到这份温暖。记得点赞关注哦，今晚8点直播间见！',
          likes: 2580,
          comments: 320,
          shares: 156,
          views: 12500,
          isLiked: false,
          isFavorited: false,
          duration: '3:45',
          durationSec: 225,
          createdAt: '2小时前',
        },
        {
          id: 2,
          userId: 2,
          username: 'host2',
          nickname: '游戏大神阿杰',
          avatar: '',
          cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gaming%20streamer%20playing%20competitive%20game&image_size=portrait_9_16',
          title: '五杀精彩时刻！这操作太秀了',
          description: '昨晚直播时打出的五杀操作，团队配合完美，走位细节满满，喜欢的话点个赞支持一下！',
          likes: 5680,
          comments: 890,
          shares: 420,
          views: 35000,
          isLiked: true,
          isFavorited: false,
          duration: '1:23',
          durationSec: 83,
          createdAt: '5小时前',
        },
        {
          id: 3,
          userId: 4,
          username: 'host4',
          nickname: '美食达人小雨',
          avatar: '',
          cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20chinese%20food%20cooking%20video&image_size=portrait_9_16',
          title: '红烧肉制作教程，超级下饭',
          description: '详细讲解了红烧肉的选料、焯水、炒糖色、炖煮全过程，新手也能做出饭店味道！',
          likes: 1890,
          comments: 256,
          shares: 89,
          views: 8900,
          isLiked: false,
          isFavorited: true,
          duration: '5:12',
          durationSec: 312,
          createdAt: '8小时前',
        },
        {
          id: 4,
          userId: 5,
          username: 'host5',
          nickname: '脱口秀小王',
          avatar: '',
          cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=standup%20comedy%20performance%20funny&image_size=portrait_9_16',
          title: '今天的段子太好笑了，笑到肚子疼',
          description: '现场脱口秀片段，讲的是上班族的故事，希望大家在忙碌之余能笑一笑。',
          likes: 3420,
          comments: 567,
          shares: 234,
          views: 22000,
          isLiked: false,
          isFavorited: false,
          duration: '4:30',
          durationSec: 270,
          createdAt: '12小时前',
        },
        {
          id: 5,
          userId: 1,
          username: 'host1',
          nickname: '才艺主播小美',
          avatar: '',
          cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20dancer%20performing%20modern%20dance&image_size=portrait_9_16',
          title: '新学的舞蹈，希望大家喜欢',
          description: '练习了一个月的新舞蹈，今天终于录给大家看了，舞步里融入了一些民族风元素，求指导！',
          likes: 4120,
          comments: 678,
          shares: 345,
          views: 28000,
          isLiked: true,
          isFavorited: false,
          duration: '2:58',
          durationSec: 178,
          createdAt: '1天前',
        },
        {
          id: 6,
          userId: 3,
          username: 'host3',
          nickname: '户外探险家',
          avatar: '',
          cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20adventure%20hiking%20beautiful%20nature&image_size=portrait_9_16',
          title: '今天带大家看最美的风景',
          description: '海拔3800米的高山湖泊，水清见底，远处雪山巍峨。大自然的鬼斧神工，值得每个人去看看。',
          likes: 6780,
          comments: 934,
          shares: 567,
          views: 45000,
          isLiked: false,
          isFavorited: false,
          duration: '6:24',
          durationSec: 384,
          createdAt: '2天前',
        },
      ];
      setVideos(mockVideos);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (dateStr) => {
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

  const loadComments = (videoId) => {
    const mockComments = [
      { id: 1, userId: 11, nickname: '路人甲', avatar: '', content: '这个视频太棒了！', time: '1小时前', likes: 12 },
      { id: 2, userId: 12, nickname: '小粉丝', avatar: '', content: '主播好厉害，关注了！', time: '2小时前', likes: 8 },
      { id: 3, userId: 13, nickname: '路人乙', avatar: '', content: '这操作真的服气，求教程', time: '3小时前', likes: 5 },
      { id: 4, userId: 14, nickname: '路过的人', avatar: '', content: '前几个视频也都很好看', time: '5小时前', likes: 3 },
    ];
    setComments(mockComments);
  };

  const loadGifts = async () => {
    try {
      const response = await giftAPI.getGifts();
      setGifts(response.data || []);
    } catch (error) {
      console.error('Failed to load gifts:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!selectedVideo?.userId || !user) return;
    try {
      const response = await followAPI.checkFollow(selectedVideo.userId);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!selectedVideo?.userId || !user) return;
    try {
      if (isFollowing) {
        await followAPI.unfollow({ followeeId: selectedVideo.userId });
      } else {
        await followAPI.follow({ followeeId: selectedVideo.userId });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      alert(error.response?.data?.error || '操作失败');
    }
  };

  const handleSendGift = async () => {
    if (!selectedGift || !user || !selectedVideo) return;
    try {
      await giftAPI.sendGift({
        roomId: 'video_' + selectedVideo.id,
        giftId: selectedGift.id,
        count: giftCount,
      });
      setDiamonds(prev => prev - selectedGift.price * giftCount);
      setShowGiftPanel(false);
      setSelectedGift(null);
      setGiftCount(1);
      alert(`成功送出 ${selectedGift.name} x${giftCount}！`);
    } catch (error) {
      alert(error.response?.data?.error || '发送失败');
    }
  };

  const refreshUserDiamonds = async () => {
    if (!user) return;
    try {
      const response = await userAPI.getUser(user.id);
      setDiamonds(response.data.diamonds || 0);
    } catch (error) {
      console.error('Failed to refresh user diamonds:', error);
    }
  };

  const handleLike = (videoId) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, isLiked: !v.isLiked, likes: v.isLiked ? v.likes - 1 : v.likes + 1 } : v
      )
    );
    if (selectedVideo && selectedVideo.id === videoId) {
      setSelectedVideo((prev) => ({
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      }));
    }
  };

  const handleFavorite = async (videoId) => {
    const isCurrentlyFavorited = selectedVideo?.id === videoId ? selectedVideo.isFavorited : videos.find(v => v.id === videoId)?.isFavorited;
    
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, isFavorited: !isCurrentlyFavorited } : v))
    );
    if (selectedVideo && selectedVideo.id === videoId) {
      setSelectedVideo((prev) => ({ ...prev, isFavorited: !prev.isFavorited }));
    }

    try {
      if (isCurrentlyFavorited) {
        await favoriteAPI.removeVideo(videoId);
      } else {
        await favoriteAPI.addVideo({ videoId });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleShare = async (video) => {
    const shareData = {
      title: `${video.nickname} 的视频 - Gala Live`,
      text: video.title,
      url: `${window.location.origin}/video/${video.id}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
        alert('链接已复制到剪贴板');
      }
    } catch (err) {
      // 用户取消分享，无需处理
    }
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, shares: v.shares + 1 } : v))
    );
  };

  const handleSendComment = () => {
    if (!commentText.trim() || !selectedVideo) return;
    const newComment = {
      id: Date.now(),
      userId: user?.id || 0,
      nickname: user?.nickname || '我',
      avatar: user?.avatar || '',
      content: commentText,
      time: '刚刚',
      likes: 0,
    };
    setComments((prev) => [newComment, ...prev]);
    setCommentText('');
    setVideos((prev) =>
      prev.map((v) => (v.id === selectedVideo.id ? { ...v, comments: v.comments + 1 } : v))
    );
    setSelectedVideo((prev) => ({ ...prev, comments: prev.comments + 1 }));
  };

  const openVideo = (video) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    setProgress(0);
    setShowComments(false);
    setShowDescription(false);
    setShowReport(false);
    setShowManage(false);
    loadComments(video.id);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
    setProgress(0);
    setShowComments(false);
    setShowDescription(false);
    setShowReport(false);
    setShowManage(false);
    setCommentText('');
  };

  const formatNumber = (num) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    setProgress(Math.max(0, Math.min(100, percent)));
  };

  const tabConfigs = {
    hot: {
      label: '热门',
      icon: Flame,
      gradient: 'from-red-500 via-pink-500 to-orange-500',
      shadow: 'shadow-pink-500/30',
    },
    latest: {
      label: '最新',
      icon: Clock,
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      shadow: 'shadow-blue-500/30',
    },
    following: {
      label: '关注',
      icon: Users,
      gradient: 'from-purple-500 via-pink-500 to-indigo-500',
      shadow: 'shadow-purple-500/30',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/5 to-gray-900 pb-24">
      <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white text-center mb-5">精彩视频</h1>

          <div className="flex gap-3">
            {Object.keys(tabConfigs).map((key) => {
              const cfg = tabConfigs[key];
              const Icon = cfg.icon;
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    active
                      ? `bg-gradient-to-r ${cfg.gradient} text-white shadow-lg ${cfg.shadow}`
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
              <Play className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400">暂无视频内容</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-800/50 rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 group"
                onClick={() => openVideo(video)}
              >
                <div className="relative aspect-[9/16] overflow-hidden">
                  <img
                    src={video.cover}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className="bg-black/50 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full">
                      {video.duration}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-full">
                    <Eye className="w-3 h-3" />
                    {formatNumber(video.views)}
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-full">
                    <Heart className={`w-3 h-3 ${video.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {formatNumber(video.likes)}
                  </div>

                  <div className="absolute top-3 right-3">
                    <button
                      className="w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openVideo(video);
                        setShowManage(true);
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <p className="text-white text-sm font-medium line-clamp-2 mb-3 group-hover:text-pink-400 transition-colors">
                    {video.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate && onNavigate('profile', { userId: video.userId });
                      }}
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
                        <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs font-medium">{video.nickname}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {formatNumber(video.comments)}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Share2 className="w-3.5 h-3.5" />
                        {formatNumber(video.shares)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedVideo && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-0 md:p-4">
          <div
            className="relative w-full h-full md:max-w-lg md:max-h-[90vh] md:rounded-3xl overflow-hidden bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <img
                src={selectedVideo.cover}
                alt={selectedVideo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {!isPlaying && (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-all pointer-events-auto"
                  >
                    <Play className="w-10 h-10 text-white ml-1" />
                  </button>
                )}
              </div>

              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                <button
                  onClick={closeVideo}
                  className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setShowManage(true)}
                    className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div
                className="absolute left-0 right-0 bottom-0 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate && onNavigate('profile', { userId: selectedVideo.userId });
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">{selectedVideo.nickname}</p>
                    <p className="text-gray-400 text-xs">@{selectedVideo.username} · {selectedVideo.createdAt}</p>
                  </div>
                  <button
                    onClick={handleFollow}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all ${
                      isFollowing
                        ? 'bg-gray-700/80 text-gray-300'
                        : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    }`}
                  >
                    {isFollowing ? '已关注' : '+ 关注'}
                  </button>
                </div>

                <button
                  onClick={() => setShowDescription(true)}
                  className="text-left w-full mb-4"
                >
                  <p className="text-white text-sm font-medium line-clamp-2">{selectedVideo.title}</p>
                  <p className="text-gray-300 text-xs mt-1 line-clamp-1">{selectedVideo.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {selectedVideo.views.toLocaleString()} 次播放
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {selectedVideo.likes.toLocaleString()} 人点赞
                    </span>
                  </div>
                </button>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => handleLike(selectedVideo.id)}
                      className={`flex flex-col items-center gap-1 transition-all ${
                        selectedVideo.isLiked ? 'text-red-500' : 'text-white'
                      }`}
                    >
                      <Heart className={`w-7 h-7 transition-transform ${selectedVideo.isLiked ? 'fill-current scale-110' : ''}`} />
                      <span className="text-xs font-bold">{formatNumber(selectedVideo.likes)}</span>
                    </button>
                    <button
                      onClick={() => setShowComments(true)}
                      className="flex flex-col items-center gap-1 text-white hover:text-pink-400 transition-colors"
                    >
                      <MessageCircle className="w-7 h-7" />
                      <span className="text-xs font-bold">{formatNumber(selectedVideo.comments)}</span>
                    </button>
                    <button
                      onClick={() => handleFavorite(selectedVideo.id)}
                      className={`flex flex-col items-center gap-1 transition-all ${
                        selectedVideo.isFavorited ? 'text-yellow-500' : 'text-white'
                      }`}
                    >
                      {selectedVideo.isFavorited ? (
                        <BookmarkCheck className="w-7 h-7" />
                      ) : (
                        <Bookmark className="w-7 h-7" />
                      )}
                      <span className="text-xs font-bold">收藏</span>
                    </button>
                    <button
                      onClick={() => setShowGiftPanel(true)}
                      className="flex flex-col items-center gap-1 text-white hover:text-purple-400 transition-colors"
                    >
                      <Gift className="w-7 h-7" />
                      <span className="text-xs font-bold">送礼</span>
                    </button>
                    <div className="flex flex-col items-center gap-1 text-yellow-400">
                      <span className="text-lg">💎</span>
                      <span className="text-xs font-bold">{diamonds}</span>
                    </div>
                    <button
                      onClick={() => handleShare(selectedVideo)}
                      className="flex flex-col items-center gap-1 text-white hover:text-blue-400 transition-colors"
                    >
                      <Share2 className="w-7 h-7" />
                      <span className="text-xs font-bold">{formatNumber(selectedVideo.shares)}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowReport(true)}
                    className="flex flex-col items-center gap-1 text-white hover:text-yellow-400 transition-colors"
                  >
                    <Flag className="w-7 h-7" />
                    <span className="text-xs font-bold">举报</span>
                  </button>
                </div>

                <div className="mt-4">
                  <div
                    className="h-1 bg-white/20 rounded-full cursor-pointer relative"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <span className="text-gray-300 text-xs">
                      {formatTime((progress / 100) * selectedVideo.durationSec)} / {selectedVideo.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showDescription && (
            <div
              className="absolute inset-0 z-40 flex items-end md:items-center justify-center"
              onClick={() => setShowDescription(false)}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div
                className="relative w-full md:max-w-lg bg-gray-900 rounded-t-3xl md:rounded-3xl p-6 max-h-[70vh] overflow-y-auto border border-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-bold">视频简介</h3>
                  <button
                    onClick={() => setShowDescription(false)}
                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-bold">{selectedVideo.nickname}</p>
                    <p className="text-gray-400 text-xs">@{selectedVideo.username}</p>
                  </div>
                </div>
                <p className="text-white font-medium mb-2">{selectedVideo.title}</p>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">{selectedVideo.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 border-t border-gray-800 pt-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {selectedVideo.views.toLocaleString()} 次播放
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" /> {selectedVideo.likes.toLocaleString()} 人点赞
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" /> {selectedVideo.comments.toLocaleString()} 条评论
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-3">发布时间：{selectedVideo.createdAt}</p>
              </div>
            </div>
          )}

          {showComments && (
            <div
              className="absolute inset-0 z-40 flex items-end md:items-center justify-center"
              onClick={() => setShowComments(false)}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div
                className="relative w-full md:max-w-lg bg-gray-900 rounded-t-3xl md:rounded-3xl flex flex-col max-h-[75vh] border border-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <h3 className="text-white text-lg font-bold">{comments.length} 条评论</h3>
                  <button
                    onClick={() => setShowComments(false)}
                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <MessageCircle className="w-10 h-10 text-gray-600 mb-2" />
                      <p className="text-gray-400 text-sm">还没有评论，快来抢沙发吧</p>
                    </div>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-500 p-0.5 flex-shrink-0">
                          <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white text-sm font-medium">{c.nickname}</p>
                            <span className="text-gray-500 text-xs">{c.time}</span>
                          </div>
                          <p className="text-gray-200 text-sm break-words">{c.content}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button className="flex items-center gap-1 text-gray-400 text-xs hover:text-red-500 transition-colors">
                              <Heart className="w-3.5 h-3.5" />
                              {c.likes}
                            </button>
                            <button className="text-gray-400 text-xs hover:text-white transition-colors">回复</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5 flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 flex items-center bg-gray-800 border border-gray-700 rounded-full pl-4 pr-1 py-1 focus-within:border-pink-500/50 transition-all">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                        placeholder="说点什么..."
                        className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
                      />
                      <button
                        onClick={handleSendComment}
                        disabled={!commentText.trim()}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          commentText.trim()
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'bg-gray-700 text-gray-500'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showReport && (
            <div
              className="absolute inset-0 z-40 flex items-end md:items-center justify-center"
              onClick={() => setShowReport(false)}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div
                className="relative w-full md:max-w-md bg-gray-900 rounded-t-3xl md:rounded-3xl p-6 border border-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-bold flex items-center gap-2">
                    <Flag className="w-5 h-5 text-yellow-500" /> 举报
                  </h3>
                  <button
                    onClick={() => setShowReport(false)}
                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-400 text-sm mb-4">请选择举报对象</p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      alert(`已举报用户 ${selectedVideo.nickname}，我们将尽快处理`);
                      setShowReport(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">举报发布者</p>
                      <p className="text-gray-500 text-xs">{selectedVideo.nickname}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => {
                      alert('已举报该视频，我们将尽快处理');
                      setShowReport(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Flag className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">举报此视频</p>
                      <p className="text-gray-500 text-xs">违规内容、虚假信息等</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {showManage && (
            <div
              className="absolute inset-0 z-40 flex items-end md:items-center justify-center"
              onClick={() => setShowManage(false)}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div
                className="relative w-full md:max-w-md bg-gray-900 rounded-t-3xl md:rounded-3xl p-6 border border-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-bold">管理</h3>
                  <button
                    onClick={() => setShowManage(false)}
                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">{selectedVideo.nickname}</p>
                    <p className="text-gray-400 text-xs">@{selectedVideo.username}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowManage(false);
                      onNavigate && onNavigate('profile', { userId: selectedVideo.userId });
                    }}
                    className="text-pink-500 text-sm font-medium"
                  >
                    查看
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                    <Eye className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-white text-sm font-bold">{formatNumber(selectedVideo.views)}</p>
                    <p className="text-gray-500 text-xs">播放数</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                    <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <p className="text-white text-sm font-bold">{formatNumber(selectedVideo.likes)}</p>
                    <p className="text-gray-500 text-xs">点赞人数</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                    <MessageCircle className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                    <p className="text-white text-sm font-bold">{formatNumber(selectedVideo.comments)}</p>
                    <p className="text-gray-500 text-xs">评论数</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mb-2">视频简介</p>
                <p className="text-gray-200 text-sm mb-4 leading-relaxed">{selectedVideo.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setShowManage(false);
                      setShowDescription(true);
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-gray-800 rounded-xl text-white text-sm font-medium hover:bg-gray-700 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> 查看简介
                  </button>
                  <button
                    onClick={() => {
                      setShowManage(false);
                      setShowReport(true);
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-red-500/10 rounded-xl text-red-500 text-sm font-medium hover:bg-red-500/20 transition-all"
                  >
                    <Flag className="w-4 h-4" /> 举报
                  </button>
                </div>
              </div>
            </div>
          )}

          {showGiftPanel && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50" onClick={() => setShowGiftPanel(false)}>
              <div className="bg-gray-900 w-full max-w-lg rounded-t-3xl p-5 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

                    <button
                      onClick={handleSendGift}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl"
                    >
                      送出 ({selectedGift.price * giftCount} 💎)
                    </button>
                    <p className="text-center text-gray-500 text-xs mt-2">当前余额: {diamonds} 💎</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default VideoPage;
