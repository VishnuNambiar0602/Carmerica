import React from 'react';
import { MessageSquare, Search, Filter, MoreVertical, Send, User, Building2, Check, X, Clock, Paperclip, Smile, Phone, Video } from 'lucide-react';
import { cn } from '../../lib/utils';

const VendorMessages = () => {
  const [activeChat, setActiveChat] = React.useState(1);

  const chats = [
    { id: 1, name: 'John Doe', lastMessage: 'Is my car ready for pickup?', time: '10:30 AM', unread: 2, status: 'online', image: 'https://i.pravatar.cc/150?u=john' },
    { id: 2, name: 'Sarah Smith', lastMessage: 'Thank you for the quick service!', time: 'Yesterday', unread: 0, status: 'offline', image: 'https://i.pravatar.cc/150?u=sarah' },
    { id: 3, name: 'Mike Johnson', lastMessage: 'Can I reschedule my appointment?', time: 'Oct 10', unread: 0, status: 'offline', image: 'https://i.pravatar.cc/150?u=mike' },
    { id: 4, name: 'Emily Davis', lastMessage: 'How much for the brake pads?', time: 'Oct 09', unread: 0, status: 'online', image: 'https://i.pravatar.cc/150?u=emily' },
  ];

  const messages = [
    { id: 1, text: 'Hello! I wanted to check the status of my Toyota Camry.', sender: 'customer', time: '09:15 AM' },
    { id: 2, text: 'Hi John! We\'ve completed the oil change and the 50-point inspection. We\'re just finishing up the final checks.', sender: 'vendor', time: '09:30 AM' },
    { id: 3, text: 'That\'s great news. Is my car ready for pickup?', sender: 'customer', time: '10:30 AM' },
  ];

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
                <img src={chat.image} alt={chat.name} className="h-12 w-12 rounded-full object-cover" />
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
            <img src={chats.find(c => c.id === activeChat)?.image} alt="Active Chat" className="h-10 w-10 rounded-full object-cover" />
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
          <form className="flex items-center space-x-3" onSubmit={(e) => e.preventDefault()}>
            <button type="button" className="p-2 text-gray-400 hover:text-gray-600">
              <Paperclip className="h-5 w-5" />
            </button>
            <div className="flex-grow relative">
              <input 
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
