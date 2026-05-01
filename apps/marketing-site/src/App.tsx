/**
 * WebWaka OS — Marketing Website
 * Public-facing landing page for webwaka.com
 *
 * Fixes applied:
 * - Footer links replaced with real URLs (Privacy, Terms, Contact, Features, etc.)
 * - Privacy Policy page added
 * - Terms of Service page added
 * - Contact page added
 * - NDPR cookie consent banner added
 * - OG image + JSON-LD in index.html
 * - Sitemap and robots.txt added to public/
 */

import { useState, useEffect } from 'react';

// ─── Shared styles ────────────────────────────────────────────────────────────
const PRIMARY = '#0F4C81';
const GREEN = '#059669';
const DARK = '#0d1117';

// ─── Cookie consent helpers ───────────────────────────────────────────────────
const CONSENT_KEY = 'ww_cookie_consent';
type ConsentStatus = 'accepted' | 'declined' | null;

function getStoredConsent(): ConsentStatus {
  try {
    return (localStorage.getItem(CONSENT_KEY) as ConsentStatus) ?? null;
  } catch {
    return null;
  }
}

function storeConsent(status: 'accepted' | 'declined') {
  try {
    localStorage.setItem(CONSENT_KEY, status);
  } catch {/* ignore */}
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '🛒',
    title: 'Point of Sale',
    desc: 'Fast, offline-capable POS terminal with Nigerian VAT (7.5%) built in. Accept cash, card, and transfers.',
  },
  {
    icon: '🤖',
    title: 'AI Advisory',
    desc: 'Real AI-powered business insights tailored to your vertical — palm oil mill to restaurant to pharmacy.',
  },
  {
    icon: '🌐',
    title: 'WakaPage',
    desc: 'Your free professional business page. Share QR codes, capture leads, publish your services — no coding needed.',
  },
  {
    icon: '📱',
    title: 'USSD Access',
    desc: 'Run your business from any phone, even without internet. Dial *384# and manage sales, inventory and more.',
  },
  {
    icon: '📊',
    title: 'Analytics',
    desc: 'Real-time revenue, inventory, and customer data — all in one dashboard built for African business realities.',
  },
  {
    icon: '🔐',
    title: 'NDPR Compliant',
    desc: 'Built for Nigeria first. Full compliance with NDPR, CBN, FIRS VAT, and CAC business registration workflows.',
  },
];

const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₦0',
    period: 'forever',
    desc: 'Perfect to get started',
    features: ['WakaPage public profile', 'AI advisory (5 queries/month)', 'USSD access', 'Basic dashboard'],
    cta: 'Get started free',
    highlight: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '₦5,000',
    period: '/month',
    desc: 'Solo traders and micro-businesses',
    features: ['Everything in Free', 'POS terminal', 'Up to 50 offerings', '10 team members', 'Sales analytics'],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '₦15,000',
    period: '/month',
    desc: 'Growing businesses',
    features: [
      'Everything in Starter',
      'Unlimited offerings',
      'Advanced AI advisory',
      'Priority support',
      'Vertical intelligence',
      'B2B marketplace access',
    ],
    cta: 'Get Growth',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Large organisations',
    features: ['Everything in Growth', 'Custom integrations', 'Dedicated support', 'BYOK AI', 'White-label options'],
    cta: 'Contact sales',
    highlight: false,
  },
];

const VERTICALS = [
  '🥩 Abattoir', '🌴 Palm Oil', '🍽️ Restaurant', '💊 Pharmacy', '🏨 Hotel',
  '🥖 Bakery', '💅 Beauty Salon', '👕 Laundry', '🌾 Cassava Miller', '🐟 Fish Market',
  '🏢 Government', '⚖️ Law Firm', '🔧 Auto Workshop', '🌱 Agro-Input', '🏫 School',
  '⛪ Church', '🧵 Tailoring', '🛒 Supermarket', '🔩 Spare Parts', '🌻 Vegetable Garden',
];

const STATS = [
  { value: '159+', label: 'Business verticals' },
  { value: '₦0', label: 'To get started' },
  { value: '36', label: 'Nigerian states covered' },
  { value: '5ms', label: 'API response time' },
];

