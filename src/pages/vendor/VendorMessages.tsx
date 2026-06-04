import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  MoreVertical, 
  Send, 
  User, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  Loader2, 
  AlertCircle,
  Clock 
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Chat {
  id: number;
  name: string;
  image: string;
  status: string;
  time: string;
  unread: number;
  last_message?: string;
  lastMessage?: string;
}

interface Message {
  id: number;
  thread_id: number;
  text: string;
  sender: 'vendor' | 'customer' | string;
  time: string;
}

const VendorMessages = () => {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      const chatsList = data.chats || [];
      setChats(chatsList);

      if (chatsList.length > 0) {
        const firstChatId = chatsList[0].id;
        setActiveChat(firstChatId);
        
        // Defensive loading of messages
        let threadMessages: Message[] = [];
        if (data.messages) {
          if (Array.isArray(data.messages)) {
            threadMessages = data.messages.filter((m: any) => String(m.thread_id) === String(firstChatId));
          } else {
            threadMessages = data.messages[String(firstChatId)] || data.messages[Number(firstChatId)] || [];
          }
        }
        setMessages(threadMessages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    const es = new EventSource(`/api/messages/stream?threadId=${activeChat}`);
    
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.messages) {
          // If stream returns a keyed map or array
          let threadMessages: Message[] = [];
          if (Array.isArray(data.messages)) {
            threadMessages = data.messages;
          } else {
            threadMessages = data.messages[String(activeChat)] || data.messages[Number(activeChat)] || [];
          }
          setMessages(threadMessages);
        }
      } catch (err) {
        console.error('[SSE] parse error', err);
      }
    };
    
    return () => es.close();
  }, [activeChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || !messageInput.trim()) return;
    
    const token = localStorage.getItem('token');
    const userMessage = messageInput.trim();
    setMessageInput(''); // Optimistic clear

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          threadId: activeChat, 
          sender: 'vendor', 
          text: userMessage 
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Append message
        setMessages(prev => [...prev, data]);
        // Update last message in chat sidebar
        setChats(prev => prev.map(c => c.id === activeChat ? { ...c, lastMessage: userMessage, last_message: userMessage, time: 'Just now' } : c));
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error(err);
      alert('Network error sending message');
    }
  };

  const handleCall = (type: 'audio' | 'video') => {
    alert(`Initiating ${type} call to customer. Please enable microphone/camera permissions in your browser.`);
  };

  const activeChatDetails = chats.find(c => c.id === activeChat);

  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.lastMessage || c.last_message || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-160px)] flex border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className="w-full md:w-80 border-r-2 border-black flex flex-col">
        <div className="p-4 border-b-2 border-black">
          <h2 className="text-xl font-black text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]"
            />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto divide-y-2 divide-gray-150">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-xs font-bold">Loading chats...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-gray-400 italic">No chats found.</div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChat(chat.id);
                  // Mark read optimistically
                  setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                }}
                className={cn(
                  "w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-none rounded-none text-left",
                  activeChat === chat.id && "bg-blue-50"
                )}
              >
                <div className="relative shrink-0">
                  <img 
                    src={chat.image || 'https://picsum.photos/seed/customer/96/96'} 
                    alt={chat.name} 
                    className="h-12 w-12 border-2 border-black object-cover rounded-none" 
                    loading="lazy" 
                    width="48" 
                    height="48" 
                  />
                  {chat.status === 'online' && (
                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-black rounded-none"></div>
                  )}
                </div>
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-black text-gray-900 text-sm truncate">{chat.name}</h3>
                    <span className="text-[10px] text-gray-400 font-bold">{chat.time}</span>
                  </div>
                  <p className={cn(
                    "text-xs truncate font-bold",
                    chat.unread > 0 ? "text-gray-900 font-black" : "text-gray-500"
                  )}>
                    {chat.lastMessage || chat.last_message || ''}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <div className="bg-[#003580] text-white border-2 border-black text-[9px] font-black h-5 w-5 rounded-none flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    {chat.unread}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="hidden md:flex flex-grow flex-col bg-gray-50/30">
        {activeChatDetails ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b-2 border-black flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img 
                  src={activeChatDetails.image || 'https://picsum.photos/seed/customer/96/96'} 
                  alt="Active Chat" 
                  className="h-10 w-10 border-2 border-black object-cover rounded-none" 
                  loading="lazy" 
                  width="40" 
                  height="40" 
                />
                <div>
                  <h3 className="font-black text-gray-900 text-sm">{activeChatDetails.name}</h3>
                  <p className="text-[9px] text-green-700 font-black uppercase tracking-widest">
                    {activeChatDetails.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleCall('audio')}
                  className="p-2 border-2 border-black bg-white hover:bg-blue-50 text-gray-700 hover:-translate-y-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all rounded-none"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleCall('video')}
                  className="p-2 border-2 border-black bg-white hover:bg-blue-50 text-gray-700 hover:-translate-y-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all rounded-none"
                >
                  <Video className="h-4 w-4" />
                </button>
                <button className="p-2 border-2 border-black bg-white hover:bg-gray-150 text-gray-700 hover:-translate-y-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all rounded-none">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
                  No messages in this conversation. Write a message below to begin.
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[70%] transition-all",
                      msg.sender === 'vendor' ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "p-3 text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none",
                      msg.sender === 'vendor' 
                        ? "bg-[#003580] text-white" 
                        : "bg-white text-gray-900"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-gray-400 font-bold mt-1.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {msg.time}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t-2 border-black">
              <form className="flex items-center space-x-3" onSubmit={handleSendMessage}>
                <button 
                  type="button" 
                  onClick={() => alert('Attachments features require storage setup.')}
                  className="p-2.5 border-2 border-black bg-white hover:bg-gray-100 transition-all rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </button>
                <div className="flex-grow relative">
                  <input 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    type="text" 
                    placeholder="Type your message..." 
                    className="w-full pl-4 pr-10 py-3 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580] font-bold"
                  />
                  <button 
                    type="button" 
                    onClick={() => setMessageInput(prev => prev + ' 😊')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                </div>
                <button 
                  type="submit" 
                  className="border-2 border-black bg-[#003580] text-white p-2.5 hover:bg-[#00224f] hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all rounded-none flex items-center justify-center"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center flex-col text-gray-450 p-6">
            <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
            <p className="font-bold text-lg">No active conversation</p>
            <p className="text-sm">Select a customer from the left sidebar to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorMessages;
