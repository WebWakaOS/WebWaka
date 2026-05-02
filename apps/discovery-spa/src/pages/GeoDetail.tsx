/**
 * Geo detail page — /discover/geo/:placeId
 * D1-4: geography filter with searchable child areas, business counts, and quick actions
 */
import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { discoveryApi, type Place, type GeoChild } from '../lib/api';

const TYPE_LABEL: Record<string, string> = {
  state: 'State',
  lga:   'LGA',
  ward:  'Ward',
};

function ChildCard({ child }: { child: GeoChild }) {
  return (
    <Link to={`/discover/geo/${child.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '0.875rem 1rem',
          cursor: 'pointer', transition: 'all 0.15s',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--green)';
          (e.currentTarget as HTMLElement).style.boxShadow  = '0 2px 10px rgba(0,0,0,0.07)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLElement).style.boxShadow  = '';
        }}
      >
        <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{child.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {child.businessCount != null ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {child.businessCount.toLocaleString()} {child.businessCount === 1 ? 'business' : 'businesses'}
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{child.type}</span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600 }}>Browse →</span>
        </div>
      </div>
    </Link>
  );
}

export default function GeoDetail() {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate    = useNavigate();

  const [place,    setPlace]    = useState<Place | null>(null);
  const [children, setChildren] = useState<GeoChild[]>([]);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [sortMode, setSortMode] = useState<'alpha' | 'count'>('alpha');
  const [query,    setQuery]    = useState('');

  useEffect(() => {
    if (!placeId) return;
    setLoading(true); setError(''); setSearch('');
    discoveryApi.geo(placeId)
      .then(d => { setPlace(d.place); setChildren(d.children); setLoading(false); })
      .catch(e => { setError((e as Error).message); setLoading(false); });
  }, [placeId]);

  const filtered = useMemo(() => {
    let list = children;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    if (sortMode === 'count') {
      list = [...list].sort((a, b) => (b.businessCount ?? 0) - (a.businessCount ?? 0));
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [children, search, sortMode]);

  const totalBusinesses = children.reduce((sum, c) => sum + (c.businessCount ?? 0), 0);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/discover/search?q=${encodeURIComponent(query.trim())}&place=${encodeURIComponent(place?.name ?? '')}`);
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <Link to="/discover">Home</Link> &rsaquo; {place?.name ?? placeId}
      </nav>

      {error   && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}

      {place && (
        <>
          {/* Hero */}
          <div style={{
            background: 'linear-gradient(135deg, var(--green) 0%, #0d4a28 100%)',
            borderRadius: 18, padding: '2rem 1.75rem', color: '#fff', marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.375rem, 3vw, 1.875rem)', lineHeight: 1.2 }}>
                {place.name}
              </h1>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 10px',
              }}>
                {TYPE_LABEL[place.type] ?? place.type}
              </span>
            </div>

            {totalBusinesses > 0 && (
              <p style={{ opacity: 0.88, fontSize: '0.9375rem', marginBottom: '1.25rem' }}>
                {totalBusinesses.toLocaleString()} businesses across {children.length} {place.type === 'state' ? 'LGAs' : 'areas'}
              </p>
            )}

            {/* Search within this place */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: 460 }}>
              <input
                type="search"
                placeholder={`Search businesses in ${place.name}…`}
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  flex: 1, borderRadius: 24, border: 'none',
                  padding: '0.6rem 1rem', fontSize: '0.9rem',
                }}
              />
              <button type="submit" style={{
                background: '#fff', color: 'var(--green)', border: 'none',
                borderRadius: 24, padding: '0.6rem 1.25rem',
                fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
              }}>Search</button>
            </form>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <Link
              to={`/discover/in/${place.id}`}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'var(--green)', color: '#fff',
                borderRadius: 10, fontWeight: 700, fontSize: '0.9rem',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              📋 All Businesses in {place.name}
            </Link>
            <Link
              to="/discover"
              style={{
                padding: '0.625rem 1.25rem',
                background: 'var(--card)', color: 'inherit',
                border: '1px solid var(--border)',
                borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              ← All States
            </Link>
          </div>

          {/* Children (LGAs / wards) */}
          {children.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>
                  {place.type === 'state' ? `LGAs (${children.length})` : `Sub-Areas (${children.length})`}
                </h2>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Area search */}
                  <input
                    type="search"
                    placeholder={`Filter ${place.type === 'state' ? 'LGAs' : 'areas'}…`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      borderRadius: 20, border: '1.5px solid var(--border)',
                      padding: '5px 14px', fontSize: '0.8125rem',
                      background: 'var(--card)', color: 'inherit',
                    }}
                  />

                  {/* Sort toggle */}
                  <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                    {(['alpha', 'count'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setSortMode(mode)}
                        style={{
                          padding: '5px 12px', border: 'none', cursor: 'pointer',
                          fontSize: '0.75rem', fontWeight: 600,
                          background: sortMode === mode ? 'var(--green)' : 'var(--card)',
                          color:      sortMode === mode ? '#fff' : 'var(--muted)',
                        }}
                      >
                        {mode === 'alpha' ? 'A–Z' : 'By Size'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filtered.length === 0 && (
                <p style={{ color: 'var(--muted)', padding: '1rem 0' }}>No matching areas found.</p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {filtered.map(child => <ChildCard key={child.id} child={child} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
