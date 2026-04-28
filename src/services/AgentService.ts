import type {
  AgentConfig,
  AgentResponse,
  AgentType,
  ChatMessage,
  RoutingDecision,
  RoutingIntent,
  SendMessageParams,
} from '../types/chat';
import { generate } from './GroqClient';
import {
  getBookingsByUserId,
  getGaragesByServiceType,
  getReviewsByGarageName,
} from './DatabaseTool';

// ---------------------------------------------------------------------------
// Agent configurations
// ---------------------------------------------------------------------------

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  team_lead: {
    type: 'team_lead',
    name: 'Jordan',
    role: 'Team Lead',
    systemPrompt: `You are Jordan, the Team Lead for CarMerica's customer support team. Your job is to understand what the customer needs and route them to the right specialist.

You MUST always respond with valid JSON in this exact format:
{
  "routing": {
    "intent": "<bookings|reviews|maintenance|general_support|unclear>",
    "confidence": "<high|low>",
    "clarificationQuestion": "<optional: only include when confidence is low>"
  },
  "reply": "<your message to the customer>",
  "specialistReply": "<CRITICAL: If you are handing off (confidence 'high' and intent NOT 'unclear'), you MUST provide the first message FROM the specialist here. This message should start with a self-introduction (e.g., 'Hi! I'm Emily...') and immediately address the user's query using the provided database context.>"
}

When confidence is "high" and you hand off:
1. Your 'reply' is a transition (e.g., "I'll connect you with Emily, our bookings specialist...").
2. Your 'specialistReply' is the specialist's ACTUAL response. It MUST be a full, helpful response in the specialist's persona.

Routing rules:
- "bookings" → questions about existing bookings, cancellations, rescheduling, booking history. Specialist: Emily.
- "reviews" → questions about garage reviews, ratings, or submitting a review. Specialist: Maya.
- "maintenance" → car maintenance advice, symptoms, service recommendations, garage suggestions. Specialist: Sam.
- "general_support" → refunds, account issues, complaints, platform problems. Specialist: Riley.
- "unclear" → when you genuinely cannot determine intent; set confidence to "low".`,
  },

  bookings: {
    type: 'bookings',
    name: 'Emily',
    role: 'Bookings Specialist',
    systemPrompt: `You are Emily, a Bookings Specialist at CarMerica. 
If this is your first time speaking to the customer in this thread, or if you have just been connected, start by introducing yourself: "Hi, I'm Emily, the Bookings Specialist here."

You MUST always respond with valid JSON in this exact format:
{
  "routing": { "intent": "bookings", "confidence": "high" },
  "reply": "<your helpful response addressing the bookings query>"
}

Use the booking data provided in context. Include ID, garage, and status. Be warm and efficient.`,
  },

  reviews: {
    type: 'reviews',
    name: 'Maya',
    role: 'Reviews Specialist',
    systemPrompt: `You are Maya, a Reviews Specialist at CarMerica. 
If this is your first time speaking to the customer in this thread, or if you have just been connected, start by introducing yourself: "Hello! I'm Maya, and I handle all things related to garage reviews and ratings."

You MUST always respond with valid JSON in this exact format:
{
  "routing": { "intent": "reviews", "confidence": "high" },
  "reply": "<your helpful response about reviews or ratings>"
}

Use the review data in context. Provide summaries and average ratings.`,
  },

  maintenance: {
    type: 'maintenance',
    name: 'Sam',
    role: 'Maintenance Advisor',
    systemPrompt: `You are Sam, a Maintenance Advisor at CarMerica. 
If this is your first time speaking to the customer in this thread, or if you have just been connected, start by introducing yourself: "Hi there, I'm Sam. I'm here to help with your car maintenance questions and recommendations."

You MUST always respond with valid JSON in this exact format:
{
  "routing": { "intent": "maintenance", "confidence": "high" },
  "reply": "<your knowledgeable advice or garage recommendations>"
}

Use the garage data in context for recommendations. Suggest 2-3 options.`,
  },

  support: {
    type: 'support',
    name: 'Riley',
    role: 'Support Specialist',
    systemPrompt: `You are Riley, a Support Specialist at CarMerica. 
If this is your first time speaking to the customer in this thread, or if you have just been connected, start by introducing yourself: "Hi, I'm Riley. I handle general support and platform issues."

You MUST always respond with valid JSON in this exact format:
{
  "routing": { "intent": "general_support", "confidence": "high" },
  "reply": "<your empathetic response addressing the support issue>"
}

Be professional and reassuring.`,
  },
};

// ---------------------------------------------------------------------------
// Greeting message
// ---------------------------------------------------------------------------

const TEAM_LEAD_GREETING =
  "Hi there! I'm Jordan, your CarMerica support team lead. I'm here to connect you with the right specialist — whether you need help with a booking, want to check out garage reviews, need some maintenance advice, or have a general question. What can we help you with today?";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatConversationHistory(history: ChatMessage[]): string {
  if (history.length === 0) return 'No previous messages.';
  return history
    .map((m) => {
      const speaker = m.role === 'user' ? 'Customer' : m.agentName ?? 'Agent';
      return `${speaker}: ${m.text}`;
    })
    .join('\n');
}

function intentToAgentType(intent: RoutingIntent): AgentType {
  switch (intent) {
    case 'bookings': return 'bookings';
    case 'reviews': return 'reviews';
    case 'maintenance': return 'maintenance';
    case 'general_support': return 'support';
    default: return 'team_lead';
  }
}

