/**
 * AdminHITL — refactored to use shared api.ts (H7 fix)
 */
import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { toast } from '../lib/toast';
import { api, ApiError } from '../lib/api';

interface HITLAction {
  id: string;
  vertical: string;
  capability: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  tenantId: string;
  workspaceId: string;
  proposedAction: {
    type: string;
    payload: Record<string, unknown>;
  };
  aiReasoning: string;
  requestedAt: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b7280',
};

export default function AdminHITL() {
  const [actions, setActions] = useState<HITLAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<HITLAction | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPendingActions = useCallback(async () => {
    try {
      const data = await api.get<{ actions: HITLAction[] }>(
        '/admin/hitl/actions?status=pending',
      );
      setActions(data.actions ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // endpoint not yet deployed — show empty state
        setActions([]);
      } else {
        toast.error('Failed to load pending actions');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPendingActions();
    const interval = setInterval(() => { void fetchPendingActions(); }, 10_000);
    return () => clearInterval(interval);
  }, [fetchPendingActions]);

  const handleApprove = async (action: HITLAction) => {
    setProcessing(action.id);
    try {
      await api.post(`/admin/hitl/actions/${action.id}/approve`, { note: '' });
      toast.success(`Approved: ${action.capability} for ${action.vertical}`);
      setSelectedAction(null);
      await fetchPendingActions();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to approve action';
      toast.error(msg);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (action: HITLAction) => {
    setProcessing(action.id);
    try {
      await api.post(`/admin/hitl/actions/${action.id}/reject`, { note: '' });
      toast.success(`Rejected: ${action.capability} for ${action.vertical}`);
      setSelectedAction(null);
      await fetchPendingActions();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to reject action';
      toast.error(msg);
    } finally {
      setProcessing(null);
    }
  };

  const pendingActions = actions.filter(a => a.status === 'pending');

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }} id="main-content">
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
          AI Action Review Queue
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          Review and approve AI-suggested actions requiring human oversight
        </p>
        <div style={{ marginTop: 14 }}>
          <span style={{
            padding: '6px 16px', background: pendingActions.length > 0 ? '#fef9c3' : '#f3f4f6',
            borderRadius: 8, fontSize: 15, fontWeight: 600,
            color: pendingActions.length > 0 ? '#92400e' : '#374151',
          }}>
            {pendingActions.length} Pending
          </span>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', background: '#f9fafb', borderRadius: 12 }}>
          <p style={{ color: '#6b7280' }}>Loading actions…</p>
        </div>
      ) : pendingActions.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: '#f9fafb', borderRadius: 12 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>All Caught Up!</h3>
          <p style={{ color: '#6b7280' }}>No pending actions require review</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedAction ? '1fr 1fr' : '1fr',
          gap: 24,
        }}>
          {/* Action list */}
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {pendingActions.map(action => (
              <div
                key={action.id}
                onClick={() => setSelectedAction(action)}
                role="button"
                tabIndex={0}
                aria-pressed={selectedAction?.id === action.id}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedAction(action)}
                style={{
                  padding: 20,
                  marginBottom: 16,
                  background: '#fff',
                  border: selectedAction?.id === action.id
                    ? '2px solid #0F4C81'
                    : '1px solid #e5e7eb',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{action.vertical}</h3>
                  <span style={{
                    padding: '3px 10px',
                    background: PRIORITY_COLORS[action.priority] ?? '#6b7280',
                    color: '#fff',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {action.priority}
                  </span>
                </div>
                <p style={{ color: '#374151', fontSize: 13, marginBottom: 4 }}>{action.capability}</p>
                <p style={{ color: '#6b7280', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {action.aiReasoning.substring(0, 100)}{action.aiReasoning.length > 100 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>

          {/* Detail pane */}
          {selectedAction && (
            <div style={{
              padding: 24,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              position: 'sticky',
              top: 24,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Action Details</h2>
                <button
                  onClick={() => setSelectedAction(null)}
                  style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}
                  aria-label="Close detail panel"
                >×</button>
              </div>

              <dl style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 14 }}>
                <div>
                  <dt style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>Vertical / Capability</dt>
                  <dd style={{ color: '#111827' }}>{selectedAction.vertical} / {selectedAction.capability}</dd>
                </div>
                <div>
                  <dt style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>AI Reasoning</dt>
                  <dd style={{ color: '#6b7280', lineHeight: 1.6 }}>{selectedAction.aiReasoning}</dd>
                </div>
                <div>
                  <dt style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>Proposed Action</dt>
                  <dd>
                    <pre style={{
                      fontSize: 12,
                      background: '#f9fafb',
                      padding: 12,
                      borderRadius: 8,
                      overflowX: 'auto',
                      border: '1px solid #e5e7eb',
                      lineHeight: 1.5,
                    }}>
                      {JSON.stringify(selectedAction.proposedAction, null, 2)}
                    </pre>
                  </dd>
                </div>
                <div>
                  <dt style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>Context</dt>
                  <dd style={{ color: '#6b7280', lineHeight: 1.8 }}>
                    Tenant: {selectedAction.tenantId}<br />
                    Workspace: {selectedAction.workspaceId}<br />
                    Requested: {new Date(selectedAction.requestedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <Button
                  onClick={() => void handleApprove(selectedAction)}
                  loading={processing === selectedAction.id}
                  style={{ flex: 1, background: '#059669', borderColor: '#059669', justifyContent: 'center' }}
                >
                  ✓ Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => void handleReject(selectedAction)}
                  loading={processing === selectedAction.id}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  ✕ Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
