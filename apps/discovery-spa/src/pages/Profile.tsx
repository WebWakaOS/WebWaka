/**
 * Public business profile page — /discover/:entityType/:id
 * D1-6: full WakaPage embed
 * D1-8: Claim CTA on unclaimed profiles
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { discoveryApi, type Profile as ProfileData, type ClaimRequest } from '../lib/api';

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < full ? '★' : i === full && half ? '⭑' : '☆'}</span>
      ))}
    </span>
  );
}

function ClaimModal({ entityType, entityId, onClose }: { entityType: string; entityId: string; onClose: () => void }) {
  const [form, setForm] = useState<Omit<ClaimRequest, 'entityType' | 'entityId'>>({
    contactName: '', contactPhone: '', contactEmail: '', businessRole: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  function set(k: keyof typeof form, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setErr('');
    try {
      await discoveryApi.submitClaim({ entityType, entityId, ...form });
      setDone(true);
    } catch (ex) {
      setErr((ex as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  };
  const card: React.CSSProperties = {
    background: 'var(--card)', borderRadius: 16, padding: '2rem',
    maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  };

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={card}>
        {done ? (
          <>
            <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: '0.75rem' }}>Claim Request Submitted!</h2>
            <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
              We'll review your request and contact you within 2 business days.
            </p>
            <button onClick={onClose} style={{
              width: '100%', padding: '0.75rem', background: 'var(--green)',
              color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '1rem',
            }}>
              Done
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Claim This Business</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}>×</button>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Verify you're the owner or authorized manager to update this listing, add photos, and respond to reviews.
            </p>

            {err && <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>{err}</p>}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {([
                ['contactName',  'Your Full Name *',          'text'],
                ['contactPhone', 'Phone Number *',            'tel'],
                ['contactEmail', 'Business Email *',          'email'],
                ['businessRole', 'Your Role (e.g. Owner) *',  'text'],
              ] as const).map(([key, placeholder, type]) => (
                <input
                  key={key}
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  required
                  style={{
                    padding: '0.65rem 0.875rem', borderRadius: 8,
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg)', color: 'inherit', fontSize: '0.9375rem',
                  }}
                />
              ))}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.75rem', background: 'var(--green)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontWeight: 700, cursor: submitting ? 'wait' : 'pointer',
                  fontSize: '1rem', marginTop: '0.25rem',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Claim Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const { entityType, id } = useParams<{ entityType: string; id: string }>();
  const [data,       setData]       = useState<ProfileData | null>(null);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(true);
  const [showClaim,  setShowClaim]  = useState(false);
  const [activeImg,  setActiveImg]  = useState<string | null>(null);

  useEffect(() => {
    if (!entityType || !id) return;
    setLoading(true); setError('');
    discoveryApi.profile(entityType, id)
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError((e as Error).message); setLoading(false); });
  }, [entityType, id]);

  if (loading) return (
    <div style={{ maxWidth: 840, margin: '3rem auto', padding: '0 1.25rem', textAlign: 'center', color: 'var(--muted)' }}>
      Loading profile…
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 840, margin: '3rem auto', padding: '0 1.25rem' }}>
      <Link to="/discover" style={{ color: 'var(--green)' }}>← Back</Link>
      <p style={{ color: '#dc2626', marginTop: '1rem' }}>{error}</p>
    </div>
  );

  if (!data) return null;

  const isClaimed = data.claimed ?? false;

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '2rem 1.25rem' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <Link to="/discover">Home</Link> &rsaquo;{' '}
        {data.category && <><Link to={`/discover/category/${encodeURIComponent(data.category)}`}>{data.category}</Link> &rsaquo; </>}
        {data.name}
      </nav>

      {/* Hero image */}
      {data.imageUrl && (
        <div style={{ height: 240, borderRadius: 14, overflow: 'hidden', marginBottom: '1.5rem', background: '#e5e7eb' }}>
          <img src={data.imageUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Name + badges */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.75rem', lineHeight: 1.2 }}>{data.name}</h1>
            {data.verified && (
              <span title="Verified" style={{ fontSize: '1.25rem' }}>✅</span>
            )}
          </div>
          {data.category && (
            <span style={{
              display: 'inline-block', marginTop: 6,
              background: '#dcfce7', color: '#15803d',
              borderRadius: 20, padding: '3px 12px',
              fontSize: '0.8125rem', fontWeight: 700,
            }}>{data.category}</span>
          )}
        </div>

        {/* Claim / verified badge */}
        {!isClaimed && (
          <button
            onClick={() => setShowClaim(true)}
            style={{
              padding: '0.6rem 1.25rem',
              background: 'transparent',
              border: '2px solid var(--green)',
              borderRadius: 10, color: 'var(--green)',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
              whiteSpace: 'nowrap',
            }}
          >
            🏷️ Claim This Business
          </button>
        )}
        {isClaimed && (
          <span style={{
            padding: '0.5rem 1rem',
            background: '#dcfce7', color: '#15803d',
            borderRadius: 10, fontWeight: 700, fontSize: '0.875rem',
          }}>
            ✓ Claimed
          </span>
        )}
      </div>

      {/* Rating */}
      {data.rating != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <StarRating rating={data.rating} />
          <span style={{ fontWeight: 700 }}>{data.rating.toFixed(1)}</span>
          {data.reviewCount != null && (
            <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>({data.reviewCount.toLocaleString()} reviews)</span>
          )}
        </div>
      )}

      {/* Description */}
      {data.description && (
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
          {data.description}
        </p>
      )}

      {/* Contact grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '0.75rem', marginBottom: '1.5rem',
      }}>
        {data.address && (
          <div style={{ background: 'var(--card)', borderRadius: 10, padding: '0.875rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</div>
            <div style={{ fontSize: '0.9375rem' }}>📍 {data.address}</div>
          </div>
        )}
        {data.phone && (
          <div style={{ background: 'var(--card)', borderRadius: 10, padding: '0.875rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</div>
            <a href={`tel:${data.phone}`} style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9375rem' }}>📞 {data.phone}</a>
          </div>
        )}
        {data.email && (
          <div style={{ background: 'var(--card)', borderRadius: 10, padding: '0.875rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
            <a href={`mailto:${data.email}`} style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem', wordBreak: 'break-all' }}>✉️ {data.email}</a>
          </div>
        )}
        {data.hours && (
          <div style={{ background: 'var(--card)', borderRadius: 10, padding: '0.875rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hours</div>
            <div style={{ fontSize: '0.9375rem' }}>🕐 {data.hours}</div>
          </div>
        )}
        {data.website && (
          <div style={{ background: 'var(--card)', borderRadius: 10, padding: '0.875rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Website</div>
            <a href={data.website} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem', wordBreak: 'break-all' }}>🌐 {data.website}</a>
          </div>
        )}
      </div>

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.5rem' }}>
          {data.tags.map(t => (
            <span key={t} style={{
              background: 'var(--border)', borderRadius: 20,
              padding: '3px 10px', fontSize: '0.8125rem', color: 'var(--muted)',
            }}>{t}</span>
          ))}
        </div>
      )}

      {/* Offerings */}
      {data.offerings && data.offerings.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.875rem' }}>Products &amp; Services</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {data.offerings.map(o => (
              <div key={o.id} style={{
                background: 'var(--card)', borderRadius: 10, padding: '0.875rem',
                border: '1px solid var(--border)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{o.name}</div>
                {o.price != null && (
                  <div style={{ color: 'var(--green)', fontWeight: 700, marginTop: 4 }}>
                    ₦{o.price.toLocaleString()}{o.unit ? ` / ${o.unit}` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {data.gallery && data.gallery.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.875rem' }}>Gallery</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
            {data.gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(img)}
                style={{ padding: 0, border: 'none', borderRadius: 10, overflow: 'hidden', cursor: 'zoom-in', aspectRatio: '4/3', background: '#e5e7eb' }}
              >
                <img src={img} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* WakaPage embed */}
      {data.wakaPageUrl && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.875rem' }}>Full Profile</h2>
          <iframe
            src={data.wakaPageUrl}
            title={`${data.name} WakaPage`}
            style={{ width: '100%', height: 600, border: 'none', borderRadius: 14, background: '#f9fafb' }}
          />
        </section>
      )}

      {/* Claim banner (unclaimed) */}
      {!isClaimed && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '1.5px solid #86efac',
          borderRadius: 14, padding: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
          marginBottom: '2rem',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Is this your business?</div>
            <div style={{ fontSize: '0.875rem', color: '#166534' }}>
              Claim this listing to update details, add photos, and verify ownership.
            </div>
          </div>
          <button
            onClick={() => setShowClaim(true)}
            style={{
              padding: '0.65rem 1.5rem',
              background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 10,
              fontWeight: 700, cursor: 'pointer', fontSize: '0.9375rem',
              whiteSpace: 'nowrap',
            }}
          >
            Claim Now →
          </button>
        </div>
      )}

      {/* Lightbox */}
      {activeImg && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={() => setActiveImg(null)}
        >
          <img src={activeImg} alt="Gallery full" style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: 10, objectFit: 'contain' }} />
          <button
            onClick={() => setActiveImg(null)}
            style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 }}
          >×</button>
        </div>
      )}

      {/* Claim modal */}
      {showClaim && entityType && id && (
        <ClaimModal entityType={entityType} entityId={id} onClose={() => setShowClaim(false)} />
      )}
    </div>
  );
}
