/**
 * ProgressChecklist — onboarding progress component for the Dashboard.
 * Fetches onboarding progress from API and renders a dismissible checklist.
 * Disappears automatically when all steps are complete.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingStep {
  key: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

interface OnboardingResponse {
  steps: OnboardingStep[];
  completionPct: number;
}

const STEP_LINKS: Record<string, string> = {
  profile_setup:       '/settings',
  vertical_activation: '/vertical',
  template_installed:  '/settings',
  payment_configured:  '/billing',
  team_invited:        '/settings?tab=team',
  branding_configured: '/settings',
};

const STEP_ICONS: Record<string, string> = {
  profile_setup:       '👤',
  vertical_activation: '🏭',
  template_installed:  '📋',
  payment_configured:  '💳',
  team_invited:        '👥',
  branding_configured: '🎨',
};

const DISMISS_KEY = 'ww_onboarding_dismissed_v1';

export function ProgressChecklist() {
  const { user } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [pct, setPct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === '1'
  );
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!user?.workspaceId || dismissed) {
      setLoading(false);
      return;
    }
    api.get<OnboardingResponse>(`/onboarding/${user.workspaceId}`)
      .then(res => {
        setSteps(res.steps ?? []);
        setPct(res.completionPct ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.workspaceId, dismissed]);

  // Don't show while loading, or if dismissed, or if all 6 steps complete
  if (loading || dismissed) return null;
  if (steps.length === 0) return null;
  const completedCount = steps.filter(s => s.completed).length;
  if (completedCount >= steps.length) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const markComplete = async (stepKey: string) => {
    if (!user?.workspaceId) return;
    try {
      await api.put(`/onboarding/${user.workspaceId}/${stepKey}`, { completed: true });
      setSteps(prev => prev.map(s => s.key === stepKey ? { ...s, completed: true } : s));
      const newCompleted = steps.filter(s => s.completed || s.key === stepKey).length;
      setPct(Math.round((newCompleted / steps.length) * 100));
    } catch {/* non-blocking */}
  };

  return (
    <div style={{
      background: 'var(--ww-surface, #fff)',
      border: '1px solid var(--ww-border, #e5e7eb)',
      borderRadius: 'var(--ww-radius-lg, 12px)',
      marginBottom: 24,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: expanded ? '1px solid var(--ww-border, #e5e7eb)' : 'none',
        background: 'var(--ww-surface-2, #f9fafb)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div style={{ position: 'relative', width: 40, height: 40 }}>
            <svg viewBox="0 0 40 40" width={40} height={40} aria-hidden="true">
              <circle cx="20" cy="20" r="18" fill="none" stroke="var(--ww-border, #e5e7eb)" strokeWidth="3" />
              <circle
                cx="20" cy="20" r="18"
                fill="none"
                stroke="var(--ww-primary, #0F4C81)"
                strokeWidth="3"
                strokeDasharray={`${(pct / 100) * 113} 113`}
                strokeLinecap="round"
                transform="rotate(-90 20 20)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <span style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: 'var(--ww-primary, #0F4C81)',
            }}>{pct}%</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ww-text, #111827)' }}>
              Get your workspace ready
            </div>
            <div style={{ fontSize: 12, color: 'var(--ww-text-muted, #6b7280)' }}>
              {completedCount} of {steps.length} steps complete
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setExpanded(v => !v)}
            aria-label={expanded ? 'Collapse checklist' : 'Expand checklist'}
            style={{
              background: 'none', border: '1px solid var(--ww-border, #e5e7eb)',
              borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              fontSize: 12, color: 'var(--ww-text-muted, #6b7280)',
            }}
          >
            {expanded ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss setup checklist"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ww-text-subtle, #9ca3af)', fontSize: 18, padding: '0 4px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Steps */}
      {expanded && (
        <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {steps
            .slice()
            .sort((a, b) => a.order - b.order)
            .map(step => (
              <div key={step.key} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8,
                background: step.completed ? 'var(--ww-surface-2, #f9fafb)' : 'transparent',
                opacity: step.completed ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}>
                {/* Completion circle */}
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: step.completed ? '#059669' : 'transparent',
                  border: step.completed ? 'none' : '2px solid var(--ww-border, #d1d5db)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {step.completed && (
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </div>

                <span aria-hidden="true" style={{ fontSize: 18 }}>
                  {STEP_ICONS[step.key] ?? '📌'}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: step.completed ? 400 : 600,
                    color: step.completed ? 'var(--ww-text-muted, #6b7280)' : 'var(--ww-text, #111827)',
                    textDecoration: step.completed ? 'line-through' : 'none',
                  }}>
                    {step.title}
                  </div>
                </div>

                {!step.completed && STEP_LINKS[step.key] && (
                  <Link
                    to={STEP_LINKS[step.key]}
                    onClick={() => void markComplete(step.key)}
                    style={{
                      fontSize: 12, fontWeight: 600, color: 'var(--ww-primary, #0F4C81)',
                      textDecoration: 'none', whiteSpace: 'nowrap',
                      padding: '4px 10px', background: 'var(--ww-surface-2, #f0f9ff)',
                      borderRadius: 6, border: '1px solid rgba(15,76,129,0.2)',
                    }}
                  >
                    Do it →
                  </Link>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