// ─── Routing helper ───────────────────────────────────────────────────────────
function usePageRoute() {
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#/privacy') return 'privacy';
      if (hash === '#/terms') return 'terms';
      if (hash === '#/contact') return 'contact';
    }
    return 'home';
  });

  const navigate = (target: string) => {
    window.location.hash = target === 'home' ? '' : `#/${target}`;
    setPage(target);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash;
      if (hash === '#/privacy') setPage('privacy');
      else if (hash === '#/terms') setPage('terms');
      else if (hash === '#/contact') setPage('contact');
      else setPage('home');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return { page, navigate };
}

// ─── NDPR Cookie Consent Banner ───────────────────────────────────────────────
function CookieConsentBanner({ onConsent }: { onConsent: (status: 'accepted' | 'declined') => void }) {
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: '#1e293b', color: '#e2e8f0',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ flex: 1, minWidth: 280, fontSize: 13, lineHeight: 1.6 }}>
        <strong style={{ color: '#fff' }}>🍪 Privacy &amp; Cookies</strong>
        <br />
        We use essential cookies to operate this website. In compliance with Nigeria's{' '}
        <strong style={{ color: '#93c5fd' }}>NDPR</strong>, we ask for your consent before
        collecting any analytics data.{' '}
        <a href="#/privacy" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Learn more</a>
      </div>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={() => onConsent('declined')}
          style={{
            padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
            color: '#94a3b8', cursor: 'pointer', minHeight: 40,
          }}
        >
          Essential only
        </button>
        <button
          onClick={() => onConsent('accepted')}
          style={{
            padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 700,
            border: 'none', background: PRIMARY, color: '#fff', cursor: 'pointer', minHeight: 40,
          }}
        >
          Accept all
        </button>
      </div>
    </div>
  );
}

