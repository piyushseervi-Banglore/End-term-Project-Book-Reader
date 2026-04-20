import Groq from 'groq-sdk';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

let groqClient = null;

const getClient = () => {
  if (!groqClient) {
    groqClient = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  }
  return groqClient;
};

const SYSTEM_PROMPT = `You are an intelligent reading assistant embedded in a PDF reader.
Your role is to help readers understand content they are reading.

When given selected text from a PDF, you:
1. Act as a dictionary — define words, explain phrases
2. Provide context and background information  
3. Explain complex concepts in simple terms
4. Summarize sections clearly
5. Answer specific questions about the content

Keep responses concise, clear, and helpful. Use markdown formatting for readability.
If defining a word, include: definition, usage, etymology if interesting.
If explaining context, be accurate and educational.`;

/**
 * Ask AI about selected PDF text — streaming
 */
export const askAboutText = async function* (selectedText, userQuery) {
  const client = getClient();

  const userContent = selectedText
    ? `📖 **Selected text from PDF:**\n"${selectedText}"\n\nUser question: ${userQuery}`
    : userQuery;

  const stream = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    stream: true,
    max_tokens: 1024,
    temperature: 0.7,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    if (text) yield text;
  }
};

/**
 * Define a word/phrase
 */
export const defineWord = async function* (word) {
  const client = getClient();

  const stream = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Define the word or phrase: "${word}"
        
Provide:
1. **Definition**: Clear, concise meaning
2. **Part of speech**: (noun, verb, adjective, etc.)
3. **Example sentence**: One practical example
4. **Related words**: 2-3 synonyms or related terms

Keep it brief and educational. Use markdown formatting.`,
      },
    ],
    stream: true,
    max_tokens: 512,
    temperature: 0.5,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    if (text) yield text;
  }
};

/**
 * Explain text in simple terms
 */
export const explainSimply = async function* (text) {
  const client = getClient();

  const stream = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Explain the following text in simple, easy-to-understand terms.
Avoid jargon. Imagine explaining to a curious high schooler.

Text: "${text}"

Format your response with:
- **Simple explanation** (2-3 sentences)
- **Key points** (bullet list if needed)`,
      },
    ],
    stream: true,
    max_tokens: 512,
    temperature: 0.6,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    if (text) yield text;
  }
};

export const isAIConfigured = () => {
  return apiKey && apiKey !== 'placeholder_groq_api_key' && apiKey.length > 10;
};

// Keep backward compat alias
export const isGeminiConfigured = isAIConfigured;
