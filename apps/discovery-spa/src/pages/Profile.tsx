/**
 * Public business profile page — /discover/:entityType/:id
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { discoveryApi, type Profile as ProfileData } from '../lib/api';

export default function Profile() {
  const { entityType, id } = useParams<{ entityType: string; id: string }>();
  const [data,    setData]    = useState<ProfileData | null>(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityType || !id) return;
    setLoading(true); setError('');
    discoveryApi.profile(entityType, id)
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError((e as Error).message); setLoading(false); });
  }, [entityType, id]);

  const stars = data?.rating ? Math.round(data.rating) : 0;

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '2rem 1.25rem' }}>
      <nav style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <Link to="/discover">Home</Link> &rsaquo; {data?.name ?? 'Business Profile'}
      </nav>

      {error   && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}

      {data && (
        <div>
          {/* Hero image */}
          {data.imageUrl && (
            <div style={{
              height: 220, borderRadius: 14, overflow: 'hidden',
              marginBottom: '1.5rem', background: '#e5e7eb',
            }}>
              <img
                src={data.imageUrl} alt={data.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Name + category */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: '1.75rem', lineHeight: 1.2 }}>{data.name}</h1>
              {data.category && (
                <span style={{
                  display: 'inline-block', marginTop: 6,
                  background: '#dcfce7', color: '#15803d',
                  borderRadius: 20, padding: '3px 12px',
                  fontSize: '0.8125rem', fontWeight: 700,
                }}>
                  {data.category}
                </span>
              )}
            </div>
            {stars > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', color: '#f59e0b' }}>
                  {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                </div>
                {data.reviewCount != null && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {data.reviewCount} review{data.reviewCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {data.description && (
            <p style={{
              fontSize: '0.9375rem', color: '#374151', lineHeight: 1.65,
              marginBottom: '1.5rem',
            }}>
              {data.description}
            </p>
          )}

          {/* Contact / info card */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '1.25rem',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem', marginBottom: '1.5rem',
          }}>
            {data.address && <InfoRow icon="📍" label="Address"  value={data.address} />}
            {data.phone   && <InfoRow icon="📞" label="Phone"    value={data.phone}   />}
            {data.email   && <InfoRow icon="✉️"  label="Email"   value={data.email}   />}
            {data.website && (
              <InfoRow icon="🌐" label="Website" value={
                <a href={data.website} target="_blank" rel="noopener noreferrer"
                   style={{ color: 'var(--primary)' }}>
                  {data.website.replace(/^https?:\/\//, '')}
                </a>
              } />
            )}
            {data.hours && <InfoRow icon="🕐" label="Hours" value={data.hours} />}
          </div>

          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {data.tags.map(tag => (
                <span key={tag} style={{
                  background: '#f3f4f6', color: '#374151',
                  borderRadius: 20, padding: '4px 12px',
                  fontSize: '0.8125rem', fontWeight: 600,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon, label, value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>
        {icon} {label}
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{value}</p>
    </div>
  );
}
