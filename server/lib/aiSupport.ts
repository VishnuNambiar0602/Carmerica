import { GroqError, generate } from './groq.js';
import { db } from './db.js';

export type AgentType = 'team_lead' | 'bookings' | 'reviews' | 'maintenance' | 'support';
export type RoutingIntent = 'bookings' | 'reviews' | 'maintenance' | 'general_support' | 'unclear';

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  agentType?: AgentType;
  agentName?: string;
  isHandoff?: boolean;
  timestamp: number;
}

export interface SendMessageParams {
  userMessage: string;
  conversationHistory: ChatMessage[];
  currentAgent: AgentType | null;
  userId: string;
  userRole?: string;
}

export interface RoutingDecision {
  intent: RoutingIntent;
  confidence: 'high' | 'low';
  clarificationQuestion?: string;
}

export interface AgentResponse {
  reply: string;
  specialistReply?: string;
  agentType: AgentType;
  agentName: string;
  handoffOccurred: boolean;
  mode: 'ai' | 'fallback';
}

interface AgentConfig {
  type: AgentType;
  name: string;
  role: string;
  systemPrompt: string;
}

interface ResponseEnvelope {
  routing: RoutingDecision;
  reply: string;
  specialistReply?: string;
}

const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  team_lead: {
    type: 'team_lead',
    name: 'Jordan',
    role: 'Team Lead',
    systemPrompt: `You are Jordan, the Team Lead for CarMerica's customer support team. Route customers to the right specialist and always return valid JSON with routing, reply, and optional specialistReply.`,
  },
  bookings: {
    type: 'bookings',
    name: 'Emily',
    role: 'Bookings Specialist',
    systemPrompt: 'You are Emily, a bookings specialist. Use booking context and include IDs, garage, date, time, and status when available. Return valid JSON.',
  },
  reviews: {
    type: 'reviews',
    name: 'Maya',
    role: 'Reviews Specialist',
    systemPrompt: 'You are Maya, a reviews specialist. Summarize ratings and review sentiment from context. Return valid JSON.',
  },
  maintenance: {
    type: 'maintenance',
    name: 'Sam',
    role: 'Maintenance Advisor',
    systemPrompt: 'You are Sam, a maintenance advisor. Give practical service guidance and recommend garages from context. Return valid JSON.',
  },
  support: {
    type: 'support',
    name: 'Riley',
    role: 'Support Specialist',
    systemPrompt: 'You are Riley, a support specialist. Be concise, empathetic, and action-oriented. Return valid JSON.',
  },
};

const TEAM_LEAD_GREETING =
  "Hi there! I'm Jordan, your CarMerica support team lead. I can connect you with bookings, reviews, maintenance advice, or general support. What can we help you with today?";

function intentToAgentType(intent: RoutingIntent): AgentType {
  if (intent === 'bookings') return 'bookings';
  if (intent === 'reviews') return 'reviews';
  if (intent === 'maintenance') return 'maintenance';
  if (intent === 'general_support') return 'support';
  return 'team_lead';
}

function formatConversationHistory(history: ChatMessage[]) {
  if (history.length === 0) return 'No previous messages.';
  return history.map((message) => `${message.role === 'user' ? 'Customer' : message.agentName || 'Agent'}: ${message.text}`).join('\n');
}

function inferIntent(text: string): RoutingIntent {
  const value = text.toLowerCase();
  if (/booking|appointment|cancel|reschedule|schedule|reservation/.test(value)) return 'bookings';
  if (/review|rating|rated|feedback|stars/.test(value)) return 'reviews';
  if (/oil|brake|battery|engine|tyre|tire|ac|maintenance|service|repair|diagnostic|garage/.test(value)) return 'maintenance';
  if (/refund|account|login|complaint|payment|support|problem|issue/.test(value)) return 'general_support';
  return 'unclear';
}

