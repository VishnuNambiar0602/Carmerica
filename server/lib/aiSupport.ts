import { GroqError, generate } from './groq.js';

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

const demoBookings = [
  { id: 'BK-1029', userId: 'user-1', garage: 'Elite Auto Care', date: 'Oct 12, 2026', time: '10:00 AM', service: 'Oil Change', car: 'Toyota Camry', status: 'In Progress', price: 89 },
  { id: 'BK-1031', userId: 'user-1', garage: 'Precision Mechanics', date: 'Oct 12, 2026', time: '01:00 PM', service: 'General Service', car: 'Ford F-150', status: 'Confirmed', price: 189 },
];

const demoGarages = [
  { name: 'Elite Auto Care', location: 'Downtown, Dubai', rating: 4.8, services: ['Oil Change', 'Brake Repair', 'Diagnostics'] },
  { name: 'Precision Mechanics', location: 'Al Quoz, Dubai', rating: 4.6, services: ['General Service', 'Oil Change'] },
  { name: 'The Garage Co.', location: 'Jumeirah, Dubai', rating: 4.5, services: ['AC Service', 'Electrical Repair'] },
];

const demoReviews = [
  { user: 'John Doe', vendor: 'Elite Auto Care', rating: 5, comment: 'Excellent service and transparent costs.' },
  { user: 'Sarah Smith', vendor: 'Precision Mechanics', rating: 4, comment: 'Good experience and strong brake repair.' },
  { user: 'Mike Johnson', vendor: 'Elite Auto Care', rating: 2, comment: 'Service took longer than expected.' },
];

function intentToAgentType(intent: RoutingIntent): AgentType {
  if (intent === 'bookings') return 'bookings';
  if (intent === 'reviews') return 'reviews';
  if (intent === 'maintenance') return 'maintenance';
  if (intent === 'general_support') return 'support';
  return 'team_lead';
}

function agentTypeToIntent(agentType: AgentType): RoutingIntent {
  if (agentType === 'bookings') return 'bookings';
  if (agentType === 'reviews') return 'reviews';
  if (agentType === 'maintenance') return 'maintenance';
  if (agentType === 'support') return 'general_support';
  return 'unclear';
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

function fetchDatabaseContext(agentType: AgentType, userId: string, userMessage: string) {
  if (agentType === 'bookings') {
    return JSON.stringify(demoBookings.filter((booking) => booking.userId === userId), null, 2);
  }

  if (agentType === 'reviews') {
    const mentionedGarage = demoGarages.find((garage) => userMessage.toLowerCase().includes(garage.name.toLowerCase()));
    const reviews = mentionedGarage ? demoReviews.filter((review) => review.vendor === mentionedGarage.name) : demoReviews;
    return JSON.stringify(reviews, null, 2);
  }

  if (agentType === 'maintenance') {
    return JSON.stringify({
      registeredVehicles: userId === 'user-1' ? [{ make: 'Toyota', model: 'Camry', year: 2022, mileage: 24500, lastServiceType: 'Oil Change' }] : [],
      garages: demoGarages,
    }, null, 2);
  }

  return 'No specialist context required.';
}

function buildSystemPrompt(activeAgentType: AgentType, conversationHistory: ChatMessage[], dbContext: string) {
  const activeConfig = AGENT_CONFIGS[activeAgentType];
  return [
    `=== ACTIVE AGENT ===\n${activeConfig.name} (${activeConfig.role})\n${activeConfig.systemPrompt}`,
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

function fallbackResponse(params: SendMessageParams): AgentResponse {
  const activeAgentType = params.currentAgent || intentToAgentType(inferIntent(params.userMessage));
  const routingIntent = inferIntent(params.userMessage);
  const routedAgentType = routingIntent === 'unclear' ? activeAgentType : intentToAgentType(routingIntent);
  const config = AGENT_CONFIGS[routedAgentType];
  const dbContext = fetchDatabaseContext(routedAgentType, params.userId, params.userMessage);

  let reply = TEAM_LEAD_GREETING;
  if (routedAgentType === 'bookings') reply = `I'm Emily, the bookings specialist. I found this booking context for you:\n${dbContext}`;
  if (routedAgentType === 'reviews') reply = `Hello, I'm Maya. Here are the latest review insights I can use:\n${dbContext}`;
  if (routedAgentType === 'maintenance') reply = `Hi, I'm Sam. Based on your request, I recommend checking relevant service history and comparing these garage options:\n${dbContext}`;
  if (routedAgentType === 'support') reply = "Hi, I'm Riley. I can help with account, payment, refund, or platform issues. Please share the booking ID or account email so I can narrow this down.";

  return {
    reply,
    agentType: routedAgentType,
    agentName: `${config.name} (${config.role})`,
    handoffOccurred: routedAgentType !== (params.currentAgent || 'team_lead'),
    mode: 'fallback',
  };
}

export async function sendAIMessage(params: SendMessageParams): Promise<AgentResponse> {
  if (!params.currentAgent && params.conversationHistory.length === 0 && !params.userMessage.trim()) {
    return {
      reply: TEAM_LEAD_GREETING,
      agentType: 'team_lead',
      agentName: 'Jordan (Team Lead)',
      handoffOccurred: false,
      mode: 'fallback',
    };
  }

  const inferred = inferIntent(params.userMessage);
  const activeAgentType = params.currentAgent || (inferred === 'unclear' ? 'team_lead' : intentToAgentType(inferred));
  const dbContext = fetchDatabaseContext(activeAgentType, params.userId, params.userMessage);
  const systemPrompt = buildSystemPrompt(activeAgentType, params.conversationHistory, dbContext);

  try {
    const raw = await generate(systemPrompt, params.userMessage);
    const envelope = parseAIResponse(raw);
    if (!envelope) return fallbackResponse(params);

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
    if (error instanceof GroqError) return fallbackResponse(params);
    throw error;
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
    agents: Object.values(AGENT_CONFIGS).map(({ type, name, role }) => ({ type, name, role })),
  };
}
