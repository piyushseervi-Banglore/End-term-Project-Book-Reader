import { useState, useCallback, useRef } from 'react';
import { askAboutText, defineWord, explainSimply, isGeminiConfigured } from '../services/gemini';

export const useAI = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState('');
  const abortRef = useRef(false);

  const addMessage = useCallback((role, content) => {
    setMessages((prev) => [...prev, { id: Date.now(), role, content }]);
  }, []);

  const updateLastAssistant = useCallback((content) => {
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last?.role === 'assistant') {
        copy[copy.length - 1] = { ...last, content };
      }
      return copy;
    });
  }, []);

  const sendMessage = useCallback(async (query, context = '') => {
    if (!isGeminiConfigured()) {
      addMessage('assistant', '⚠️ **Gemini API key not configured.**\n\nAdd your `VITE_GEMINI_API_KEY` to `.env` and restart. Get a free key at [aistudio.google.com](https://aistudio.google.com/apikey)');
      return;
    }
    if (isLoading) return;

    abortRef.current = false;
    const ctx = context || selectedContext;

    addMessage('user', query);
    setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: '' }]);
    setIsLoading(true);

    try {
      let accumulated = '';
      const gen = askAboutText(ctx, query);
      for await (const chunk of gen) {
        if (abortRef.current) break;
        accumulated += chunk;
        updateLastAssistant(accumulated);
      }
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('rate_limit')) {
        updateLastAssistant(
          '⏱️ **API quota exceeded.**\n\nThis Gemini API key has hit its limit. To fix:\n\n1. Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**\n2. Click **"Create API key in new project"**\n3. Paste the new key into `.env` as `VITE_GEMINI_API_KEY`'
        );
      } else if (msg.includes('403') || msg.includes('API_KEY_INVALID')) {
        updateLastAssistant('🔑 **Invalid API key.** Please check your `VITE_GEMINI_API_KEY` in `.env`.');
      } else if (msg.includes('404') || msg.includes('not found')) {
        updateLastAssistant('🤖 **Model not available.** The selected Gemini model is unavailable for this key. Try regenerating your key at [aistudio.google.com](https://aistudio.google.com/apikey).');
      } else {
        updateLastAssistant(`❌ **Error:** ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedContext, addMessage, updateLastAssistant]);

  const defineSelected = useCallback(async (word) => {
    if (!isGeminiConfigured()) return;
    addMessage('user', `Define: "${word}"`);
    setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: '' }]);
    setIsLoading(true);
    try {
      let accumulated = '';
      for await (const chunk of defineWord(word)) {
        if (abortRef.current) break;
        accumulated += chunk;
        updateLastAssistant(accumulated);
      }
    } catch (err) {
      updateLastAssistant(`❌ ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, updateLastAssistant]);

  const explainSelected = useCallback(async (text) => {
    if (!isGeminiConfigured()) return;
    addMessage('user', `Explain in simple terms: "${text.slice(0, 100)}..."`);
    setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: '' }]);
    setIsLoading(true);
    try {
      let accumulated = '';
      for await (const chunk of explainSimply(text)) {
        if (abortRef.current) break;
        accumulated += chunk;
        updateLastAssistant(accumulated);
      }
    } catch (err) {
      updateLastAssistant(`❌ ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, updateLastAssistant]);

  const clearMessages = useCallback(() => setMessages([]), []);
  const stopGeneration = useCallback(() => { abortRef.current = true; setIsLoading(false); }, []);

  return {
    messages,
    isLoading,
    selectedContext,
    setSelectedContext,
    sendMessage,
    defineSelected,
    explainSelected,
    clearMessages,
    stopGeneration,
    isConfigured: isGeminiConfigured(),
  };
};
