export type AgentType = 'team_lead' | 'bookings' | 'reviews' | 'maintenance' | 'support';

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  agentType?: AgentType;
  agentName?: string;
  isHandoff?: boolean;
  timestamp: number;
}

export interface AgentConfig {
  type: AgentType;
  name: string;
  role: string;
  systemPrompt: string;
}

export interface Booking {
  id: string;
  userId: string;
  garage: string;
  location: string;
  date: string;
  time: string;
  service: string;
  car: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  price: number;
  type: 'upcoming' | 'past';
}

export interface GarageService {
  id: number;
  name: string;
  price: number;
  duration: string;
}

export interface Garage {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  services: GarageService[];
}

export interface Review {
  id: number;
  user: string;
  vendor: string;
  rating: number;
  date: string;
  comment: string;
  status: 'published' | 'flagged';
}

export type RoutingIntent = 'bookings' | 'reviews' | 'maintenance' | 'general_support' | 'unclear';

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
}

export interface SendMessageParams {
  userMessage: string;
  conversationHistory: ChatMessage[];
  currentAgent: AgentType | null;
  userId: string;
}
