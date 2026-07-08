import { useState, useEffect } from 'react';
import {
  MessageCircle,
  User,
  Search,
  MoreVertical,
} from 'lucide-react';

const MessageList = ({ user, onNavigate }) => {
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    document.title = 'Gala Live - 消息';
    loadMessages();
  }, []);

  const loadMessages = () => {
    const mockMessages = [
      {
        id: 1,
        userId: 1,
        username: 'host1',
        nickname: '才艺主播小美',
        avatar: '',
        lastMessage: '谢谢支持！',
        time: '10:30',
        unread: 3,
        isHost: true,
        isFollowing: true,
        online: true,
      },
      {
        id: 2,
        userId: 2,
        username: 'host2',
        nickname: '游戏大神阿杰',
        avatar: '',
        lastMessage: '明天继续开黑！',
        time: '09:15',
        unread: 0,
        isHost: true,
        isFollowing: true,
        online: false,
      },
      {
        id: 4,
        userId: 4,
        username: 'user2',
        nickname: '土豪哥',
        avatar: '',
        lastMessage: '刷个火箭支持一下',
        time: '昨天',
        unread: 0,
        isHost: false,
        isFollowing: false,
        online: false,
      },
      {
        id: 5,
        userId: 5,
        username: 'user3',
        nickname: '新人小白',
        avatar: '',
        lastMessage: '你好，请问怎么开播？',
        time: '2天前',
        unread: 1,
        isHost: false,
        isFollowing: false,
        online: true,
      },
      {
        id: 6,
        userId: 6,
        username: 'user4',
        nickname: '路人丁',
        avatar: '',
        lastMessage: '你的视频做得很好看',
        time: '3天前',
        unread: 0,
        isHost: false,
        isFollowing: false,
        online: false,
      },
    ];
    setContacts(mockMessages);
  };

  const handleSelectContact = (contact) => {
    onNavigate('message', { chatId: contact.id });
  };

  const filteredContacts = contacts.filter((c) => {
    const matchSearch = c.nickname.toLowerCase().includes(searchText.toLowerCase()) ||
      c.username.toLowerCase().includes(searchText.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'following') return c.isFollowing;
    if (filter === 'followers') return !c.isFollowing;
    return true;
  });

  const totalUnread = contacts.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/5 to-gray-900 pb-24">
      <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">消息</h1>
            {totalUnread > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {totalUnread}
              </span>
            )}
          </div>
          <button
            className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            onClick={() => alert('新建会话功能')}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex flex-col h-[calc(100vh-72px)]">
          <div className="w-full border-r border-gray-800/50 flex flex-col">
            <div className="p-3 space-y-3">
              <div className="relative group">
                <div className="relative flex items-center bg-gray-800/80 border border-gray-700 rounded-full pl-10 pr-4 py-2.5 group-focus-within:border-pink-500/50 transition-all">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="搜索联系人..."
                    className="w-full bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'following', label: '已关注' },
                  { key: 'followers', label: '未关注' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filter === f.key
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <MessageCircle className="w-10 h-10 text-gray-600 mb-2" />
                  <p className="text-gray-400 text-sm">未找到联系人</p>
                </div>
              ) : (
                filteredContacts.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectContact(msg)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-gray-800/50 border-l-4 border-transparent`}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full p-0.5 ${
                        msg.isHost
                          ? 'bg-gradient-to-br from-pink-500 to-purple-600'
                          : 'bg-gradient-to-br from-gray-600 to-gray-500'
                      }`}>
                        <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                          {msg.avatar ? (
                            <img src={msg.avatar} alt={msg.nickname} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                      {msg.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                      )}
                      {msg.unread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {msg.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-white font-medium truncate text-sm">{msg.nickname}</p>
                          {msg.isHost && (
                            <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded flex-shrink-0">主播</span>
                          )}
                        </div>
                        <span className="text-gray-500 text-xs flex-shrink-0">{msg.time}</span>
                      </div>
                      <p className="text-gray-400 text-sm truncate">{msg.lastMessage}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessageList;