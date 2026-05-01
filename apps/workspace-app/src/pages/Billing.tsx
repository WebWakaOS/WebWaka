/**
 * Billing Page — H9 fix
 * Plan info, bank transfer (primary), HandyLife wallet credit.
 */
import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { formatNaira } from '@/lib/currency';
import { Button } from '@/components/ui/Button';

interface BillingStatus {
  plan: string;
  status: string;
  current_period_end?: number | null;
  cancel_at_period_end?: number;
  grace_period_end?: number | null;
  days_until_expiry?: number | null;
}

interface WalletBalance {
  balance_kobo: number;
  currency: string;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Discovery layer only',
    features: ['WakaPage (public profile)', 'AI Advisory (limited)', 'USSD access'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 5_000_00,
    description: 'Solo traders and micro-businesses',
    features: ['Everything in Free', 'POS terminal', 'Up to 50 offerings', '10 team members'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 15_000_00,
    description: 'Growing businesses',
    features: ['Everything in Starter', 'Unlimited offerings', 'Advanced analytics', 'Priority support', 'Vertical AI advisory'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: -1,
    description: 'Large organisations',
    features: ['Everything in Growth', 'Custom integrations', 'Dedicated support', 'BYOK AI', 'White-label options'],
  },
];

// Bank details are loaded from the API (/billing/bank-details).
// The API reads PLATFORM_BANK_ACCOUNT_JSON from Cloudflare Worker vars.
// This constant is intentionally removed — never hardcode payment details.

interface BankDetails {
  configured: boolean;
  message?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  sort_code?: string;
}

export default function Billing() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundingLoading, setFundingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'bank' | 'wallet'>('plans');

  useEffect(() => {
    Promise.allSettled([
      api.get<BillingStatus>('/billing/status'),
      api.get<{ balance_kobo: number; currency: string }>('/wallet/balance'),
    ]).then(([billingRes, walletRes]) => {
      if (billingRes.status === 'fulfilled') setBilling(billingRes.value);
      if (walletRes.status === 'fulfilled') setWallet(walletRes.value);
      setLoading(false);
    });
  }, []);

  // Lazy-load bank details only when the bank tab is first opened
  useEffect(() => {
    if (activeTab !== 'bank' || bankDetails !== null || bankLoading) return;
    setBankLoading(true);
    api.get<BankDetails>('/billing/bank-details')
      .then(res => setBankDetails(res))
      .catch(() => setBankDetails({ configured: false, message: 'Unable to load bank details. Please contact billing@webwaka.com.' }))
      .finally(() => setBankLoading(false));
  }, [activeTab, bankDetails, bankLoading]);

  const handleChangePlan = async (planId: string) => {
    if (planId === billing?.plan) return;
    if (planId === 'enterprise') {
      toast.info('Contact sales@webwaka.com for Enterprise pricing.');
      return;
    }
    setChangingPlan(planId);
    try {
      await api.post('/billing/change-plan', { plan: planId });
      toast.success(`Plan changed to ${planId}`);
      const updated = await api.get<BillingStatus>('/billing/status');
      setBilling(updated);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to change plan';
      toast.error(msg);
    } finally {
      setChangingPlan(null);
    }
  };

  const handleFundWallet = async () => {
    const amount = parseFloat(fundingAmount);
    if (isNaN(amount) || amount < 100) {
      toast.error('Minimum funding amount is ₦100');
      return;
    }
    setFundingLoading(true);
    try {
      await api.post('/wallet/fund/bank-transfer', {
        amount_kobo: Math.round(amount * 100),
        channel: 'bank_transfer',
      });
      toast.success('Funding request created. Transfer and submit proof to complete.');
      setFundingAmount('');
      // Refresh wallet
      const updated = await api.get<{ balance_kobo: number; currency: string }>('/wallet/balance');
      setWallet(updated);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to initiate funding';
      toast.error(msg);
    } finally {
      setFundingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6b7280' }}>
        Loading billing information…
      </div>
    );
  }

  const currentPlan = billing?.plan ?? 'free';

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }} id="main-content">
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Billing & Plans</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Manage your subscription and payment methods</p>
      </header>

      {/* Current plan badge */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
        padding: '16px 20px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>Current plan</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F4C81', textTransform: 'capitalize' }}>
            {currentPlan}
          </div>
          {billing?.current_period_end && (
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              Renews {new Date(billing.current_period_end * 1000).toLocaleDateString()}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
            background: billing?.status === 'active' ? '#dcfce7' : '#fee2e2',
            color: billing?.status === 'active' ? '#166534' : '#991b1b',
          }}>
            {billing?.status ?? 'unknown'}
          </span>
          {wallet && (
            <div style={{ fontSize: 13, color: '#374151' }}>
              HandyLife Wallet:{' '}
              <strong style={{ color: '#0F4C81' }}>
                {formatNaira(wallet.balance_kobo)}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 24, gap: 0 }}>
        {[{ id: 'plans', label: 'Plans' }, { id: 'bank', label: 'Bank Transfer' }, { id: 'wallet', label: 'HandyLife Wallet' }].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            style={{
              padding: '12px 20px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 14, minHeight: 44,
              color: activeTab === t.id ? '#0F4C81' : '#6b7280',
              fontWeight: activeTab === t.id ? 700 : 400,
              borderBottom: activeTab === t.id ? '2.5px solid #0F4C81' : '2.5px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Plans tab */}
      {activeTab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              style={{
                background: '#fff', border: `2px solid ${currentPlan === plan.id ? '#0F4C81' : '#e5e7eb'}`,
                borderRadius: 12, padding: 20,
                boxShadow: currentPlan === plan.id ? '0 0 0 2px rgba(15,76,129,0.12)' : 'none',
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{plan.description}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F4C81', marginBottom: 16 }}>
                {plan.price < 0 ? 'Custom' : plan.price === 0 ? 'Free' : `${formatNaira(plan.price)}/mo`}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ color: '#059669', marginTop: 1 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              {currentPlan === plan.id ? (
                <div style={{
                  textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#166534',
                  padding: '10px', background: '#dcfce7', borderRadius: 8,
                }}>Current plan</div>
              ) : (
                <Button
                  fullWidth
                  loading={changingPlan === plan.id}
                  onClick={() => void handleChangePlan(plan.id)}
                  variant={plan.id === 'growth' ? 'primary' : 'secondary'}
                >
                  {plan.price < 0 ? 'Contact sales' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bank transfer tab */}
      {activeTab === 'bank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Pay by Bank Transfer</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
              Transfer the amount for your chosen plan to the account below.
              Include your User ID as the payment reference so we can match your payment.
            </p>

            {bankLoading && (
              <div style={{ padding: 20, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                Loading bank details…
              </div>
            )}

            {!bankLoading && bankDetails && !bankDetails.configured && (
              <div style={{
                padding: '16px 20px', background: '#fef9c3', border: '1px solid #fef08a',
                borderRadius: 10, fontSize: 14, color: '#92400e', lineHeight: 1.6,
              }}>
                <strong>Bank transfer details not yet configured.</strong><br />
                {bankDetails.message ?? 'Please contact'}{' '}
                <a href="mailto:billing@webwaka.com" style={{ color: '#0F4C81', fontWeight: 600 }}>billing@webwaka.com</a>
                {' '}to get payment details.
              </div>
            )}

            {!bankLoading && bankDetails?.configured && (
              <div style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Bank', value: bankDetails.bank_name ?? '—' },
                  { label: 'Account Name', value: bankDetails.account_name ?? '—' },
                  { label: 'Account Number', value: bankDetails.account_number ?? '—' },
                  ...(bankDetails.sort_code ? [{ label: 'Sort Code', value: bankDetails.sort_code }] : []),
                  { label: 'Reference', value: 'Your User ID (shown in Settings → Profile)' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                    <span style={{ fontWeight: 600, color: '#374151', minWidth: 140 }}>{row.label}</span>
                    <span style={{ color: '#0F4C81', fontWeight: 500, fontFamily: 'monospace', fontSize: 15 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              marginTop: 20, padding: '12px 16px', background: '#fffbeb',
              border: '1px solid #fde68a', borderRadius: 8, fontSize: 13, color: '#92400e',
            }}>
              <strong>⚠️ After transferring:</strong> Email <a href="mailto:billing@webwaka.com" style={{ color: '#0F4C81' }}>billing@webwaka.com</a> with
              your transaction reference. Plan activation takes 1–2 business days.
            </div>
          </div>
        </div>
      )}

      {/* HandyLife Wallet tab */}
      {activeTab === 'wallet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>HandyLife Wallet</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
              Fund your HandyLife wallet and use it to pay for WebWaka subscriptions and AI credits (WakaCU).
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #0F4C81 0%, #1d6fad 100%)',
              borderRadius: 12, padding: 24, marginBottom: 20, color: '#fff',
            }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Available balance</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>
                {wallet ? formatNaira(wallet.balance_kobo) : '—'}
              </div>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Top up via Bank Transfer</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                  Amount (Naira)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={fundingAmount}
                  onChange={e => setFundingAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  style={{
                    width: '100%', border: '1.5px solid #d1d5db', borderRadius: 8,
                    padding: '11px 14px', fontSize: 15, minHeight: 44,
                  }}
                />
              </div>
              <Button
                onClick={() => void handleFundWallet()}
                loading={fundingLoading}
                size="md"
              >
                Create funding request
              </Button>
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
              After initiating, you will receive bank details and a unique reference.
              Funds appear within 1 business day after transfer confirmation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
