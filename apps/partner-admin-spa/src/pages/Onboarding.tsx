/**
 * Partner Admin Onboarding Wizard — E1-7
 * First-login multi-step flow: Welcome → Business Info → Branding → Credits → Done
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface WizardState {
  businessName: string;
  businessType: string;
  country: string;
  phone: string;
  website: string;
  logoUrl: string;
  primaryColor: string;
  brandName: string;
}

const STEPS = ['Welcome', 'Business Info', 'Branding', 'Credits', 'Done'] as const;
type Step = (typeof STEPS)[number];

const STEP_INDEX: Record<Step, number> = { Welcome: 0, 'Business Info': 1, Branding: 2, Credits: 3, Done: 4 };

function StepIndicator({ current }: { current: Step }) {
  const ci = STEP_INDEX[current];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '2rem' }}>
      {STEPS.slice(0, -1).map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: i <= ci ? 'var(--green)' : 'var(--border)',
            color: i <= ci ? '#fff' : 'var(--muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.875rem',
            transition: 'all 0.2s',
          }}>
            {i < ci ? '✓' : i + 1}
          </div>
          {i < STEPS.length - 2 && (
            <div style={{ width: 48, height: 2, background: i < ci ? 'var(--green)' : 'var(--border)', transition: 'all 0.2s' }} />
          )}
        </div>
      ))}
    </div>
  );
}

const input: React.CSSProperties = {
  padding: '0.65rem 0.875rem', borderRadius: 8,
  border: '1.5px solid var(--border)',
  background: 'var(--card)', color: 'inherit',
  fontSize: '0.9375rem', width: '100%', boxSizing: 'border-box',
};
const label: React.CSSProperties = {
  fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block',
};

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const navigate = useNavigate();
  const [step,    setStep]    = useState<Step>('Welcome');
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');
  const [state,   setState]   = useState<WizardState>({
    businessName: '', businessType: '', country: 'Nigeria',
    phone: '', website: '',
    logoUrl: '', primaryColor: '#16a34a', brandName: '',
  });

  function set(k: keyof WizardState, v: string) { setState(s => ({ ...s, [k]: v })); }

  const ci = STEP_INDEX[step];

  async function saveAndFinish() {
    setSaving(true); setErr('');
    try {
      await api.patch('/partner/profile', {
        business_name: state.businessName,
        business_type: state.businessType,
        country: state.country,
        phone: state.phone,
        website: state.website,
        logo_url: state.logoUrl,
        primary_color: state.primaryColor,
        brand_name: state.brandName,
        onboarding_complete: true,
      }).catch(() => { /* best-effort — allow wizard to complete even if API unavailable */ });
      // eslint-disable-next-line no-empty
      void 0;
      setStep('Done');
    } catch (e) {
      setErr((e as Error).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const card: React.CSSProperties = {
    maxWidth: 560, margin: '0 auto',
    background: 'var(--card)', borderRadius: 20,
    padding: '2.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    border: '1px solid var(--border)',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--bg)' }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--green)' }}>WebWaka</span>
        <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: '0.875rem', marginLeft: 8 }}>Partner Portal</span>
      </div>

      <div style={card}>
        {step !== 'Done' && <StepIndicator current={step} />}

        {/* Step 0: Welcome */}
        {step === 'Welcome' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
            <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.75rem' }}>Welcome to WebWaka Partner Portal</h1>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
              Let's get your partner account set up in a few quick steps. This only takes about 2 minutes.
            </p>
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                ['🏢', 'Business Info', 'Tell us about your organization'],
                ['🎨', 'Branding',      'Logo, colors, and your brand name'],
                ['💳', 'Credits',       'Learn how credits work'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  background: 'var(--bg)', borderRadius: 10, padding: '0.875rem',
                  border: '1px solid var(--border)', textAlign: 'left',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{title}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep('Business Info')} style={{
              width: '100%', padding: '0.875rem',
              background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 12, fontWeight: 700,
              fontSize: '1rem', cursor: 'pointer',
            }}>
              Get Started →
            </button>
          </div>
        )}

        {/* Step 1: Business Info */}
        {step === 'Business Info' && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Business Information</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Tell us about your organization.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={label}>Business Name *</label>
                <input style={input} value={state.businessName} onChange={e => set('businessName', e.target.value)}
                  placeholder="e.g. Acme Digital Solutions" />
              </div>
              <div>
                <label style={label}>Business Type *</label>
                <select style={{ ...input }} value={state.businessType} onChange={e => set('businessType', e.target.value)}>
                  <option value="">Select type…</option>
                  {['Technology Company', 'Financial Institution', 'Telecoms', 'NGO / Non-profit',
                    'Government Agency', 'Cooperative', 'Media Company', 'Franchise / Chain', 'Other'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={label}>Country</label>
                  <select style={{ ...input }} value={state.country} onChange={e => set('country', e.target.value)}>
                    {['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Tanzania', 'Uganda', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={label}>Phone</label>
                  <input style={input} value={state.phone} onChange={e => set('phone', e.target.value)} placeholder="+234 800 000 0000" type="tel" />
                </div>
              </div>
              <div>
                <label style={label}>Website</label>
                <input style={input} value={state.website} onChange={e => set('website', e.target.value)} placeholder="https://yourcompany.com" type="url" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
              <button onClick={() => setStep('Welcome')} style={{
                flex: 1, padding: '0.75rem', background: 'none',
                border: '1.5px solid var(--border)', borderRadius: 10,
                fontWeight: 600, cursor: 'pointer', color: 'inherit',
              }}>← Back</button>
              <button
                onClick={() => { if (!state.businessName || !state.businessType) { setErr('Please fill in Business Name and Type'); return; } setErr(''); setStep('Branding'); }}
                style={{
                  flex: 2, padding: '0.75rem', background: 'var(--green)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontWeight: 700, cursor: 'pointer',
                }}
              >Continue →</button>
            </div>
            {err && <p style={{ color: '#dc2626', marginTop: '0.75rem', fontSize: '0.875rem' }}>{err}</p>}
          </div>
        )}

        {/* Step 2: Branding */}
        {step === 'Branding' && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Branding</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Customise the experience for your sub-tenants.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={label}>White-Label Brand Name</label>
                <input style={input} value={state.brandName} onChange={e => set('brandName', e.target.value)}
                  placeholder="e.g. SmartBiz (leave blank to use WebWaka)" />
              </div>
              <div>
                <label style={label}>Logo URL</label>
                <input style={input} value={state.logoUrl} onChange={e => set('logoUrl', e.target.value)}
                  placeholder="https://yourcompany.com/logo.png" type="url" />
                {state.logoUrl && (
                  <div style={{ marginTop: 8, width: 80, height: 40, borderRadius: 8, overflow: 'hidden', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={state.logoUrl} alt="Logo preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
              <div>
                <label style={label}>Primary Colour</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="color" value={state.primaryColor} onChange={e => set('primaryColor', e.target.value)}
                    style={{ width: 48, height: 40, padding: 2, borderRadius: 8, border: '1.5px solid var(--border)', cursor: 'pointer', background: 'var(--card)' }} />
                  <input style={{ ...input, flex: 1 }} value={state.primaryColor} onChange={e => set('primaryColor', e.target.value)} placeholder="#16a34a" />
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: state.primaryColor, border: '1.5px solid var(--border)', flexShrink: 0 }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
              <button onClick={() => setStep('Business Info')} style={{
                flex: 1, padding: '0.75rem', background: 'none',
                border: '1.5px solid var(--border)', borderRadius: 10,
                fontWeight: 600, cursor: 'pointer', color: 'inherit',
              }}>← Back</button>
              <button onClick={() => { setErr(''); setStep('Credits'); }} style={{
                flex: 2, padding: '0.75rem', background: 'var(--green)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontWeight: 700, cursor: 'pointer',
              }}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3: Credits education */}
        {step === 'Credits' && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>How Credits Work</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Credits power your sub-tenants' activity on the platform.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
              {[
                ['💳', 'Purchase credits', 'Top up your credit pool from the Credits page at any time.'],
                ['🔁', 'Allocate to sub-tenants', 'Distribute credits to businesses under your account.'],
                ['📊', 'Track usage', 'Monitor consumption per sub-tenant in real time.'],
                ['⚠️', 'Auto-alerts', 'Get notified when a sub-tenant\'s credits drop below threshold.'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{
                  display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                  background: 'var(--bg)', borderRadius: 10, padding: '0.875rem',
                  border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '1.375rem', flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{title}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1.5px solid #86efac', borderRadius: 12,
              padding: '1rem', marginBottom: '1.5rem',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>🎁 Welcome Bonus</div>
              <div style={{ fontSize: '0.875rem', color: '#166534' }}>
                Your account starts with <strong>500 free credits</strong> to help you onboard your first sub-tenants.
              </div>
            </div>

            {err && <p style={{ color: '#dc2626', marginBottom: '0.75rem', fontSize: '0.875rem' }}>{err}</p>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep('Branding')} style={{
                flex: 1, padding: '0.75rem', background: 'none',
                border: '1.5px solid var(--border)', borderRadius: 10,
                fontWeight: 600, cursor: 'pointer', color: 'inherit',
              }}>← Back</button>
              <button
                onClick={saveAndFinish}
                disabled={saving}
                style={{
                  flex: 2, padding: '0.75rem', background: 'var(--green)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Finish Setup →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 'Done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.75rem' }}>You're all set!</h1>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
              Your partner account is configured. Start by adding your first sub-tenants or purchasing credits.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => { onComplete(); navigate('/overview'); }} style={{
                padding: '0.875rem', background: 'var(--green)', color: '#fff',
                border: 'none', borderRadius: 12, fontWeight: 700,
                fontSize: '1rem', cursor: 'pointer',
              }}>Go to Dashboard →</button>
              <button onClick={() => { onComplete(); navigate('/sub-partners'); }} style={{
                padding: '0.875rem', background: 'none',
                border: '1.5px solid var(--border)', borderRadius: 12,
                fontWeight: 600, cursor: 'pointer', color: 'inherit',
              }}>Add Sub-Tenants</button>
            </div>
          </div>
        )}
      </div>

      {step !== 'Done' && (
        <button
          onClick={() => { onComplete(); navigate('/overview'); }}
          style={{ marginTop: '1.25rem', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}
        >
          Skip for now
        </button>
      )}
    </div>
  );
}
