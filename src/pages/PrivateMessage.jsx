import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  User,
  ArrowLeft,
  Send,
  Search,
  Smile,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  X,
  Mic,
  Image as ImageIcon,
  Check,
  CheckCheck,
} from 'lucide-react';

const PrivateMessage = ({ user, onNavigate, chatId }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showCallModal, setShowCallModal] = useState(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    document.title = 'Gala Live - 私信';
    loadMessages();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadChatMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (chatId && contacts.length > 0) {
      const contact = contacts.find(c => c.id === parseInt(chatId));
      if (contact) {
        setSelectedChat(contact);
      }
    }
  }, [chatId, contacts]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
    if (window.innerWidth >= 768) {
      setSelectedChat(mockMessages[0]);
    }
  };

  const loadChatMessages = (chatId) => {
    const chatMap = {
      1: [
        { id: 1, userId: 1, content: '你好！', isMe: false, time: '10:00', status: 'read' },
        { id: 2, userId: user?.id, content: '你好！最近直播很棒', isMe: true, time: '10:01', status: 'read' },
        { id: 3, userId: 1, content: '谢谢支持！', isMe: false, time: '10:02', status: 'read' },
        { id: 4, userId: user?.id, content: '不客气，继续加油', isMe: true, time: '10:03', status: 'read' },
        { id: 5, userId: 1, content: '今晚8点有直播，记得来看哦', isMe: false, time: '10:05', status: 'read' },
        { id: 6, userId: user?.id, content: '好的，一定到！', isMe: true, time: '10:06', status: 'read' },
        { id: 7, userId: 1, content: '谢谢支持！', isMe: false, time: '10:30', status: 'read' },
      ],
      2: [
        { id: 1, userId: 2, content: '今晚组队打游戏吗？', isMe: false, time: '09:00', status: 'read' },
        { id: 2, userId: user?.id, content: '好啊，几点开始？', isMe: true, time: '09:05', status: 'read' },
        { id: 3, userId: 2, content: '8点不见不散', isMe: false, time: '09:10', status: 'read' },
        { id: 4, userId: 2, content: '明天继续开黑！', isMe: false, time: '09:15', status: 'read' },
      ],
    };
    setChatMessages(chatMap[chatId] || [
      { id: 1, userId: chatId, content: '你好呀！', isMe: false, time: '10:00', status: 'read' },
      { id: 2, userId: user?.id, content: '你好～', isMe: true, time: '10:01', status: 'read' },
    ]);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      userId: user?.id,
      content: inputMessage,
      isMe: true,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setInputMessage('');
    setShowEmoji(false);

    setContacts((prev) =>
      prev.map((m) =>
        m.id === selectedChat.id
          ? { ...m, lastMessage: newMessage.content, time: '刚刚', unread: 0 }
          : m
      )
    );

    setTimeout(() => {
      setChatMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'read' } : m))
      );
    }, 1500);
  };

  const handleSelectContact = (contact) => {
    setSelectedChat(contact);
    setMobileView('chat');
    setContacts((prev) =>
      prev.map((m) => (m.id === contact.id ? { ...m, unread: 0 } : m))
    );
  };

  const handleBackToList = () => {
    setMobileView('list');
    setShowChatMenu(false);
  };

  const handleAddEmoji = (emoji) => {
    setInputMessage((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleCall = (type) => {
    setShowCallModal({ type, contact: selectedChat });
    setTimeout(() => setShowCallModal(null), 4000);
  };

  const totalUnread = contacts.reduce((sum, c) => sum + c.unread, 0);

  const emojis = ['😀', '😂', '🥰', '😍', '😘', '🤔', '😎', '🥳', '😢', '😡', '👍', '👎', '❤️', '🔥', '🎉', '🎁', '🌹', '✨', '💪', '🙏'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/5 to-gray-900 flex flex-col">
      <main className="flex-1 flex flex-col">
        {/* 聊天窗口 */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
              <>
                <div className="flex items-center justify-between p-3 border-b border-gray-800/50 bg-gray-800/30">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onNavigate('message', { chatId: null })}
                      className="w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className={`w-10 h-10 rounded-full p-0.5 ${
                      selectedChat.isHost
                        ? 'bg-gradient-to-br from-pink-500 to-purple-600'
                        : 'bg-gradient-to-br from-gray-600 to-gray-500'
                    }`}>
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                        {selectedChat.avatar ? (
                          <img src={selectedChat.avatar} alt={selectedChat.nickname} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-sm">{selectedChat.nickname}</p>
                        {selectedChat.online && (
                          <span className="text-green-500 text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />在线
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs">@{selectedChat.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCall('voice')}
                      className="w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-pink-400 hover:bg-gray-700 transition-all"
                      title="语音通话"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleCall('video')}
                      className="w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-pink-400 hover:bg-gray-700 transition-all"
                      title="视频通话"
                    >
                      <Video className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowChatMenu(!showChatMenu)}
                      className="w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {showChatMenu && (
                      <div className="absolute right-4 top-16 bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-1 z-20 min-w-[140px]">
                        <button
                          onClick={() => {
                            setShowChatMenu(false);
                            alert('已清空聊天记录');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          清空记录
                        </button>
                        <button
                          onClick={() => {
                            setShowChatMenu(false);
                            alert(`已屏蔽 ${selectedChat.nickname}`);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          屏蔽用户
                        </button>
                        <button
                          onClick={() => {
                            setShowChatMenu(false);
                            alert(`已举报 ${selectedChat.nickname}`);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                        >
                          举报
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/30">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] flex ${msg.isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                        {!msg.isMe && (
                          <div className={`w-8 h-8 rounded-full p-0.5 flex-shrink-0 ${
                            selectedChat.isHost
                              ? 'bg-gradient-to-br from-pink-500 to-purple-600'
                              : 'bg-gradient-to-br from-gray-600 to-gray-500'
                          }`}>
                            <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                              {selectedChat.avatar ? (
                                <img src={selectedChat.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          msg.isMe
                            ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-br-md'
                            : 'bg-gray-800 text-white rounded-bl-md'
                        }`}>
                          <p className="text-sm break-words">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${msg.isMe ? 'justify-end' : ''}`}>
                            <span className={`text-[10px] ${msg.isMe ? 'text-white/70' : 'text-gray-400'}`}>
                              {msg.time}
                            </span>
                            {msg.isMe && msg.status === 'read' && (
                              <CheckCheck className="w-3 h-3 text-white/70" />
                            )}
                            {msg.isMe && msg.status === 'sent' && (
                              <Check className="w-3 h-3 text-white/70" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-gray-800/50 bg-gray-800/30 relative">
                  {showEmoji && (
                    <div className="absolute bottom-16 left-3 right-3 bg-gray-800 rounded-2xl border border-gray-700 p-3 grid grid-cols-10 gap-1 z-20">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-700 rounded transition-all"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                  {showAttach && (
                    <div className="absolute bottom-16 left-3 bg-gray-800 rounded-2xl border border-gray-700 p-3 z-20 min-w-[180px]">
                      <button
                        onClick={() => {
                          setShowAttach(false);
                          alert('选择图片');
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition-all text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-white text-sm">图片</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowAttach(false);
                          alert('发送语音消息');
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition-all text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <Mic className="w-5 h-5 text-orange-400" />
                        </div>
                        <span className="text-white text-sm">语音</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowAttach(false);
                          alert('选择文件');
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition-all text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Paperclip className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-white text-sm">文件</span>
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                        showAttach ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 flex items-center bg-gray-800/80 border border-gray-700 rounded-2xl pl-4 pr-1 py-1 focus-within:border-pink-500/50 transition-all">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="发送消息..."
                        className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none py-1.5"
                      />
                      <button
                        onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          showEmoji ? 'text-pink-500' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                        inputMessage.trim()
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                          : 'bg-gray-700 text-gray-500'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-12 h-12 text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-lg">选择一个联系人开始聊天</p>
                  <p className="text-gray-500 text-sm mt-2">与主播和好友保持联系</p>
                </div>
              </div>
            )}
        </div>
      </main>

      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-1 mx-auto mb-6 animate-pulse">
              <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                {showCallModal.contact.avatar ? (
                  <img src={showCallModal.contact.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">{showCallModal.contact.nickname}</h2>
            <p className="text-gray-400 mb-2">
              {showCallModal.type === 'voice' ? '语音通话中...' : '视频通话中...'}
            </p>
            <p className="text-gray-500 text-sm mb-12">正在连接...</p>
            <div className="flex items-center justify-center gap-6">
              <button className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                <Mic className="w-6 h-6" />
              </button>
              <button
                onClick={() => setShowCallModal(null)}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-red-500/30"
              >
                <X className="w-8 h-8" />
              </button>
              <button className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                {showCallModal.type === 'voice' ? <Phone className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateMessage;