function agentTypeToIntent(agentType: AgentType): RoutingIntent {
  switch (agentType) {
    case 'bookings': return 'bookings';
    case 'reviews': return 'reviews';
    case 'maintenance': return 'maintenance';
    case 'support': return 'general_support';
    default: return 'unclear';
  }
}

// ---------------------------------------------------------------------------
// Database context fetching
// ---------------------------------------------------------------------------

async function fetchDatabaseContext(
  agentType: AgentType,
  userId: string,
  conversationHistory: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const fullText = [...conversationHistory.map((m) => m.text), userMessage].join(' ');

  switch (agentType) {
    case 'bookings': {
      const bookings = getBookingsByUserId(userId);
      return bookings.length === 0 ? 'No bookings found.' : `User bookings:\n${JSON.stringify(bookings, null, 2)}`;
    }
    case 'reviews': {
      const garageNames = ['Elite Auto Care', 'Precision Mechanics', 'The Garage Co.'];
      const mentionedGarage = garageNames.find((name) => fullText.toLowerCase().includes(name.toLowerCase()));
      if (mentionedGarage) {
        const reviews = getReviewsByGarageName(mentionedGarage);
        return reviews.length === 0 ? `No reviews for ${mentionedGarage}.` : `Reviews for ${mentionedGarage}:\n${JSON.stringify(reviews, null, 2)}`;
      }
      return 'No garage mentioned.';
    }
    case 'maintenance': {
      const serviceKeywords = ['oil change', 'brake', 'ac', 'general service', 'full service', 'electrical', 'tyre', 'engine'];
      const mentionedService = serviceKeywords.find((kw) => fullText.toLowerCase().includes(kw));
      if (mentionedService) {
        const garages = getGaragesByServiceType(mentionedService);
        return garages.length === 0 ? `No garages for "${mentionedService}".` : `Garages offering "${mentionedService}":\n${JSON.stringify(garages, null, 2)}`;
      }
      return 'No specific service type detected.';
    }
    default:
      return 'No context needed.';
  }
}

// ---------------------------------------------------------------------------
// Prompt assembly
// ---------------------------------------------------------------------------

function buildSystemPrompt(
  activeAgentType: AgentType,
  conversationHistory: ChatMessage[],
  dbContext: string,
): string {
  const teamLeadConfig = AGENT_CONFIGS.team_lead;
  const activeConfig = AGENT_CONFIGS[activeAgentType];
  const historyText = formatConversationHistory(conversationHistory);

  return [
    `=== TEAM LEAD INSTRUCTIONS ===\n${teamLeadConfig.systemPrompt}`,
    activeAgentType !== 'team_lead' ? `=== ACTIVE SPECIALIST: ${activeConfig.name} (${activeConfig.role}) ===\n${activeConfig.systemPrompt}` : '',
    `=== CONVERSATION HISTORY ===\n${historyText}`,
    `=== DATABASE CONTEXT ===\n${dbContext}`,
    `=== INSTRUCTIONS ===\nYou are currently acting as ${activeConfig.name} (${activeConfig.role}). ` +
    `Respond to the customer's message. Always return valid JSON with "routing", "reply", and "specialistReply" (if handoff).`
  ].filter(Boolean).join('\n\n');
}

// ---------------------------------------------------------------------------
// JSON parsing
// ---------------------------------------------------------------------------

interface ResponseEnvelope {
  routing: RoutingDecision;
  reply: string;
  specialistReply?: string;
}

function parseGeminiResponse(raw: string): ResponseEnvelope | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned) as ResponseEnvelope;
    if (parsed && typeof parsed.reply === 'string' && parsed.routing) return parsed;
    return null;
  } catch { return null; }
}

// ---------------------------------------------------------------------------
// sendMessage
// ---------------------------------------------------------------------------

export async function sendMessage(params: SendMessageParams): Promise<AgentResponse> {
  const { userMessage, conversationHistory, currentAgent, userId } = params;

  if (currentAgent === null && conversationHistory.length === 0) {
    return { reply: TEAM_LEAD_GREETING, agentType: 'team_lead', agentName: 'Jordan (Team Lead)', handoffOccurred: false };
  }

  const activeAgentType: AgentType = currentAgent ?? 'team_lead';
  const dbContext = await fetchDatabaseContext(activeAgentType, userId, conversationHistory, userMessage);
  const systemPrompt = buildSystemPrompt(activeAgentType, conversationHistory, dbContext);
  const rawResponse = await generate(systemPrompt, userMessage);
  const envelope = parseGeminiResponse(rawResponse);

  let routing: RoutingDecision;
  let replyText: string;
  let specialistReply: string | undefined;

  if (envelope) {
    routing = envelope.routing;
    replyText = envelope.reply;
    specialistReply = envelope.specialistReply;
  } else {
    replyText = rawResponse;
    routing = { intent: agentTypeToIntent(activeAgentType), confidence: 'high' };
  }

  const newAgentType = (routing.confidence === 'low' || routing.intent === 'unclear') ? 'team_lead' : intentToAgentType(routing.intent);
  const newAgentConfig = AGENT_CONFIGS[newAgentType];
  const handoffOccurred = newAgentType !== activeAgentType;

  return {
    reply: replyText,
    specialistReply,
    agentType: newAgentType,
    agentName: `${newAgentConfig.name} (${newAgentConfig.role})`,
    handoffOccurred,
  };
}
