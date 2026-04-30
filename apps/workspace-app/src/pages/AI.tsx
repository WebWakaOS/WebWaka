/**
 * SuperAgent AI Chat Page — workspace-app
 *
 * Multi-turn chat interface with:
 * - Consent management (NDPR P10)
 * - Message history
 * - Session management
 * - Tool call display
 * - Usage summary
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAI } from '@/contexts/AIContext';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatMessage } from '@/lib/superagent-api';

// -------------------------------------------------------------------------
// Consent Gate Component
// -------------------------------------------------------------------------

function ConsentGate({ onGranted }: { onGranted: () => void }) {
  const { state, grantConsent } = useAI();
  const [granting, setGranting] = useState(false);

  const handleGrant = async () => {
    setGranting(true);
    await grantConsent();
    setGranting(false);
    onGranted();
  };

  return (
    <div style={{
      maxWidth: 540,
      margin: '64px auto',
      padding: 32,
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">&#129302;</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
        AI Assistant — Data Processing Consent
      </h2>
      <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
        To use the AI assistant, we need your consent to process your workspace data
        in accordance with the Nigeria Data Protection Regulation (NDPR).
        Your data is used only to provide AI-powered insights for your business.
        You can revoke consent at any time from Settings.
      </p>
      <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, marginBottom: 24, textAlign: 'left', fontSize: 13, color: '#475569' }}>
        <strong>What we process:</strong>
        <ul style={{ margin: '8px 0 0 16px', padding: 0, lineHeight: 1.8 }}>
          <li>Your messages to the AI assistant</li>
          <li>Workspace operational data (aggregated, no individual PII)</li>
          <li>AI tool execution results</li>
        </ul>
      </div>
      {state.error && (
        <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{state.error}</p>
      )}
      <button
        onClick={handleGrant}
        disabled={granting}
        style={{
          padding: '14px 32px',
          background: '#0F4C81',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 600,
          cursor: granting ? 'not-allowed' : 'pointer',
          opacity: granting ? 0.6 : 1,
          minHeight: 48,
          minWidth: 180,
        }}
        data-testid="grant-consent-btn"
      >
        {granting ? 'Granting...' : 'Grant Consent & Start'}
      </button>
    </div>
  );
}

// -------------------------------------------------------------------------
// Message Bubble
// -------------------------------------------------------------------------

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          maxWidth: '75%',
          padding: '12px 16px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser ? '#0F4C81' : '#f1f5f9',
          color: isUser ? '#fff' : '#1e293b',
          fontSize: 14,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
        data-testid={`msg-${msg.role}`}
      >
        {msg.content}
        {msg.tool_calls && msg.tool_calls.length > 0 && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Tool Calls:
            </span>
            {msg.tool_calls.map((tc) => (
              <div key={tc.id} style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>
                &#x2022; {tc.name} ({tc.status ?? 'executed'})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Session Sidebar
// -------------------------------------------------------------------------

function SessionSidebar({
  sessions,
  currentSessionId,
  onSelect,
  onNew,
}: {
  sessions: { session_id: string; vertical: string; last_message_at: number; message_count: number; title?: string }[];
  currentSessionId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div style={{
      width: 260,
      borderRight: '1px solid #e2e8f0',
      background: '#fafbfc',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Sessions</span>
        <button
          onClick={onNew}
          style={{ padding: '6px 12px', background: '#0F4C81', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          data-testid="new-session-btn"
        >
          + New
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {sessions.length === 0 && (
          <p style={{ padding: '16px', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>No sessions yet</p>
        )}
        {sessions.map((s) => (
          <button
            key={s.session_id}
            onClick={() => onSelect(s.session_id)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 16px',
              border: 'none',
              background: s.session_id === currentSessionId ? '#e0f2fe' : 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              color: '#334155',
              borderLeft: s.session_id === currentSessionId ? '3px solid #0F4C81' : '3px solid transparent',
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: 2 }}>
              {s.title ?? s.vertical ?? 'Untitled'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {s.message_count} messages
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Main Chat Page
// -------------------------------------------------------------------------

export default function AIPage() {
  const { state, loadConsent, sendMessage, loadSessions, resumeSession, newSession } = useAI();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConsent();
    loadSessions();
  }, [loadConsent, loadSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || state.sending) return;
    setInput('');
    await sendMessage(text);
    inputRef.current?.focus();
  }, [input, state.sending, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Loading consent
  if (state.consentLoading && !state.consent) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ fontSize: 15, color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  // Consent gate
  if (state.consent && !state.consent.has_consent) {
    return <ConsentGate onGranted={() => loadConsent()} />;
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#fff' }}>
      {/* Session Sidebar */}
      <SessionSidebar
        sessions={state.sessions}
        currentSessionId={state.sessionId}
        onSelect={resumeSession}
        onNew={newSession}
      />

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0F4C81', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700 }}>
            AI
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
              WebWaka AI Assistant
            </h1>
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
              Powered by SuperAgent {state.sessionId ? `— Session active` : ''}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px 8px' }}>
          {state.messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">&#128172;</div>
              <p style={{ fontSize: 15, fontWeight: 500 }}>Start a conversation</p>
              <p style={{ fontSize: 13 }}>
                Ask me about your business operations, forecasting, scheduling, or anything else.
              </p>
            </div>
          )}
          {state.messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {state.sending && (
            <div style={{ display: 'flex', gap: 4, padding: '8px 16px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', animation: 'pulse 1s infinite' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', animation: 'pulse 1s infinite 0.2s' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', animation: 'pulse 1s infinite 0.4s' }} />
            </div>
          )}
          {state.error && (
            <div style={{ padding: '8px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13, marginTop: 8 }}>
              {state.error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 24px 20px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                fontSize: 14,
                lineHeight: 1.5,
                outline: 'none',
                maxHeight: 120,
                minHeight: 44,
              }}
              data-testid="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || state.sending}
              style={{
                padding: '12px 20px',
                background: input.trim() && !state.sending ? '#0F4C81' : '#94a3b8',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: input.trim() && !state.sending ? 'pointer' : 'not-allowed',
                minHeight: 44,
                minWidth: 80,
              }}
              data-testid="send-btn"
            >
              {state.sending ? '...' : 'Send'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, textAlign: 'center' }}>
            AI responses are generated. Verify important information.
            {user?.tenantId && ` Tenant: ${user.tenantId.slice(0, 8)}...`}
          </p>
        </div>
      </div>
    </div>
  );
}
