// AI Service — powered by OpenRouter (free, works globally including India)
// Free models: google/gemma-3-27b-it:free, mistralai/mistral-7b-instruct:free
// Get your key at: https://openrouter.ai → Keys → Create Key

const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'mistralai/mistral-7b-instruct'; // uses $1 free OpenRouter credit (~5000 req)

const SYSTEM_PROMPT = `You are an intelligent reading assistant embedded in a PDF reader.
Help readers understand content they are reading.

When given selected text from a PDF, you:
1. Act as a dictionary — define words and explain phrases
2. Provide context and background information
3. Explain complex concepts in simple terms
4. Summarize sections clearly
5. Answer specific questions about the content

Keep responses concise and helpful. Use markdown formatting.`;

/**
 * Internal streaming fetch to OpenRouter
 */
async function* streamOpenRouter(messages) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'BookReader AI Assistant',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`${res.status} ${err?.error?.message || res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete last line

    for (const line of lines) {
      const trimmed = line.replace(/^data: /, '').trim();
      if (!trimmed || trimmed === '[DONE]') continue;
      try {
        const json = JSON.parse(trimmed);
        const text = json.choices?.[0]?.delta?.content || '';
        if (text) yield text;
      } catch {}
    }
  }
}

/**
 * Ask AI about selected PDF text — streaming
 */
export const askAboutText = async function* (selectedText, userQuery) {
  const userContent = selectedText
    ? `📖 **Selected text from PDF:**\n"${selectedText}"\n\nUser question: ${userQuery}`
    : userQuery;

  yield* streamOpenRouter([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ]);
};

/**
 * Define a word/phrase
 */
export const defineWord = async function* (word) {
  yield* streamOpenRouter([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Define the word or phrase: "${word}"

Provide:
1. **Definition**: Clear, concise meaning
2. **Part of speech**: (noun, verb, adjective, etc.)
3. **Example sentence**: One practical example
4. **Related words**: 2-3 synonyms

Keep it brief and educational. Use markdown.`,
    },
  ]);
};

/**
 * Explain text in simple terms
 */
export const explainSimply = async function* (text) {
  yield* streamOpenRouter([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Explain in simple terms (like explaining to a curious high schooler):

"${text}"

Format:
- **Simple explanation** (2-3 sentences)
- **Key points** (bullet list)`,
    },
  ]);
};

export const isAIConfigured = () =>
  !!apiKey && apiKey !== 'placeholder_openrouter_api_key' && apiKey.length > 10;

// Backward compat alias
export const isGeminiConfigured = isAIConfigured;
