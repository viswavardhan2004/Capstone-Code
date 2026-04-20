import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MessageSquare, Search, MoreVertical, CheckCheck, Clock, Smile } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';

function Avatar({ name, online = false }) {
  const initials = (name || '').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  return (
    <div className="relative flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-purple-600 flex items-center justify-center text-sm font-semibold text-white shadow-md">
        {initials || '?'}
      </div>
      {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-brand-dark"></div>}
    </div>
  );
}

function formatTime(date) {
  const now = new Date();
  const msgDate = new Date(date);
  const diffMs = now - msgDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatMessageTime(date) {
  const msgDate = new Date(date);
  return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Messages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTarget = searchParams.get('user');

  const [currentUser] = useState(() => localStorage.getItem('userEmail') || localStorage.getItem('userId'));
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(initialTarget || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        const url = `${API_URL}/messages/conversations/${encodeURIComponent(currentUser)}`;
        console.log('Fetching conversations from:', url);
        const res = await fetch(url);
        if (!res.ok) {
          console.error('Failed to fetch conversations:', res.status);
          return;
        }
        const data = await res.json();
        console.log('Conversations loaded:', data.length);
        console.log('First conversation object:', data[0]);
        console.log('Full data:', JSON.stringify(data, null, 2));
        setConversations(data);
      } catch (e) {
        console.error('Error loading conversations:', e);
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !activeChat) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const url = `${API_URL}/messages/conversation/${encodeURIComponent(currentUser)}/${encodeURIComponent(activeChat)}`;
        console.log('Fetching messages from:', url);
        const res = await fetch(url);
        console.log('Response status:', res.status);
        if (!res.ok) {
          console.error('Failed to fetch messages:', res.status);
          return;
        }
        const data = await res.json();
        console.log('Messages loaded:', data.length);
        if (!mounted) return;
        setMessages(data);
        await fetch(`${API_URL}/messages/mark-read`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser, otherUserId: activeChat })
        });
      } catch (e) {
        console.error('Error loading messages:', e);
      } finally { setLoading(false); }
    };
    load();
    const t = setInterval(load, 3000);
    return () => { mounted = false; clearInterval(t); };
  }, [currentUser, activeChat]);

  const getName = (id) => {
    const c = conversations.find(x => (x.otherUser === id) || (x.otherUserId === id));
    return c?.otherUserName || c?.otherUser || id.split('@')[0];
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !activeChat || sending) return;
    
    const messageText = text.trim();
    setText('');
    setSending(true);
    
    // Optimistic update
    const tempMsg = {
      id: Date.now(),
      sender: currentUser,
      receiver: activeChat,
      text: messageText,
      timestamp: new Date().toISOString(),
      pending: true
    };
    setMessages(prev => [...prev, tempMsg]);
    
    try {
      const res = await fetch(`${API_URL}/messages/send`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: currentUser, receiver: activeChat, text: messageText })
      });
      if (!res.ok) throw new Error('send failed');
      const { data } = await res.json();
      
      // Replace temp message with real one
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
      
      // Refresh conversations
      const convRes = await fetch(`${API_URL}/messages/conversations/${encodeURIComponent(currentUser)}`);
      if (convRes.ok) setConversations(await convRes.json());
    } catch (err) { 
      console.error(err);
      // Remove failed message
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setText(messageText); // Restore text
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const name = conv.otherUserName || conv.otherUser || conv.otherUserId || '';
    const lastMsg = conv.lastMessage?.text || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           lastMsg.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-8 pt-24">
      <div className="text-center text-white/90">
        <p className="text-xl font-semibold">Please log in to view messages</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand-dark to-purple-950/20 p-3 md:p-4 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-brand-orange/20 rounded-xl">
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-brand-orange" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-white">Messages</h1>
              <p className="text-xs md:text-sm text-white/60">{conversations.length} active conversations</p>
            </div>
          </div>
        </div>

        <div className="flex gap-0 md:gap-4 bg-brand-card/50 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 overflow-hidden shadow-2xl" style={{ height: 'calc(100vh - 140px)' }}>
          {/* Conversations Sidebar */}
          <aside className={`${activeChat ? 'hidden' : 'w-full md:w-96'} md:flex md:flex-col border-r border-white/10 flex-shrink-0 bg-brand-dark/30`}>
            <div className="p-3 md:p-4 border-b border-white/10 bg-brand-dark/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-base md:text-lg font-bold text-white">Chats</div>
                  <div className="text-xs text-white/60">{filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange/50 transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-white/60">
                  {searchQuery ? (
                    <>
                      <Search className="w-12 h-12 mx-auto mb-3 text-white/30" />
                      <p className="text-sm">No conversations found</p>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-white/30" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs text-white/40 mt-1">Start chatting with someone!</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredConversations.map(conv => {
                    const otherId = conv.otherUser || conv.otherUserId || null;
                    const id = otherId || conv.otherUserName || conv.conversationId;
                    const isActive = activeChat === id;
                    return (
                      <div 
                        key={conv.conversationId} 
                        onClick={() => {
                          setActiveChat(id);
                          setSearchQuery('');
                        }}
                        className={`flex items-start gap-3 p-3 md:p-4 cursor-pointer transition-all duration-200 relative
                          ${isActive 
                            ? 'bg-gradient-to-r from-brand-orange/20 to-transparent border-l-4 border-brand-orange' 
                            : 'hover:bg-white/5'
                          }`}
                      >
                        <Avatar 
                          name={conv.otherUserName || conv.otherUser || conv.otherUserId}
                          online={Math.random() > 0.5}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className={`font-semibold truncate text-sm ${isActive ? 'text-white' : 'text-white/90'}`}>
                              {conv.otherUserName || conv.otherUser || conv.otherUserId}
                            </div>
                            <div className="text-xs text-white/50 whitespace-nowrap">
                              {conv.lastMessage ? formatTime(conv.lastMessage.timestamp) : ''}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-white/90 font-medium' : 'text-white/50'}`}>
                              {conv.lastMessage?.text || 'No messages yet'}
                            </div>
                            {conv.unreadCount > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-brand-orange text-white text-xs rounded-full flex-shrink-0 font-semibold shadow-md">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className={`${activeChat ? 'w-full' : 'hidden md:flex md:flex-1'} flex-col flex overflow-hidden bg-gradient-to-b from-brand-dark/20 to-transparent`}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <header className="flex items-center justify-between p-3 md:p-4 border-b border-white/10 bg-brand-dark/60 backdrop-blur-md gap-2">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    <button 
                      onClick={() => setActiveChat(null)} 
                      className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex-shrink-0 md:hidden transition-all active:scale-95"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Avatar name={getName(activeChat)} online={true} />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white truncate text-sm md:text-base">
                        {getName(activeChat)}
                      </div>
                      <div className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Active now
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/profile/${activeChat}`)} 
                      className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-xs md:text-sm whitespace-nowrap transition-all hover:scale-105 font-medium"
                    >
                      View Profile
                    </button>
                  </div>
                </header>

                {/* Messages Container */}
                <div 
                  ref={containerRef} 
                  className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 min-h-0 custom-scrollbar"
                  style={{
                    background: 'radial-gradient(circle at top right, rgba(255, 107, 0, 0.05), transparent 50%), radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.05), transparent 50%)'
                  }}
                >
                  {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mx-auto mb-3"></div>
                        <div className="text-white/60 text-sm">Loading messages...</div>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <div className="text-white/60 text-sm mb-2">No messages yet</div>
                        <div className="text-white/40 text-xs">Send a message to start the conversation 👋</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, index) => {
                        const isSent = msg.sender === currentUser;
                        const showDate = index === 0 || 
                          new Date(messages[index - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();
                        
                        return (
                          <React.Fragment key={msg.id}>
                            {showDate && (
                              <div className="flex justify-center my-4">
                                <div className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm text-xs text-white/50 border border-white/10">
                                  {new Date(msg.timestamp).toLocaleDateString([], { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </div>
                            )}
                            <div className={`flex items-end gap-2 ${isSent ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                              {!isSent && (
                                <Avatar name={getName(activeChat)} />
                              )}
                              <div className={`group relative max-w-[85%] md:max-w-[70%] ${isSent ? 'order-1' : 'order-2'}`}>
                                <div 
                                  className={`px-3 md:px-4 py-2 md:py-3 rounded-2xl text-sm shadow-lg transition-all
                                    ${isSent 
                                      ? 'bg-gradient-to-br from-brand-orange to-orange-600 text-white rounded-br-md' 
                                      : 'bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-bl-md'
                                    }
                                    ${msg.pending ? 'opacity-60' : 'hover:shadow-xl'}
                                  `}
                                >
                                  <div className="break-words whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                                  <div className={`flex items-center gap-1 justify-end mt-1 text-xs ${isSent ? 'text-white/70' : 'text-white/50'}`}>
                                    {formatMessageTime(msg.timestamp)}
                                    {isSent && (
                                      msg.pending ? (
                                        <Clock className="w-3 h-3 ml-1" />
                                      ) : (
                                        <CheckCheck className="w-3 h-3 ml-1" />
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Message Input */}
                <form 
                  onSubmit={sendMessage} 
                  className="p-3 md:p-4 border-t border-white/10 flex items-end gap-2 flex-shrink-0 bg-brand-dark/40 backdrop-blur-md"
                >
                  <div className="flex-1 relative">
                    <input 
                      ref={inputRef}
                      value={text} 
                      onChange={e => setText(e.target.value)} 
                      placeholder="Type a message..." 
                      disabled={sending}
                      className="w-full px-4 md:px-5 py-2.5 md:py-3 pr-10 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange/50 text-sm transition-all disabled:opacity-50"
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    type="submit" 
                    disabled={!text.trim() || sending} 
                    className="p-3 bg-gradient-to-br from-brand-orange to-orange-600 rounded-2xl text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex-shrink-0 disabled:hover:scale-100"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-4">
                <div className="max-w-md">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-brand-orange/20 to-purple-600/20 flex items-center justify-center">
                    <MessageSquare className="w-12 h-12 text-brand-orange" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-white mb-3">
                    Your Messages
                  </div>
                  <div className="text-sm md:text-base text-white/60 mb-6">
                    Select a conversation from the left to start chatting, or search for someone to message
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center text-xs text-white/50">
                    <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">🔒 End-to-end encrypted</span>
                    <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">⚡ Real-time updates</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 107, 0, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 107, 0, 0.5);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