async function fetchDatabaseContext(agentType: AgentType, userId: string, userMessage: string, userRole: string): Promise<string> {
  try {
    const user = await db.findUserById(userId);
    const vendor = user ? await db.findVendorByUserId(user.id) : null;
    const vendorId = vendor?.id || null;

    if (userRole === 'vendor' && vendorId) {
      if (agentType === 'bookings') {
        const bookings = await db.listBookings({ vendorId });
        return JSON.stringify(bookings.slice(0, 10), null, 2);
      }
      if (agentType === 'reviews') {
        const reviews = await db.listReviews();
        const filtered = reviews.filter((r) => r.vendor_id === vendorId);
        return JSON.stringify(filtered.slice(0, 10), null, 2);
      }
      if (agentType === 'maintenance') {
        const services = await db.listServices({ vendorId });
        return JSON.stringify(services.slice(0, 10), null, 2);
      }
      if (agentType === 'support') {
        const staff = await db.listStaff(vendorId);
        return JSON.stringify(staff.slice(0, 10), null, 2);
      }
    }

    if (userRole === 'admin') {
      if (agentType === 'bookings') {
        const bookings = await db.listBookings({});
        return JSON.stringify(bookings.slice(0, 15), null, 2);
      }
      if (agentType === 'reviews') {
        const reviews = await db.listReviews();
        return JSON.stringify(reviews.slice(0, 15), null, 2);
      }
      if (agentType === 'maintenance') {
        const rules = await db.listPricingRules();
        return JSON.stringify(rules.slice(0, 15), null, 2);
      }
      if (agentType === 'support') {
        const supportTickets = await db.listSupportTickets ? await db.listSupportTickets() : [];
        return JSON.stringify(supportTickets.slice(0, 15), null, 2);
      }
    }

    if (agentType === 'bookings') {
      if (user) {
        const bookings = await db.listBookings({ customerEmail: user.email });
        return JSON.stringify(bookings.slice(0, 10), null, 2);
      }
      return 'No bookings found for this user.';
    }

    if (agentType === 'reviews') {
      const reviews = await db.listReviews();
      const { data: garages } = await db.listGarages();
      const mentionedGarage = garages.find((g) => userMessage.toLowerCase().includes(g.name.toLowerCase()));
      const filtered = mentionedGarage ? reviews.filter((r) => r.garage_id === mentionedGarage.id) : reviews;
      return JSON.stringify(filtered.slice(0, 10), null, 2);
    }

    if (agentType === 'maintenance') {
      const { data: garages } = await db.listGarages();
      const vehicles = user ? await db.listVehicles(user.id) : [];
      return JSON.stringify({
        registeredVehicles: vehicles,
        garages: garages.slice(0, 10),
      }, null, 2);
    }

    return 'No specialist context required.';
  } catch (err) {
    console.error('[AI Context] Error fetching DB context:', err);
    return 'Unable to fetch live data — using general knowledge.';
  }
}

function buildSystemPrompt(activeAgentType: AgentType, conversationHistory: ChatMessage[], dbContext: string, userRole: string) {
  const activeConfig = AGENT_CONFIGS[activeAgentType];
  let customInstruction = '';
  if (userRole === 'vendor') {
    customInstruction = `The user talking to you is a GARAGE VENDOR partner logged into the vendor portal. Address them as a partner, help them manage their bookings, reviews, earnings, promotions, and services catalog. Do not direct them to book a slot for themselves.`;
  } else if (userRole === 'admin') {
    customInstruction = `The user talking to you is a SYSTEM ADMINISTRATOR logged into the admin dashboard. Help them monitor platforms, fetch wide statistics, moderate reviews, or view logs. Keep replies professional, precise, and data-driven.`;
  } else {
    customInstruction = `The user talking to you is a CUSTOMER looking for services, viewing bookings, reviewing garages, or asking for support.`;
  }
  return [
    `=== ACTIVE AGENT ===\n${activeConfig.name} (${activeConfig.role})\n${activeConfig.systemPrompt}`,
    `=== USER ROLE & CONTEXT ===\n${customInstruction}`,
    `=== ROUTING INTENTS ===\nbookings, reviews, maintenance, general_support, unclear`,
    `=== RESPONSE FORMAT ===\nReturn only JSON: {"routing":{"intent":"...","confidence":"high|low"},"reply":"...","specialistReply":"optional handoff reply"}`,
    `=== CONVERSATION HISTORY ===\n${formatConversationHistory(conversationHistory)}`,
    `=== DATABASE CONTEXT ===\n${dbContext}`,
  ].join('\n\n');
}

function parseAIResponse(raw: string): ResponseEnvelope | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned) as ResponseEnvelope;
    if (parsed?.routing?.intent && typeof parsed.reply === 'string') return parsed;
  } catch {
    return null;
  }
  return null;
}

