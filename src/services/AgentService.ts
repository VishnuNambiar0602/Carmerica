import type { AgentResponse, SendMessageParams } from '../types/chat';

export async function sendMessage(params: SendMessageParams): Promise<AgentResponse> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'AI support request failed');
  }

  return data as AgentResponse;
}
