import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

const getModel = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  }
  return model;
};

/**
 * Ask Gemini a question about selected PDF text (dictionary/context mode)
 * @param {string} selectedText - The text selected in the PDF
 * @param {string} userQuery - The user's question
 * @param {Array} history - Previous conversation messages
 * @returns {AsyncGenerator} - Streaming response chunks
 */
export const askAboutText = async function* (selectedText, userQuery, history = []) {
  const m = getModel();

  const systemPrompt = `You are an intelligent reading assistant embedded in a PDF reader. 
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

  const contextPart = selectedText
    ? `\n\n📖 **Selected text from PDF:**\n"${selectedText}"\n\n`
    : '';

  const fullPrompt = `${systemPrompt}${contextPart}User question: ${userQuery}`;

  const result = await m.generateContentStream(fullPrompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
};

/**
 * Quick definition lookup
 */
export const defineWord = async function* (word) {
  const m = getModel();
  const prompt = `Define the word or phrase: "${word}"
  
Provide:
1. **Definition**: Clear, concise meaning
2. **Part of speech**: (noun, verb, adjective, etc.)
3. **Example sentence**: One practical example
4. **Related words**: 2-3 synonyms or related terms

Keep it brief and educational. Use markdown formatting.`;

  const result = await m.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
};

/**
 * Explain a paragraph in simple terms
 */
export const explainSimply = async function* (text) {
  const m = getModel();
  const prompt = `Explain the following text in simple, easy-to-understand terms. 
Avoid jargon. Imagine explaining to a curious high schooler.

Text: "${text}"

Format your response with:
- **Simple explanation** (2-3 sentences)
- **Key points** (bullet list if needed)`;

  const result = await m.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
};

export const isGeminiConfigured = () => {
  return apiKey && apiKey !== 'placeholder_gemini_api_key' && apiKey.length > 10;
};
