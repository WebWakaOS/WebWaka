/**
 * Admin HITL (Human-In-The-Loop) Dashboard
 * 
 * Phase 1 Task (Step 4): Admin dashboard HITL UI scaffold
 * 
 * Provides interface for admin/super_admin to review and approve/reject
 * AI-generated actions that require human oversight (autonomy level 3).
 */

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { toast } from '../lib/toast';

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

export default function AdminHITL() {
  const [actions, setActions] = useState<HITLAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<HITLAction | null>(null);

  useEffect(() => {
    fetchPendingActions();
    const interval = setInterval(fetchPendingActions, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchPendingActions() {
    try {
      // TODO: Implement actual API endpoint
      // Mock data for scaffold
      setActions([
        {
          id: 'hitl_001',
          vertical: 'bakery',
          capability: 'inventory_advisory',
          status: 'pending',
          priority: 'high',
          tenantId: 'tnt_123',
          workspaceId: 'ws_456',
          proposedAction: {
            type: 'update_inventory',
            payload: { productId: 'prod_789', quantity: 50 }
          },
          aiReasoning: 'Historical data shows 40% increase in bread sales during weekends.',
          requestedAt: new Date().toISOString()
        }
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch HITL actions:', error);
      toast.error('Failed to load pending actions');
    }
  }

  async function handleApprove(action: HITLAction) {
    try {
      // TODO: Implement actual API endpoint
      toast.success(`Action approved: ${action.capability} for ${action.vertical}`);
      await fetchPendingActions();
      setSelectedAction(null);
    } catch (error) {
      toast.error('Failed to approve action');
    }
  }

  async function handleReject(action: HITLAction) {
    try {
      // TODO: Implement actual API endpoint
      toast.success(`Action rejected: ${action.capability} for ${action.vertical}`);
      await fetchPendingActions();
      setSelectedAction(null);
    } catch (error) {
      toast.error('Failed to reject action');
    }
  }

  const pendingActions = actions.filter(a => a.status === 'pending');

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          AI Action Review Queue
        </h1>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>
          Review and approve AI-suggested actions requiring human oversight
        </p>
        <div style={{ marginTop: '16px' }}>
          <span style={{ padding: '8px 16px', background: '#f3f4f6', borderRadius: '8px', fontSize: '16px', fontWeight: 600 }}>
            {pendingActions.length} Pending
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', background: '#f9fafb', borderRadius: '12px' }}>
          <p style={{ color: '#6b7280' }}>Loading actions...</p>
        </div>
      ) : pendingActions.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: '#f9fafb', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>All Caught Up!</h3>
          <p style={{ color: '#6b7280' }}>No pending actions require review</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedAction ? '1fr 1fr' : '1fr', gap: '24px' }}>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {pendingActions.map(action => (
              <div
                key={action.id}
                onClick={() => setSelectedAction(action)}
                style={{
                  padding: '20px',
                  marginBottom: '16px',
                  background: '#fff',
                  border: selectedAction?.id === action.id ? '2px solid #0F4C81' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{action.vertical}</h3>
                  <span style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', borderRadius: '6px', fontSize: '12px' }}>
                    {action.priority}
                  </span>
                </div>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>{action.capability}</p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>{action.aiReasoning.substring(0, 100)}...</p>
              </div>
            ))}
          </div>

          {selectedAction && (
            <div style={{ padding: '24px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', position: 'sticky', top: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Action Details</h2>
              
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Vertical & Capability</h4>
                <p>{selectedAction.vertical} / {selectedAction.capability}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>AI Reasoning</h4>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>{selectedAction.aiReasoning}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Proposed Action</h4>
                <pre style={{ fontSize: '12px', background: '#f9fafb', padding: '12px', borderRadius: '8px', overflowX: 'auto' }}>
                  {JSON.stringify(selectedAction.proposedAction, null, 2)}
                </pre>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Context</h4>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  Tenant: {selectedAction.tenantId}<br />
                  Workspace: {selectedAction.workspaceId}<br />
                  Requested: {new Date(selectedAction.requestedAt).toLocaleString()}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  onClick={() => handleApprove(selectedAction)}
                  style={{ flex: 1, background: '#10b981' }}
                >
                  ✓ Approve
                </Button>
                <Button
                  onClick={() => handleReject(selectedAction)}
                  style={{ flex: 1, background: '#ef4444' }}
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
