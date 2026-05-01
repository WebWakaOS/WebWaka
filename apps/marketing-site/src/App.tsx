/**
 * WebWaka OS — Marketing Website
 * Public-facing landing page for webwaka.com
 */

import { useState } from 'react';

// ─── Shared styles ────────────────────────────────────────────────────────────
const PRIMARY = '#0F4C81';
const GREEN = '#059669';
const DARK = '#0d1117';

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
    desc: 'Run your business from any phone, even without internet. Dial *123# and manage sales, inventory and more.',
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
  { value: '200+', label: 'Business verticals' },
  { value: '₦0', label: 'To get started' },
  { value: '36', label: 'Nigerian states covered' },
  { value: '5ms', label: 'API response time' },
];

// ─── Components ───────────────────────────────────────────────────────────────

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #e5e7eb',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: PRIMARY }}>WebWaka</span>
          <span style={{ background: PRIMARY, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 4, letterSpacing: '0.05em' }}>OS</span>
        </div>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }} aria-label="Main navigation">
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
              fontSize: 14, fontWeight: 600, transition: 'opacity 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >
            Sign in
          </a>
        </nav>
      </div>
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
          Now live in Nigeria — 200+ business verticals
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
              fontSize: 16, fontWeight: 700, minHeight: 52, display: 'inline-flex', alignItems: 'center',
            }}
          >
            Start free — no card needed
          </a>
          <a
            href="#features"
            style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '14px 32px',
              borderRadius: 10, fontSize: 16, fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)',
              minHeight: 52, display: 'inline-flex', alignItems: 'center',
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
              <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
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
                href="https://workspace.webwaka.com/register"
                style={{
                  display: 'block', textAlign: 'center',
                  background: plan.highlight ? '#fff' : PRIMARY,
                  color: plan.highlight ? PRIMARY : '#fff',
                  padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14,
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
            200+ industry-specific templates — from abattoir to government agency.
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
            +180 more
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
            minHeight: 54,
          }}
        >
          Create your free workspace →
        </a>
      </div>
    </section>
  );
}

function Footer() {
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
        </div>
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          {[
            { heading: 'Product', links: ['Features', 'Pricing', 'Verticals', 'USSD'] },
            { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'NDPR Compliance'] },
          ].map(col => (
            <div key={col.heading}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{col.heading}</div>
              {col.links.map(link => (
                <div key={link} style={{ fontSize: 13, marginBottom: 8 }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}
                    onMouseOver={e => (e.currentTarget.style.color = '#fff')}
                    onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                  >{link}</a>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, textAlign: 'center' }}>
        © {new Date().getFullYear()} WebWaka Technologies Limited. All rights reserved.
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Pricing />
        <Verticals />
        <About />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