function fallbackResponse(params: SendMessageParams, error?: any): AgentResponse {
  const userRole = params.userRole || 'customer';
  const activeAgentType = params.currentAgent || intentToAgentType(inferIntent(params.userMessage));
  const routingIntent = inferIntent(params.userMessage);
  const routedAgentType = routingIntent === 'unclear' ? activeAgentType : intentToAgentType(routingIntent);
  const config = AGENT_CONFIGS[routedAgentType];

  let reply = TEAM_LEAD_GREETING;
  if (userRole === 'vendor') {
    reply = "Hi there! I'm Jordan, your Vendor Portal assistant. I can connect you with booking management, review responses, payouts/earnings help, or catalog configuration. How can I help your garage business today?";
    if (routedAgentType === 'bookings') reply = "I'm Emily, your bookings assistant. Let me look up your garage bookings list — could you provide a booking ID or customer name?";
    if (routedAgentType === 'reviews') reply = "Hello, I'm Maya. I can summarize customer ratings for your garage and help you write replies to feedback.";
    if (routedAgentType === 'maintenance') reply = "Hi, I'm Sam. I can help with garage service catalog details, pricing rules, and diagnostic categories.";
    if (routedAgentType === 'support') reply = "Hi, I'm Riley. I can assist with payouts, payout request statuses, staff assignments, and platform settings.";
  } else if (userRole === 'admin') {
    reply = "Hello Admin! I'm Jordan, the Admin Assistant. I can help you query platform statistics, booking histories, flag reviews, process support tickets, or analyze vendor earnings. How can I support your system monitoring today?";
    if (routedAgentType === 'bookings') reply = "Hello! I'm Emily. I can retrieve platform-wide booking metrics, search by booking IDs across all vendors, or pull up specific customer records.";
    if (routedAgentType === 'reviews') reply = "Hello! I'm Maya. I can assist with moderation, reviews aggregation, flag statistics, or category reviews breakdown.";
    if (routedAgentType === 'maintenance') reply = "Hello! I'm Sam. I can analyze platform service catalog trends, pricing rules, and competitor average configurations.";
    if (routedAgentType === 'support') reply = "Hello! I'm Riley. I can retrieve platform support tickets, settings configurations, and resolve payment/refund issues.";
  } else {
    if (routedAgentType === 'bookings') reply = "I'm Emily, the bookings specialist. Let me look up your booking details — could you share the booking ID or your registered email?";
    if (routedAgentType === 'reviews') reply = "Hello, I'm Maya. I can help with reviews and ratings. Which garage or service would you like to review?";
    if (routedAgentType === 'maintenance') reply = "Hi, I'm Sam. I can recommend maintenance services and garages. Tell me about your vehicle and what you need.";
    if (routedAgentType === 'support') reply = "Hi, I'm Riley. I can help with account, payment, refund, or platform issues. Please share the booking ID or account email so I can narrow this down.";
  }

  if (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    reply += `\n\n[DEBUG AI Fallback: ${errorMsg}]`;
  }

  return {
    reply,
    agentType: routedAgentType,
    agentName: `${config.name} (${config.role})`,
    handoffOccurred: routedAgentType !== (params.currentAgent || 'team_lead'),
    mode: 'fallback',
  };
}

export async function sendAIMessage(params: SendMessageParams): Promise<AgentResponse> {
  const userRole = params.userRole || 'customer';
  if (!params.currentAgent && params.conversationHistory.length === 0 && !params.userMessage.trim()) {
    let reply = TEAM_LEAD_GREETING;
    if (userRole === 'vendor') {
      reply = "Hi there! I'm Jordan, your Vendor Portal assistant. I can connect you with booking management, review responses, payouts/earnings help, or catalog configuration. How can I help your garage business today?";
    } else if (userRole === 'admin') {
      reply = "Hello Admin! I'm Jordan, the Admin Assistant. I can help you query platform statistics, booking histories, flag reviews, process support tickets, or analyze vendor earnings. How can I support your system monitoring today?";
    }
    return {
      reply,
      agentType: 'team_lead',
      agentName: 'Jordan (Team Lead)',
      handoffOccurred: false,
      mode: 'fallback',
    };
  }

  const inferred = inferIntent(params.userMessage);
  const activeAgentType = params.currentAgent || (inferred === 'unclear' ? 'team_lead' : intentToAgentType(inferred));
  const dbContext = await fetchDatabaseContext(activeAgentType, params.userId, params.userMessage, userRole);
  const systemPrompt = buildSystemPrompt(activeAgentType, params.conversationHistory, dbContext, userRole);

  try {
    const raw = await generate(systemPrompt, params.userMessage);
    const envelope = parseAIResponse(raw);
    if (!envelope) return fallbackResponse(params, new Error('Failed to parse AI response as JSON envelope'));

    const nextAgentType = envelope.routing.confidence === 'low' ? 'team_lead' : intentToAgentType(envelope.routing.intent);
    const nextConfig = AGENT_CONFIGS[nextAgentType];
    return {
      reply: envelope.reply,
      specialistReply: envelope.specialistReply,
      agentType: nextAgentType,
      agentName: `${nextConfig.name} (${nextConfig.role})`,
      handoffOccurred: nextAgentType !== activeAgentType,
      mode: 'ai',
    };
  } catch (error) {
    console.error('[AI] Chat error — falling back:', error);
    return fallbackResponse(params, error);
  }
}

export function getAIStatus() {
  const configured = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'YOUR_GROQ_API_KEY' && process.env.GROQ_API_KEY !== 'your_groq_api_key_here');
  return {
    status: 'ok',
    provider: 'groq',
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    configured,
    fallbackEnabled: true,
    database: db.isSupabase ? 'supabase' : 'memory-backed',
    agents: Object.values(AGENT_CONFIGS).map(({ type, name, role }) => ({ type, name, role })),
  };
}
