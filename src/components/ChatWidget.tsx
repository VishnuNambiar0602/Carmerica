import React, { useState, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ChatMessage, AgentType, AgentResponse } from '../types/chat';
import { sendMessage } from '../services/AgentService';
import ChatPanel from './ChatPanel';

interface ChatWidgetState {
  isOpen: boolean;
  messages: ChatMessage[];
  activeAgent: AgentType | null;
  isLoading: boolean;
  error: string | null;
}

const USER_ID = 'user-1';

const AGENT_NAMES: Record<AgentType, string> = {
  team_lead: 'Jordan (Team Lead)',
  bookings: 'Emily (Bookings)',
  reviews: 'Maya (Reviews)',
  maintenance: 'Sam (Advisor)',
  support: 'Riley (Support)',
};

function createMessageId(): string {
  return String(Date.now()) + Math.random();
}

export default function ChatWidget() {
  const [state, setState] = useState<ChatWidgetState>({
    isOpen: false,
    messages: [],
    activeAgent: null,
    isLoading: false,
    error: null,
  });

  const [greetingTriggered, setGreetingTriggered] = useState(false);

  const processResponse = useCallback((response: AgentResponse) => {
    setState((prev) => {
      const newMessages: ChatMessage[] = [...prev.messages];

      // 1. Transition/Reply from current agent
      if (response.reply) {
        // If it's a handoff, we treat the 'reply' as coming from the PREVIOUS agent
        // but for simplicity, we'll just use the name returned if not handoff.
        // Actually, Jordan usually gives the transition.
        newMessages.push({
          id: createMessageId(),
          role: 'agent',
          text: response.reply,
          agentType: response.handoffOccurred ? prev.activeAgent || 'team_lead' : response.agentType,
          agentName: response.handoffOccurred ? AGENT_NAMES[prev.activeAgent || 'team_lead'] : response.agentName,
          timestamp: Date.now(),
        });
      }

      // 2. Handoff system pill
      if (response.handoffOccurred) {
        newMessages.push({
          id: createMessageId(),
          role: 'agent',
          text: `Connecting you with ${response.agentName}...`,
          agentType: response.agentType,
          agentName: response.agentName,
          isHandoff: true,
          timestamp: Date.now(),
        });
      }

      // 3. Specialist "Chipping in" reply
      if (response.specialistReply) {
        newMessages.push({
          id: createMessageId(),
          role: 'agent',
          text: response.specialistReply,
          agentType: response.agentType,
          agentName: response.agentName,
          timestamp: Date.now(),
        });
      }

      return {
        ...prev,
        messages: newMessages,
        activeAgent: response.agentType,
        isLoading: false,
      };
    });
  }, []);

  const triggerGreeting = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await sendMessage({
        userMessage: '',
        conversationHistory: [],
        currentAgent: null,
        userId: USER_ID,
      });
      processResponse(response);
    } catch (err) {
      console.error('Chat greeting error:', err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Something went wrong. Please try again.',
      }));
    }
  }, [processResponse]);

  const triggerSpecialistOpening = useCallback(async (agentType: AgentType, currentHistory: ChatMessage[]) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await sendMessage({
        userMessage: 'Hello, I was just connected to you. Please introduce yourself and check if I have any specific needs based on our history.',
        conversationHistory: currentHistory,
        currentAgent: agentType,
        userId: USER_ID,
      });
      processResponse(response);
    } catch (err) {
      console.error('Specialist opening error:', err);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [processResponse]);

  useEffect(() => {
    if (state.isOpen && !greetingTriggered) {
      setGreetingTriggered(true);
      triggerGreeting();
    }
  }, [state.isOpen, greetingTriggered, triggerGreeting]);

  const handleOpen = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleAgentSwitch = useCallback((agentType: AgentType) => {
    let updatedHistory: ChatMessage[] = [];
    setState((prev) => {
      if (prev.activeAgent === agentType) return prev;

      const agentName = AGENT_NAMES[agentType];
      const handoffMessage: ChatMessage = {
        id: createMessageId(),
        role: 'agent',
        text: `Manually switching to ${agentName}...`,
        agentType: agentType,
        agentName: agentName,
        isHandoff: true,
        timestamp: Date.now(),
      };

      updatedHistory = [...prev.messages, handoffMessage];
      return {
        ...prev,
        activeAgent: agentType,
        messages: updatedHistory,
      };
    });

    // Trigger the specialist to "chip in" after manual switch
    triggerSpecialistOpening(agentType, updatedHistory);
  }, [triggerSpecialistOpening]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (state.isLoading) return;

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        text,
        timestamp: Date.now(),
      };

      const historyBeforeUpdate = state.messages;
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      try {
        const response = await sendMessage({
          userMessage: text,
          conversationHistory: [...historyBeforeUpdate, userMessage],
          currentAgent: state.activeAgent,
          userId: USER_ID,
        });
        processResponse(response);
      } catch (err) {
        console.error('Chat message error:', err);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Something went wrong. Please try again.',
        }));
      }
    },
    [state.isLoading, state.messages, state.activeAgent, processResponse],
  );

  return (
    <AnimatePresence>
      {!state.isOpen ? (
        <motion.button
          key="chat-button"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ 
            scale: 1.1, 
            boxShadow: '0 20px 40px rgba(220, 38, 38, 0.4)',
            rotate: [0, -10, 10, 0],
          }}
          whileTap={{ scale: 0.9 }}
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-2xl transition-colors border border-white/20 overflow-hidden"
          aria-label="Open chat support"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Zap size={32} className="fill-current" />
          </motion.div>
        </motion.button>
      ) : (
        <ChatPanel
          key="chat-panel"
          messages={state.messages}
          activeAgent={state.activeAgent}
          isLoading={state.isLoading}
          error={state.error}
          onSendMessage={handleSendMessage}
          onClose={handleClose}
          onAgentSwitch={handleAgentSwitch}
        />
      )}
    </AnimatePresence>
  );
}