// ─── Privacy Policy Page ──────────────────────────────────────────────────────
function PrivacyPolicyPage({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: PRIMARY, fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 32, padding: 0 }}>
        ← Back to WebWaka
      </button>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#6b7280', marginBottom: 40 }}>Last updated: May 2026 | Effective: January 2026</p>

      {[
        {
          title: '1. Who We Are',
          text: 'WebWaka Technologies Limited ("WebWaka", "we", "us") operates the WebWaka OS platform at webwaka.com. We are registered in Nigeria under the Corporate Affairs Commission (CAC). Contact: privacy@webwaka.com',
        },
        {
          title: '2. Data We Collect',
          text: 'We collect: (a) Account data — name, email, phone, business name when you register; (b) Business data — products, sales, and operational data you enter; (c) Usage data — feature usage, page views (with your consent); (d) Payment data — bank transfer references and wallet balances (no card details stored). We do not sell your data to third parties.',
        },
        {
          title: '3. How We Use Your Data',
          text: 'Your data is used to: operate your workspace and provide the WebWaka OS services; send service emails (account verification, plan notifications); improve platform features (aggregate, anonymised analysis); comply with Nigerian legal obligations (CBN, FIRS, NDPR). We do not use your data for advertising.',
        },
        {
          title: '4. Nigeria Data Protection Regulation (NDPR)',
          text: 'We process your data in accordance with the Nigeria Data Protection Act 2023 (NDPA) and NDPR. You have the right to: access your data (GET /auth/me); correct inaccurate data (PATCH /auth/me); delete your account and data (DELETE /auth/me — full NDPR erasure); object to processing; data portability. To exercise these rights, email: privacy@webwaka.com',
        },
        {
          title: '5. Data Storage and Security',
          text: 'All data is stored on Cloudflare D1 edge databases (WNAM region — Western North America — with GDPR-adequate safeguards). Data is encrypted in transit (TLS 1.3) and at rest. We apply industry-standard security measures including JWT authentication, tenant data isolation, and regular security audits.',
        },
        {
          title: '6. Cookies and Analytics',
          text: 'We use essential cookies for authentication (session management). We only collect analytics data with your explicit consent (provided via the cookie consent banner). You can withdraw consent at any time by clearing your browser cookies.',
        },
        {
          title: '7. Third-Party Services',
          text: 'We use: Cloudflare (infrastructure, security); Paystack (payment processing — their privacy policy applies to payment data); Africa\'s Talking (USSD services). We do not share your personal data with any other third parties without your consent.',
        },
        {
          title: '8. Data Retention',
          text: 'We retain your data for the duration of your account plus 3 years for legal compliance (tax, financial records). Upon account deletion, personal data is removed within 30 days except where retention is required by law.',
        },
        {
          title: '9. Contact Us',
          text: 'Data Protection Officer: privacy@webwaka.com | General enquiries: hello@webwaka.com | Address: WebWaka Technologies Limited, Lagos, Nigeria',
        },
      ].map(s => (
        <div key={s.title} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{s.title}</h2>
          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>{s.text}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Terms of Service Page ────────────────────────────────────────────────────
function TermsPage({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: PRIMARY, fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 32, padding: 0 }}>
        ← Back to WebWaka
      </button>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: '#6b7280', marginBottom: 40 }}>Last updated: May 2026 | Effective: January 2026</p>

      {[
        {
          title: '1. Acceptance',
          text: 'By creating a WebWaka OS account or using any WebWaka service, you agree to these Terms. If you do not agree, do not use the platform. These Terms constitute a legally binding agreement between you and WebWaka Technologies Limited.',
        },
        {
          title: '2. Service Description',
          text: 'WebWaka OS is a multi-tenant business management platform providing POS, AI advisory, business profile pages (WakaPage), analytics, and related services. The platform is provided "as-is" with planned availability of 99.5% monthly uptime (excluding scheduled maintenance).',
        },
        {
          title: '3. Accounts and Registration',
          text: 'You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must be 18+ or have legal capacity to enter business contracts. One person or entity may register multiple workspaces.',
        },
        {
          title: '4. Acceptable Use',
          text: 'You may not: use the platform for illegal activities; attempt to hack, reverse-engineer, or disrupt the platform; use the USSD gateway for spam or fraudulent activities; impersonate other businesses or users; violate Nigerian law including NDPR, EFCC Act, or CBN regulations.',
        },
        {
          title: '5. Payment and Billing',
          text: 'Paid plans are billed monthly. Payment is accepted via bank transfer or HandyLife Wallet. Refunds are available within 7 days of payment for unused billing periods. We reserve the right to suspend accounts with overdue payments after a 7-day grace period.',
        },
        {
          title: '6. Data Ownership',
          text: 'You own your business data. We do not claim ownership of any data you enter into the platform. We process it solely to provide the services. See our Privacy Policy for data handling details.',
        },
        {
          title: '7. Limitation of Liability',
          text: 'To the maximum extent permitted by Nigerian law, WebWaka\'s liability is limited to fees paid in the preceding 3 months. We are not liable for indirect damages, loss of business, or data loss resulting from platform outages.',
        },
        {
          title: '8. Governing Law',
          text: 'These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall be resolved by arbitration under the Arbitration and Mediation Act 2023 in Lagos, Nigeria.',
        },
        {
          title: '9. Changes to Terms',
          text: 'We may update these Terms with 30 days notice via email. Continued use of the platform after changes constitutes acceptance.',
        },
        {
          title: '10. Contact',
          text: 'Legal enquiries: legal@webwaka.com | General: hello@webwaka.com',
        },
      ].map(s => (
        <div key={s.title} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{s.title}</h2>
          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>{s.text}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Contact Page ─────────────────────────────────────────────────────────────
const API_BASE = 'https://api.webwaka.com';

function ContactPage({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/public/contact-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again or email hello@webwaka.com.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 24px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: PRIMARY, fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 32, padding: 0 }}>
        ← Back to WebWaka
      </button>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Contact Us</h1>
      <p style={{ color: '#6b7280', marginBottom: 40 }}>We'd love to hear from you. Reach us anytime.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
        {[
          { icon: '📧', label: 'General', email: 'hello@webwaka.com' },
          { icon: '💼', label: 'Sales', email: 'sales@webwaka.com' },
          { icon: '💳', label: 'Billing', email: 'billing@webwaka.com' },
          { icon: '🔒', label: 'Privacy / NDPR', email: 'privacy@webwaka.com' },
        ].map(c => (
          <div key={c.label} style={{ background: '#f8fafc', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{c.label}</div>
            <a href={`mailto:${c.email}`} style={{ fontSize: 14, color: PRIMARY, fontWeight: 600 }}>{c.email}</a>
          </div>
        ))}
      </div>

      {sent ? (
        <div style={{ padding: 24, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          <p style={{ color: '#166534', fontWeight: 600 }}>Message sent! We'll respond within 1 business day.</p>
        </div>
      ) : (
        <form onSubmit={e => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Send us a message</h2>
          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 14, color: '#991b1b' }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Name *</label>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Email *</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Message *</label>
            <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="How can we help?"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, resize: 'vertical' }} />
          </div>
          <button type="submit" disabled={sending}
            style={{
              background: PRIMARY, color: '#fff', padding: '14px 28px', borderRadius: 8,
              fontSize: 15, fontWeight: 700, border: 'none', cursor: sending ? 'wait' : 'pointer',
              opacity: sending ? 0.7 : 1, minHeight: 50,
            }}>
            {sending ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

function Nav({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #e5e7eb',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => onNavigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          aria-label="WebWaka OS home"
        >
          <span style={{ fontSize: 20, fontWeight: 800, color: PRIMARY }}>WebWaka</span>
          <span style={{ background: PRIMARY, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 4, letterSpacing: '0.05em' }}>OS</span>
        </button>

        {/* Desktop nav */}
        <nav style={{ display: 'none', gap: 32, alignItems: 'center', ...(typeof window !== 'undefined' && window.innerWidth >= 768 ? { display: 'flex' } : {}) }}
          className="desktop-nav" aria-label="Main navigation">
          {['Features', 'Pricing', 'Verticals', 'About'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{ fontSize: 14, fontWeight: 500, color: '#374151', transition: 'color 0.15s' }}
              onMouseOver={e => (e.currentTarget.style.color = PRIMARY)}
              onMouseOut={e => (e.currentTarget.style.color = '#374151')}
            >
              {item}
            </a>
          ))}
          <a
            href="https://workspace.webwaka.com"
            style={{
              background: PRIMARY, color: '#fff', padding: '9px 20px', borderRadius: 8,
              fontSize: 14, fontWeight: 600, transition: 'opacity 0.15s', textDecoration: 'none',
            }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >
            Sign in
          </a>
        </nav>

        {/* Mobile: Sign-in + Hamburger */}
        <div className="mobile-nav-controls" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href="https://workspace.webwaka.com"
            className="mobile-signin"
            style={{
              background: PRIMARY, color: '#fff', padding: '8px 14px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}
          >
            Sign in
          </a>
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="hamburger-btn"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 8,
              display: 'flex', flexDirection: 'column', gap: 5, minWidth: 44, minHeight: 44,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ width: 22, height: 2, background: '#374151', display: 'block', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
            <span style={{ width: 22, height: 2, background: '#374151', display: 'block', transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ width: 22, height: 2, background: '#374151', display: 'block', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="mobile-menu"
          style={{
            background: '#fff', borderTop: '1px solid #e5e7eb',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {['Features', 'Pricing', 'Verticals', 'About'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '14px 24px', fontSize: 15, fontWeight: 500,
                color: '#374151', borderBottom: '1px solid #f3f4f6',
                textDecoration: 'none', display: 'block',
              }}
            >
              {item}
            </a>
          ))}
          <a
            href="https://workspace.webwaka.com/register"
            style={{
              display: 'block', margin: 16,
              background: PRIMARY, color: '#fff', padding: '13px 20px', borderRadius: 8,
              fontSize: 15, fontWeight: 600, textAlign: 'center', textDecoration: 'none',
            }}
          >
            Start free →
          </a>
        </nav>
      )}

      {/* Responsive CSS injected once */}
      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav-controls { display: none !important; }
        .mobile-menu { display: flex !important; }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-controls { display: flex !important; }
        }
        @media (min-width: 768px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </header>
  );
}

function Hero() {
  return (
    <section style={{
      background: `linear-gradient(135deg, ${PRIMARY} 0%, #1d6fad 60%, ${GREEN} 100%)`,
      padding: '96px 24px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.15)', borderRadius: 999,
          padding: '6px 16px', marginBottom: 24, fontSize: 13, color: '#fff',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
          Now live in Nigeria — 159+ business verticals
        </div>

        <h1 style={{ fontSize: 'clamp(32px,6vw,60px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
          Africa's First AI-Native<br />Digital Transformation OS
        </h1>
        <p style={{ fontSize: 'clamp(16px,2.5vw,20px)', color: 'rgba(255,255,255,0.85)', maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.7 }}>
          WebWaka OS gives every Nigerian business — from palm oil mills to hospitals to politicians —
          a complete digital operations stack with AI advisory, POS, USSD, and a free business page.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="https://workspace.webwaka.com/register"
            style={{
              background: '#fff', color: PRIMARY, padding: '14px 32px', borderRadius: 10,
              fontSize: 16, fontWeight: 700, minHeight: 52, display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            }}
          >
            Start free — no card needed
          </a>
          <a
            href="#features"
            style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '14px 32px',
              borderRadius: 10, fontSize: 16, fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)',
              minHeight: 52, display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            }}
          >
            See how it works →
          </a>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section style={{ background: '#f8f9fa', padding: '40px 24px', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 24 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: PRIMARY, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" style={{ padding: '96px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#111827', marginBottom: 12 }}>
            Everything your business needs
          </h2>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>
            Built for African business reality — offline-first, multilingual, NDPR compliant.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: '#f8f9fa', borderRadius: 14, padding: 28,
              border: '1px solid #e5e7eb', transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" style={{ padding: '96px 24px', background: '#f8f9fa' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#111827', marginBottom: 12 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: 16, color: '#6b7280' }}>Pay by bank transfer or HandyLife wallet. No hidden fees.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20, alignItems: 'start' }}>
          {PRICING_PLANS.map(plan => (
            <div
              key={plan.id}
              style={{
                background: plan.highlight ? PRIMARY : '#fff',
                border: plan.highlight ? 'none' : '1px solid #e5e7eb',
                borderRadius: 16, padding: 28,
                boxShadow: plan.highlight ? '0 8px 32px rgba(15,76,129,0.25)' : 'none',
                transform: plan.highlight ? 'scale(1.03)' : 'none',
              }}
            >
              {plan.highlight && (
                <div style={{
                  background: '#fff', color: PRIMARY, fontSize: 11, fontWeight: 700,
                  padding: '3px 12px', borderRadius: 999, marginBottom: 16, display: 'inline-block',
                }}>MOST POPULAR</div>
              )}
              <div style={{ fontSize: 18, fontWeight: 700, color: plan.highlight ? '#fff' : '#111827', marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#6b7280', marginBottom: 16 }}>{plan.desc}</div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: plan.highlight ? '#fff' : PRIMARY }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 14, color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#374151', display: 'flex', gap: 8 }}>
                    <span style={{ color: plan.highlight ? '#4ade80' : GREEN }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href={plan.id === 'enterprise' ? '#/contact' : 'https://workspace.webwaka.com/register'}
                style={{
                  display: 'block', textAlign: 'center',
                  background: plan.highlight ? '#fff' : PRIMARY,
                  color: plan.highlight ? PRIMARY : '#fff',
                  padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Verticals() {
  return (
    <section id="verticals" style={{ padding: '96px 24px', background: '#fff', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#111827', marginBottom: 12 }}>
            Built for every Nigerian business
          </h2>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 520, margin: '0 auto' }}>
            159+ industry-specific templates — from abattoir to government agency.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {VERTICALS.map(v => (
            <span key={v} style={{
              background: '#f0f9ff', border: '1px solid #bfdbfe', color: PRIMARY,
              padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 500,
            }}>
              {v}
            </span>
          ))}
          <span style={{
            background: PRIMARY, color: '#fff',
            padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 600,
          }}>
            +139 more
          </span>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" style={{ padding: '96px 24px', background: DARK, color: '#fff' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, marginBottom: 16 }}>
          Built for Africa. Starting with Nigeria.
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 680, margin: '0 auto 32px', lineHeight: 1.8 }}>
          WebWaka OS is a governance-driven, multi-tenant, white-label, AI-native platform.
          We believe every business in Africa — from a market trader in Onitsha to a government
          agency in Abuja — deserves world-class digital infrastructure at zero entry cost.
        </p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: '🇳🇬', label: 'Nigeria First' },
            { icon: '🌍', label: 'Pan-African' },
            { icon: '🔒', label: 'NDPR Compliant' },
            { icon: '📱', label: 'Offline-First' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{
      padding: '96px 24px',
      background: `linear-gradient(135deg, ${PRIMARY} 0%, #1d6fad 100%)`,
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
          Ready to transform your business?
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 36 }}>
          Join thousands of Nigerian businesses on WebWaka OS. Free plan available — no credit card required.
        </p>
        <a
          href="https://workspace.webwaka.com/register"
          style={{
            background: '#fff', color: PRIMARY, padding: '16px 40px', borderRadius: 10,
            fontSize: 16, fontWeight: 700, display: 'inline-flex', alignItems: 'center',
            minHeight: 54, textDecoration: 'none',
          }}
        >
          Create your free workspace →
        </a>
      </div>
    </section>
  );
}

function Footer({ onNavigate }: { onNavigate: (page: string) => void }) {
  // Map link labels to their proper destinations
  const FOOTER_LINKS: Record<string, Record<string, { href: string; external?: boolean }>> = {
    Product: {
      Features: { href: '#features' },
      Pricing: { href: '#pricing' },
      Verticals: { href: '#verticals' },
      USSD: { href: '#features' },
    },
    Company: {
      About: { href: '#about' },
      Blog: { href: 'https://blog.webwaka.com', external: true },
      Careers: { href: 'mailto:careers@webwaka.com', external: true },
      Contact: { href: '#/contact' },
    },
    Legal: {
      'Privacy Policy': { href: '#/privacy' },
      'Terms of Service': { href: '#/terms' },
      'NDPR Compliance': { href: '#/privacy' },
    },
  };

  return (
    <footer style={{ background: DARK, padding: '48px 24px', color: 'rgba(255,255,255,0.5)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>WebWaka</span>
            <span style={{ background: PRIMARY, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 4 }}>OS</span>
          </div>
          <p style={{ fontSize: 13, maxWidth: 280, lineHeight: 1.7 }}>
            Africa's AI-native Digital Transformation Operating System.
          </p>
          <p style={{ fontSize: 11, marginTop: 12, color: 'rgba(255,255,255,0.35)' }}>
            NDPR compliant • Nigeria first
          </p>
        </div>
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{heading}</div>
              {Object.entries(links).map(([label, { href, external }]) => (
                <div key={label} style={{ fontSize: 13, marginBottom: 8 }}>
                  {href.startsWith('#/') ? (
                    <button
                      onClick={() => onNavigate(href.slice(2))}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, padding: 0, transition: 'color 0.15s' }}
                      onMouseOver={e => (e.currentTarget.style.color = '#fff')}
                      onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                    >{label}</button>
                  ) : (
                    <a
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}
                      onMouseOver={e => (e.currentTarget.style.color = '#fff')}
                      onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                    >{label}</a>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, textAlign: 'center' }}>
        © {new Date().getFullYear()} WebWaka Technologies Limited. All rights reserved.
        {' · '}
        <button
          onClick={() => onNavigate('privacy')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12, padding: 0 }}
        >Privacy</button>
        {' · '}
        <button
          onClick={() => onNavigate('terms')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12, padding: 0 }}
        >Terms</button>
      </div>
    </footer>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { page, navigate } = usePageRoute();
  const [consent, setConsent] = useState<ConsentStatus>(getStoredConsent);

  const handleConsent = (status: 'accepted' | 'declined') => {
    storeConsent(status);
    setConsent(status);
  };

  const renderPage = () => {
    if (page === 'privacy') return <PrivacyPolicyPage onBack={() => navigate('home')} />;
    if (page === 'terms') return <TermsPage onBack={() => navigate('home')} />;
    if (page === 'contact') return <ContactPage onBack={() => navigate('home')} />;
    return (
      <main>
        <Hero />
        <Stats />
        <Features />
        <Pricing />
        <Verticals />
        <About />
        <CTA />
      </main>
    );
  };

  return (
    <>
      <Nav onNavigate={navigate} />
      {renderPage()}
      <Footer onNavigate={navigate} />
      {consent === null && <CookieConsentBanner onConsent={handleConsent} />}
    </>
  );
}
