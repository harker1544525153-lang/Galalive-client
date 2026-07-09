import { useState, useEffect } from 'react';
import { Home, User, Video, MessageCircle, Radio } from 'lucide-react';
import Logo from './components/Logo';
import Toast from './components/Toast';
import useToast from './hooks/useToast';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/Home';
import Live from './pages/Live';
import Broadcast from './pages/Broadcast';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Leaderboard from './pages/Leaderboard';
import VideoPage from './pages/Video';
import Settings from './pages/Settings';
import MessageList from './pages/MessageList';
import PrivateMessage from './pages/PrivateMessage';
import GiftHistory from './pages/GiftHistory';
import ShareProfit from './pages/ShareProfit';
import Notifications from './pages/Notifications';
import HelpCenter from './pages/HelpCenter';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [match, setMatch] = useState({ params: {} });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [followingVersion, setFollowingVersion] = useState(0);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setUser(parsedUser);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      const defaultUser = {
        id: 1,
        username: 'host1',
        nickname: '才艺主播小美',
        level: 10,
        diamonds: 5000,
        coins: 10000,
        is_host: 1,
        gender: 'female',
        signature: '唱歌跳舞样样精通~',
        address: '北京',
        created_at: '2026-07-08 13:42:35'
      };
      setUser(defaultUser);
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJob3N0MSIsImlhdCI6MTc4MzUxOTc4MCwiZXhwIjoxNzgzNjA2MTgwfQ.WmfL12v3ICsu_OyTr0Cv9p4Vmr4_8Mg7KQamZ_P3TeE');
      localStorage.setItem('user', JSON.stringify(defaultUser));
    }
    
    const updatePageFromUrl = () => {
      const path = window.location.pathname;
      if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/register') {
        setCurrentPage('register');
      } else if (path.startsWith('/live/')) {
        setCurrentPage('live');
        setMatch({ params: { roomId: path.split('/')[2] } });
      } else if (path === '/broadcast') {
        setCurrentPage('broadcast');
      } else if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/search') {
        setCurrentPage('search');
        const urlParams = new URLSearchParams(window.location.search);
        setSearchKeyword(urlParams.get('keyword') || '');
      } else if (path === '/leaderboard') {
        setCurrentPage('leaderboard');
      } else if (path === '/video') {
        setCurrentPage('video');
      } else if (path === '/settings') {
        setCurrentPage('settings');
      } else if (path.startsWith('/message/')) {
          setCurrentPage('message');
          setMatch({ params: { chatId: path.split('/')[2] } });
        } else if (path === '/message') {
          setCurrentPage('message');
        } else if (path === '/gifthistory') {
          setCurrentPage('gifthistory');
        } else if (path === '/shareprofit') {
          setCurrentPage('shareprofit');
        } else if (path === '/notifications') {
          setCurrentPage('notifications');
        } else if (path === '/help') {
          setCurrentPage('help');
        } else {
        setCurrentPage('home');
      }
    };
    
    updatePageFromUrl();
    
    const handlePopState = () => {
      updatePageFromUrl();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleFollowChange = () => {
    setFollowingVersion(prev => prev + 1);
  };

  const handleNavigate = (page, params = {}) => {
    setCurrentPage(page);
    if (params.roomId) {
      setMatch({ params });
      window.history.pushState({}, '', `/live/${params.roomId}`);
    } else if (params.keyword) {
      setSearchKeyword(params.keyword);
      window.history.pushState({}, '', `/search?keyword=${params.keyword}`);
    } else if (params.chatId !== undefined) {
      if (params.chatId === null) {
        setMatch({ params: {} });
        window.history.pushState({}, '', '/message');
      } else {
        setMatch({ params });
        window.history.pushState({}, '', `/message/${params.chatId}`);
      }
    } else {
      setMatch({ params: {} });
      window.history.pushState({}, '', `/${page === 'home' ? '' : page}`);
    }
  };

  if (!user) {
    if (currentPage === 'register') {
      return <Register onLogin={handleLogin} onNavigate={handleNavigate} />;
    }
    return <Login onLogin={handleLogin} onNavigate={handleNavigate} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage user={user} onNavigate={handleNavigate} followingVersion={followingVersion} />;
      case 'live':
        return <Live user={user} match={match} onFollowChange={handleFollowChange} showToast={showToast} />;
      case 'broadcast':
        return <Broadcast user={user} onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile user={user} onLogout={handleLogout} onNavigate={handleNavigate} onUpdateUser={updateUser} followingVersion={followingVersion} />;
      case 'search':
        return <Search user={user} keyword={searchKeyword} onNavigate={handleNavigate} />;
      case 'leaderboard':
        return <Leaderboard user={user} onNavigate={handleNavigate} />;
      case 'video':
        return <VideoPage user={user} onNavigate={handleNavigate} followingVersion={followingVersion} onFollowChange={handleFollowChange} showToast={showToast} />;
      case 'settings':
        return <Settings user={user} onNavigate={handleNavigate} />;
      case 'message':
        return match.params.chatId 
          ? <PrivateMessage user={user} onNavigate={handleNavigate} chatId={match.params.chatId} />
          : <MessageList user={user} onNavigate={handleNavigate} />;
      case 'gifthistory':
        return <GiftHistory user={user} onNavigate={handleNavigate} />;
      case 'shareprofit':
        return <ShareProfit user={user} onNavigate={handleNavigate} />;
      case 'notifications':
        return <Notifications user={user} onNavigate={handleNavigate} />;
      case 'help':
        return <HelpCenter user={user} onNavigate={handleNavigate} />;
      default:
        return <HomePage user={user} onNavigate={handleNavigate} followingVersion={followingVersion} />;
    }
  };

  const showBottomNav = !['login', 'live', 'broadcast', 'search', 'leaderboard', 'settings'].includes(currentPage) && !match.params.chatId;

  const isHost = user?.is_host === 1;

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <div className={`transition-all duration-300 ${showBottomNav ? 'pb-20' : ''}`}>
        {renderPage()}
      </div>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/98 backdrop-blur-xl border-t border-gray-800 z-50 pb-safe">
          <div className="flex items-center justify-around py-3">
            <button
              onClick={() => handleNavigate('home')}
              className={`flex flex-col items-center gap-1.5 px-4 py-1.5 transition-all duration-300 ${
                currentPage === 'home' ? 'text-pink-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Home className={`w-6 h-6 transition-transform duration-300 ${currentPage === 'home' ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium ${currentPage === 'home' ? 'font-semibold' : ''}`}>首页</span>
            </button>
            
            <button
              onClick={() => handleNavigate('video')}
              className={`flex flex-col items-center gap-1.5 px-4 py-1.5 transition-all duration-300 ${
                currentPage === 'video' ? 'text-pink-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Video className={`w-6 h-6 transition-transform duration-300 ${currentPage === 'video' ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium ${currentPage === 'video' ? 'font-semibold' : ''}`}>视频</span>
            </button>
            
            {isHost && (
              <button
                onClick={() => handleNavigate('broadcast')}
                className="relative flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/40 hover:scale-110 active:scale-95 transition-transform duration-300">
                  <Radio className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs text-white mt-2 font-medium">直播</span>
              </button>
            )}
            
            <button
              onClick={() => handleNavigate('message')}
              className={`flex flex-col items-center gap-1.5 px-4 py-1.5 transition-all duration-300 relative ${
                currentPage === 'message' ? 'text-pink-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="relative">
                <MessageCircle className={`w-6 h-6 transition-transform duration-300 ${currentPage === 'message' ? 'scale-110' : ''}`} />
                <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900" />
              </div>
              <span className={`text-xs font-medium ${currentPage === 'message' ? 'font-semibold' : ''}`}>消息</span>
            </button>
            
            <button
              onClick={() => handleNavigate('profile')}
              className={`flex flex-col items-center gap-1.5 px-4 py-1.5 transition-all duration-300 ${
                currentPage === 'profile' ? 'text-pink-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <User className={`w-6 h-6 transition-transform duration-300 ${currentPage === 'profile' ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium ${currentPage === 'profile' ? 'font-semibold' : ''}`}>我的</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;
