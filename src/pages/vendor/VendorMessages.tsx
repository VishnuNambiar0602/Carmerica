import React from 'react';
import { MessageSquare, Search, Filter, MoreVertical, Send, User, Building2, Check, X, Clock, Paperclip, Smile, Phone, Video } from 'lucide-react';
import { cn } from '../../lib/utils';

const VendorMessages = () => {
  const [activeChat, setActiveChat] = React.useState<number | null>(null);
  const [chats, setChats] = React.useState<any[]>([]);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [messageInput, setMessageInput] = React.useState('');

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        setChats(data.chats || []);
        setMessages([]);
        if (data.chats && data.chats.length) setActiveChat(data.chats[0].id);
        // messages map is returned as object keyed by threadId
        if (data.messages) {
          const first = data.chats && data.chats[0] && data.messages[data.chats[0].id];
          if (first) setMessages(first);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  React.useEffect(() => {
    if (!activeChat) return;
    const es = new EventSource(`/api/messages/stream?threadId=${activeChat}`);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.messages) {
        setMessages(data.messages);
      }
    };
    return () => es.close();
  }, [activeChat]);

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className="w-full md:w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003580] focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={cn(
                "w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-50",
                activeChat === chat.id && "bg-blue-50"
              )}
            >
              <div className="relative">
                <img src={chat.image} alt={chat.name} className="h-12 w-12 rounded-full object-cover" loading="lazy" width="48" height="48" decoding="async" />
                {chat.status === 'online' && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-grow text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{chat.name}</h3>
                  <span className="text-[10px] text-gray-400 font-medium">{chat.time}</span>
                </div>
                <p className={cn(
                  "text-xs truncate",
                  chat.unread > 0 ? "text-gray-900 font-bold" : "text-gray-500"
                )}>
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="bg-[#003580] text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="hidden md:flex flex-grow flex-col bg-gray-50/30">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={chats.find(c => c.id === activeChat)?.image} alt="Active Chat" className="h-10 w-10 rounded-full object-cover" loading="lazy" width="40" height="40" decoding="async" />
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{chats.find(c => c.id === activeChat)?.name}</h3>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-[#003580] hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-[#003580] hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-[#003580] hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex flex-col max-w-[70%]",
              msg.sender === 'vendor' ? "ml-auto items-end" : "items-start"
            )}>
              <div className={cn(
                "p-3 rounded-2xl text-sm shadow-sm",
                msg.sender === 'vendor' 
                  ? "bg-[#003580] text-white rounded-tr-none" 
                  : "bg-white text-gray-900 rounded-tl-none border border-gray-100"
              )}>
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-400 font-medium mt-1">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form className="flex items-center space-x-3" onSubmit={async (e) => {
            e.preventDefault();
            if (!activeChat || !messageInput.trim()) return;
            try {
              const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ threadId: activeChat, sender: 'vendor', text: messageInput.trim() })
              });
              const data = await res.json();
              if (res.ok) {
                setMessages(prev => [...prev, data]);
                setMessageInput('');
              } else {
                alert(data.message || 'Send failed');
              }
            } catch (err) {
              console.error(err);
              alert('Network error');
            }
          }}>
            <button type="button" className="p-2 text-gray-400 hover:text-gray-600">
              <Paperclip className="h-5 w-5" />
            </button>
            <div className="flex-grow relative">
              <input 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                type="text" 
                placeholder="Type your message..." 
                className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#003580] focus:border-transparent"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Smile className="h-5 w-5" />
              </button>
            </div>
            <button type="submit" className="bg-[#003580] text-white p-2 rounded-full hover:bg-[#00224f] transition-colors shadow-md">
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorMessages;
