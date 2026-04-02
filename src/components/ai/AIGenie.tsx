import React from 'react';
import { Sparkles, Send, X, MessageSquare, Bot, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AIGenieProps {
  className?: string;
  inline?: boolean;
}

const AIGenie: React.FC<AIGenieProps> = ({ className, inline = false }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [messages, setMessages] = React.useState<{ role: 'user' | 'ai'; text: string; suggestions?: string[] }[]>([
    { role: 'ai', text: "Hello! I'm your AI Car Genie. How can I help you today? You can ask me things like 'Best SUV service under 500 AED' or 'Why is my engine making a clicking sound?'" }
  ]);

  const handleSend = () => {
    if (!query.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, text: query }];
    setMessages(newMessages);
    setQuery('');

    // Simulate AI Response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Based on your request, I've found 3 top-rated garages that specialize in SUVs. Would you like to see their current 'Best Value' bundles?",
        suggestions: ['Show me bundles', 'Compare prices', 'Book inspection']
      }]);
    }, 1000);
  };

  const quickPrompts = [
    "Family SUV service under 800",
    "Low mileage sedan UAE",
    "Brake noise diagnosis",
    "Best rated garage near me"
  ];

  if (inline) {
    return (
      <div className={cn("bg-white rounded-2xl border-2 border-red-100 shadow-xl overflow-hidden", className)}>
        <div className="bg-red-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 fill-current" />
            <span className="font-bold">AI Car Genie</span>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-red-700 px-2 py-1 rounded-full">
            <Zap className="h-3 w-3 fill-current text-yellow-400" />
            <span>Powered by Cloudflare AI</span>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] p-3 rounded-2xl text-sm",
                  msg.role === 'user' ? "bg-red-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"
                )}>
                  {msg.text}
                  {msg.suggestions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.suggestions.map((s, j) => (
                        <button key={j} className="bg-white text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-50">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about your car..." 
              className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button onClick={handleSend} className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition-colors">
              <Send className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickPrompts.map((p, i) => (
              <button 
                key={i} 
                onClick={() => setQuery(p)}
                className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center space-x-2 group"
      >
        <Sparkles className="h-6 w-6 fill-current" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">
          Ask Car Genie
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-red-600 p-6 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Conversational AI Genie</h2>
                  <p className="text-xs text-red-100">Your personal car servicing expert</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-sm shadow-sm",
                    msg.role === 'user' ? "bg-red-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                  )}>
                    {msg.text}
                    {msg.role === 'ai' && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center space-x-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <span className="flex items-center"><ShieldCheck className="h-3 w-3 mr-1 text-green-500" /> Verified Data</span>
                        <span className="flex items-center"><TrendingUp className="h-3 w-3 mr-1 text-blue-500" /> Best Value</span>
                      </div>
                    )}
                    {msg.suggestions && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {msg.suggestions.map((s, j) => (
                          <button key={j} className="bg-red-50 text-red-600 border border-red-100 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-red-100 transition-colors">
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white border-t border-gray-100">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your car problem or search query..." 
                  className="flex-grow px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
                <button onClick={handleSend} className="bg-red-600 text-white p-3 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100">
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickPrompts.map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => setQuery(p)}
                    className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIGenie;
