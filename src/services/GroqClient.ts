// Groq API client — fast, free tier, production-ready
// Get your key at https://console.groq.com/keys
// Set GROQ_API_KEY in your .env file

const MODEL = 'llama-3.1-8b-instant'; // fast + free on Groq
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'GroqError';
  }
}

export async function generate(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new GroqError(
      'Groq API key is missing or is the placeholder. ' +
      'Please replace "your_groq_api_key_here" with your actual Groq API key in the .env file.'
    );
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new GroqError(`Groq API error ${res.status}: ${body}`);
    }

    const data = await res.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new GroqError('Groq returned an empty response.');

    return text;
  } catch (err) {
    if (err instanceof GroqError) throw err;
    throw new GroqError('Failed to reach Groq API.', err);
  }
}
