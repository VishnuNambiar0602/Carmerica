const DEFAULT_MODEL = 'llama-3.1-8b-instant';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'GroqError';
  }
}

export async function generate(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY' || apiKey === 'your_groq_api_key_here') {
    throw new GroqError('Groq API key is not configured.');
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 700,
      }),
    });

    if (!res.ok) {
      throw new GroqError(`Groq API error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new GroqError('Groq returned an empty response.');
    return text;
  } catch (error) {
    if (error instanceof GroqError) throw error;
    throw new GroqError('Failed to reach Groq API.', error);
  }
}
