/**
 * Geo detail page — /discover/geo/:placeId
 * Shows a state/LGA card with its children (LGAs or wards) + direct listing count.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { discoveryApi, type Place, type GeoChild } from '../lib/api';

export default function GeoDetail() {
  const { placeId } = useParams<{ placeId: string }>();
  const [place,    setPlace]    = useState<Place | null>(null);
  const [children, setChildren] = useState<GeoChild[]>([]);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!placeId) return;
    setLoading(true); setError('');
    discoveryApi.geo(placeId)
      .then(d => { setPlace(d.place); setChildren(d.children); setLoading(false); })
      .catch(e => { setError((e as Error).message); setLoading(false); });
  }, [placeId]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>
      <nav style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <Link to="/discover">Home</Link> &rsaquo; {place?.name ?? placeId}
      </nav>

      {error   && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}

      {place && (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.5rem' }}>{place.name}</h1>
            <span style={{
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
              background: '#dcfce7', color: '#15803d', borderRadius: 20, padding: '2px 10px',
            }}>
              {place.type}
            </span>
          </div>

          {/* View all listings in this place */}
          <Link
            to={`/discover/in/${place.id}`}
            style={{
              display: 'inline-block', marginBottom: '2rem',
              padding: '0.625rem 1.25rem',
              background: 'var(--green)', color: '#fff',
              borderRadius: 8, fontWeight: 700, fontSize: '0.9375rem',
              textDecoration: 'none',
            }}
          >
            View all businesses in {place.name}
          </Link>

          {/* Children (LGAs / wards) */}
          {children.length > 0 && (
            <>
              <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>
                {place.type === 'state' ? 'LGAs' : 'Sub-areas'}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.75rem',
              }}>
                {children.map(child => (
                  <Link
                    key={child.id}
                    to={`/discover/geo/${child.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{
                      background: 'var(--card)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '0.875rem 1rem',
                      transition: 'box-shadow 0.15s', cursor: 'pointer',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
                    >
                      <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{child.name}</p>
                      {child.businessCount != null && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                          {child.businessCount} businesses
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
