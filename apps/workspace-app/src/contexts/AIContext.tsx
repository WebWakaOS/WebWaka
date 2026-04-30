import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ChatMessage, ChatResponse, ConsentStatus, SessionSummary } from '@/lib/superagent-api';
import * as api from '@/lib/superagent-api';

// -------------------------------------------------------------------------
// State
// -------------------------------------------------------------------------

interface AIState {
  consent: ConsentStatus | null;
  consentLoading: boolean;
  messages: ChatMessage[];
  sessionId: string | null;
  sessions: SessionSummary[];
  sending: boolean;
  error: string | null;
}

type AIAction =
  | { type: 'CONSENT_LOADED'; consent: ConsentStatus }
  | { type: 'CONSENT_LOADING' }
  | { type: 'CONSENT_ERROR'; error: string }
  | { type: 'SESSIONS_LOADED'; sessions: SessionSummary[] }
  | { type: 'SESSION_STARTED'; sessionId: string }
  | { type: 'MESSAGE_SENT'; message: ChatMessage }
  | { type: 'RESPONSE_RECEIVED'; response: ChatResponse; sessionId: string }
  | { type: 'SENDING' }
  | { type: 'ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'HISTORY_LOADED'; messages: ChatMessage[]; sessionId: string }
  | { type: 'NEW_SESSION' };

function reducer(state: AIState, action: AIAction): AIState {
  switch (action.type) {
    case 'CONSENT_LOADING':
      return { ...state, consentLoading: true };
    case 'CONSENT_LOADED':
      return { ...state, consent: action.consent, consentLoading: false };
    case 'CONSENT_ERROR':
      return { ...state, consentLoading: false, error: action.error };
    case 'SESSIONS_LOADED':
      return { ...state, sessions: action.sessions };
    case 'SESSION_STARTED':
      return { ...state, sessionId: action.sessionId };
    case 'MESSAGE_SENT':
      return { ...state, messages: [...state.messages, action.message], sending: true, error: null };
    case 'RESPONSE_RECEIVED': {
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: action.response.content,
        tool_calls: action.response.tool_calls,
        timestamp: Date.now(),
      };
      return {
        ...state,
        messages: [...state.messages, assistantMsg],
        sessionId: action.sessionId,
        sending: false,
      };
    }
    case 'SENDING':
      return { ...state, sending: true, error: null };
    case 'ERROR':
      return { ...state, sending: false, error: action.error };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'HISTORY_LOADED':
      return { ...state, messages: action.messages, sessionId: action.sessionId };
    case 'NEW_SESSION':
      return { ...state, messages: [], sessionId: null };
    default:
      return state;
  }
}

// -------------------------------------------------------------------------
// Context
// -------------------------------------------------------------------------

interface AIContextValue {
  state: AIState;
  loadConsent: () => Promise<void>;
  grantConsent: () => Promise<void>;
  revokeConsent: () => Promise<void>;
  sendMessage: (text: string, capability?: string, vertical?: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  newSession: () => void;
}

const AIContext = createContext<AIContextValue | null>(null);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    consent: null,
    consentLoading: false,
    messages: [],
    sessionId: null,
    sessions: [],
    sending: false,
    error: null,
  });

  const loadConsent = useCallback(async () => {
    dispatch({ type: 'CONSENT_LOADING' });
    try {
      const consent = await api.getConsentStatus();
      dispatch({ type: 'CONSENT_LOADED', consent });
    } catch (err) {
      dispatch({ type: 'CONSENT_ERROR', error: (err as Error).message });
    }
  }, []);

  const grantConsent = useCallback(async () => {
    dispatch({ type: 'CONSENT_LOADING' });
    try {
      const consent = await api.grantConsent();
      dispatch({ type: 'CONSENT_LOADED', consent });
    } catch (err) {
      dispatch({ type: 'CONSENT_ERROR', error: (err as Error).message });
    }
  }, []);

  const revokeConsentFn = useCallback(async () => {
    dispatch({ type: 'CONSENT_LOADING' });
    try {
      await api.revokeConsent();
      dispatch({ type: 'CONSENT_LOADED', consent: { has_consent: false } });
    } catch (err) {
      dispatch({ type: 'CONSENT_ERROR', error: (err as Error).message });
    }
  }, []);

  const sendMessage = useCallback(async (text: string, capability?: string, vertical?: string) => {
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    dispatch({ type: 'MESSAGE_SENT', message: userMsg });

    try {
      const response = await api.sendChat({
        message: text,
        session_id: state.sessionId ?? undefined,
        capability,
        vertical,
      });
      dispatch({ type: 'RESPONSE_RECEIVED', response, sessionId: response.session_id });
    } catch (err) {
      dispatch({ type: 'ERROR', error: (err as Error).message });
    }
  }, [state.sessionId]);

  const loadSessions = useCallback(async () => {
    try {
      const { sessions } = await api.listSessions();
      dispatch({ type: 'SESSIONS_LOADED', sessions });
    } catch { /* Ignore — sessions may not exist yet */ }
  }, []);

  const resumeSession = useCallback(async (sessionId: string) => {
    try {
      const { messages } = await api.getSessionHistory(sessionId);
      dispatch({ type: 'HISTORY_LOADED', messages, sessionId });
    } catch (err) {
      dispatch({ type: 'ERROR', error: (err as Error).message });
    }
  }, []);

  const newSession = useCallback(() => {
    dispatch({ type: 'NEW_SESSION' });
  }, []);

  return (
    <AIContext.Provider value={{
      state,
      loadConsent,
      grantConsent,
      revokeConsent: revokeConsentFn,
      sendMessage,
      loadSessions,
      resumeSession,
      newSession,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI(): AIContextValue {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be inside AIProvider');
  return ctx;
}
