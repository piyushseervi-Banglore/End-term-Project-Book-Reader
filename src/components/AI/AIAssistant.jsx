import { useState, useRef, useEffect, useCallback } from 'react';
import { usePDF } from '../../contexts/PDFContext';
import { useAI } from '../../hooks/useAI';
import { Bot, X, Send, Trash2, Square, Sparkles, BookOpen } from 'lucide-react';

// Simple markdown renderer
const renderMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
};

const QUICK_PROMPTS = [
  { label: '📖 Summarize', query: 'Summarize the selected text briefly.' },
  { label: '🔤 Define', query: 'Define the key terms in the selected text.' },
  { label: '💡 Simplify', query: 'Explain the selected text in simple terms.' },
  { label: '🌐 Context', query: 'Give me historical or background context for the selected text.' },
];

export const AIAssistant = () => {
  const { aiPanelOpen, setAIOpen, selectedText, setSelectedText } = usePDF();
  const {
    messages, isLoading, selectedContext, setSelectedContext,
    sendMessage, defineSelected, explainSelected,
    clearMessages, stopGeneration, isConfigured,
  } = useAI();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Sync PDF selection to AI context
  useEffect(() => {
    if (selectedText && selectedText.length > 0) {
      setSelectedContext(selectedText);
    }
  }, [selectedText, setSelectedContext]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const q = input.trim();
    if (!q || isLoading) return;
    setInput('');
    await sendMessage(q, selectedContext);
  }, [input, isLoading, sendMessage, selectedContext]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (query) => {
    sendMessage(query, selectedContext);
  };

  const clearContext = () => {
    setSelectedContext('');
    setSelectedText('');
  };

  return (
    <div className={`ai-panel ${aiPanelOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="ai-panel-header">
        <div className="ai-badge">
          <div className="ai-dot" />
          Gemini AI
        </div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
          Reading Assistant
        </span>
        {messages.length > 0 && (
          <button className="btn-icon" onClick={clearMessages} title="Clear conversation">
            <Trash2 size={15} />
          </button>
        )}
        <button className="btn-icon" onClick={() => setAIOpen(false)}>
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="ai-messages">
        {messages.length === 0 ? (
          <div className="ai-welcome">
            <div className="ai-welcome-icon">
              <Sparkles size={28} color="var(--accent-secondary)" />
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)', fontSize: 15 }}>
                Your AI Reading Assistant
              </strong>
              <p style={{ marginTop: 6 }}>
                Select text from the PDF to get instant definitions, explanations, and context.
              </p>
            </div>
            {!isConfigured && (
              <div style={{
                background: 'rgba(255,169,77,0.1)', border: '1px solid rgba(255,169,77,0.3)',
                borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--accent-warning)',
                textAlign: 'left', width: '100%',
              }}>
                ⚠️ <strong>API key not set.</strong> Add <code>VITE_GEMINI_API_KEY</code> to your <code>.env</code> file.
              </div>
            )}
            {selectedContext && (
              <div style={{ width: '100%' }}>
                <div className="ai-context-pill">
                  <BookOpen size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Selected: </strong>
                    <span className="ai-context-text">"{selectedContext}"</span>
                  </div>
                </div>
                <div className="ai-quick-actions">
                  {QUICK_PROMPTS.map((p) => (
                    <button key={p.label} className="ai-chip" onClick={() => handleQuickPrompt(p.query)}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!selectedContext && (
              <div className="ai-quick-actions">
                <span className="ai-chip" onClick={() => sendMessage('What makes a good reading habit?')}>
                  💬 Try asking something
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message ${msg.role}`}>
                {msg.role === 'user' ? (
                  <div className="msg-bubble">{msg.content}</div>
                ) : (
                  <div className={`msg-bubble ${!msg.content ? '' : ''}`}>
                    {!msg.content && isLoading ? (
                      <div className="typing-indicator">
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    ) : (
                      <div
                        className={`markdown-content ${isLoading && msg === messages[messages.length - 1] ? 'stream-cursor' : ''}`}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) || '…' }}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="ai-input-area">
        {selectedContext && (
          <div className="ai-context-banner">
            <BookOpen size={12} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              Context: "{selectedContext.slice(0, 50)}{selectedContext.length > 50 ? '…' : ''}"
            </span>
            <span className="ai-context-clear" onClick={clearContext}>✕</span>
          </div>
        )}
        <div className="ai-input-row">
          <textarea
            ref={textareaRef}
            className="ai-textarea"
            placeholder={selectedContext ? 'Ask about the selected text…' : 'Ask anything about your book…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          {isLoading ? (
            <button className="ai-send-btn" onClick={stopGeneration} title="Stop generation">
              <Square size={14} />
            </button>
          ) : (
            <button
              className="ai-send-btn"
              onClick={handleSend}
              disabled={!input.trim()}
              title="Send (Enter)"
            >
              <Send size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
