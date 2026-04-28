import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { X, Send, Bot, Zap, ChevronDown, Users } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import type { ChatMessage, AgentType } from '../types/chat';
import { cn } from '../lib/utils';

interface ChatPanelProps {
  messages: ChatMessage[];
  activeAgent: AgentType | null;
  isLoading: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
  onClose: () => void;
  onAgentSwitch: (agent: AgentType) => void;
}

const AGENT_DATA: Record<AgentType, { name: string; role: string; color: string; accent: string }> = {
  team_lead: { name: 'Jordan', role: 'Team Lead', color: 'bg-[#003580]', accent: 'text-[#feba02]' },
  bookings: { name: 'Emily', role: 'Bookings', color: 'bg-[#0071c2]', accent: 'text-[#feba02]' },
  reviews: { name: 'Maya', role: 'Reviews', color: 'bg-[#feba02]', accent: 'text-[#003580]' },
  maintenance: { name: 'Sam', role: 'Advisor', color: 'bg-emerald-600', accent: 'text-white' },
  support: { name: 'Riley', role: 'Support', color: 'bg-[#003580]', accent: 'text-red-500' },
};

export default function ChatPanel({
  messages,
  activeAgent,
  isLoading,
  error,
  onSendMessage,
  onClose,
  onAgentSwitch,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentAgent = activeAgent || 'team_lead';
  const agentInfo = AGENT_DATA[currentAgent];

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || window.innerWidth < 640) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    onSendMessage(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={cn(
        'fixed bottom-6 right-6 z-[100] flex flex-col',
        'w-[420px] max-sm:w-full max-sm:right-0 max-sm:bottom-0 max-sm:h-full',
        'h-[650px] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]',
        'bg-white overflow-hidden border border-gray-100',
      )}
    >
      {/* Dynamic Background Glow */}
      <div className={cn("absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[80px] pointer-events-none opacity-20 transition-colors duration-1000", agentInfo.color)} />
      
      {/* Header */}
      <div className={cn("relative px-6 pt-8 pb-5 shrink-0 z-20 transition-colors duration-500", agentInfo.color)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm">
                <Zap size={24} className={cn("fill-current", agentInfo.accent === 'text-white' ? 'text-white' : agentInfo.accent)} />
              </div>
            </div>
            <div className="cursor-pointer group" onClick={() => setShowAgentSelector(!showAgentSelector)}>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-lg tracking-tight">CarMerica AI</h2>
                <ChevronDown size={16} className={cn("text-white/60 transition-transform", showAgentSelector && "rotate-180")} />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-[0.1em]">
                  {agentInfo.name} · {agentInfo.role}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center">
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Agent Selector Dropdown */}
        <AnimatePresence>
          {showAgentSelector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-6 right-6 top-full mt-2 bg-white border border-gray-100 rounded-2xl p-2 shadow-2xl z-30"
            >
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-3 py-2">Switch Specialist</p>
              <div className="grid grid-cols-1 gap-1">
                {(Object.keys(AGENT_DATA) as AgentType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      onAgentSwitch(type);
                      setShowAgentSelector(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 w-full p-2.5 rounded-xl transition-all text-left group",
                      currentAgent === type ? "bg-gray-50" : "hover:bg-gray-50/50"
                    )}
                  >
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border border-gray-100", AGENT_DATA[type].color)}>
                      <Users size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{AGENT_DATA[type].name}</p>
                      <p className="text-[10px] text-gray-500">{AGENT_DATA[type].role}</p>
                    </div>
                    {currentAgent === type && <div className={cn("ml-auto h-1.5 w-1.5 rounded-full", AGENT_DATA[type].color === 'bg-[#feba02]' ? 'bg-[#003580]' : 'bg-[#003580]')} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-gray-50/30 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((message, idx) => {
            const isUser = message.role === 'user';
            const isHandoff = message.isHandoff;

            if (isHandoff) {
              return (
                <motion.div key={message.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                  <span className="px-4 py-1.5 bg-white border border-gray-100 rounded-full text-[9px] font-bold text-gray-400 uppercase tracking-widest italic shadow-sm">
                    {message.text}
                  </span>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
              >
                {!isUser && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    <Bot size={10} className="text-gray-300" /> {message.agentName || 'Jordan'}
                  </span>
                )}
                <div className={cn(
                  'relative max-w-[85%] px-5 py-3.5 text-sm rounded-2xl shadow-sm border transition-all',
                  isUser 
                    ? 'bg-[#003580] border-[#003580]/10 text-white rounded-tr-none' 
                    : 'bg-white border-gray-100 text-gray-800 rounded-tl-none'
                )}>
                  <p className="relative z-10 whitespace-pre-wrap leading-relaxed">{message.text}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start gap-2">
            <div className="bg-white border border-gray-100 px-5 py-3.5 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 bg-gray-300 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative p-6 bg-white border-t border-gray-100">
        <div className="relative flex items-end gap-3 bg-gray-50 rounded-2xl border border-gray-200 p-2 focus-within:border-[#003580]/30 focus-within:bg-white transition-all">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={`Message ${agentInfo.name}...`}
            rows={1}
            className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none px-3 py-3 text-sm text-gray-800 focus:outline-none placeholder:text-gray-400 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all shadow-md",
              "bg-[#0071c2] text-white hover:bg-[#003580] disabled:opacity-20 active:scale-95"
            )}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="mt-4 text-[9px] text-center text-gray-300 font-bold uppercase tracking-[0.3em]">
          Secured by CarMerica Trust Engine
        </p>
      </div>
    </motion.div>
  );
}
