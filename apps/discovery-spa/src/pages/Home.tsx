/**
 * Discovery home — hero search + stats + category browse + state chips + trending
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { discoveryApi, type DiscoverHome } from '../lib/api';
import ListingCard from '../components/ListingCard';

const CATEGORY_ICONS: Record<string, string> = {
  'Restaurant':          '🍽️',
  'Pharmacy':            '💊',
  'Supermarket':         '🛒',
  'Hotel':               '🏨',
  'Bank':                '🏦',
  'Hospital':            '🏥',
  'School':              '🎓',
  'Church':              '⛪',
  'Mosque':              '🕌',
  'Petrol Station':      '⛽',
  'Market':              '🛍️',
  'Salon':               '✂️',
  'Gym':                 '💪',
  'Mechanic':            '🔧',
  'Tailor':              '🪡',
  'Bakery':              '🍞',
  'Logistics':           '🚚',
  'Print Shop':          '🖨️',
  'Phone Repair':        '📱',
  'Clinic':              '🩺',
};

function getCategoryIcon(cat: string): string {
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (cat.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '🏪';
}

function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 12, height: 200,
      background: 'linear-gradient(90deg, var(--border) 25%, #e5e7eb 50%, var(--border) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

export default function Home() {
  const [data,    setData]    = useState<DiscoverHome | null>(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    discoveryApi.home()
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError((e as Error).message); setLoading(false); });
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/discover/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green) 0%, #0d4a28 100%)',
        color: '#fff', padding: '3.5rem 1.5rem 2.5rem', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Find Businesses in Nigeria
        </h1>
        <p style={{ fontSize: '1.0625rem', opacity: 0.88, maxWidth: 540, margin: '0 auto 2rem' }}>
          Discover verified businesses, services, and products across every state and LGA.
        </p>
        <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: 520, margin: '0 auto', gap: '0.5rem' }}>
          <input
            type="search"
            placeholder="Search businesses, services, products…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, borderRadius: 28, border: 'none',
              padding: '0.75rem 1.25rem', fontSize: '1rem',
            }}
          />
          <button type="submit" style={{
            background: '#fff', color: 'var(--green)', border: 'none',
            borderRadius: 28, padding: '0.75rem 1.5rem',
            fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer',
          }}>
            Search
          </button>
        </form>

        {/* Stats strip */}
        {data?.featuredCount != null && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {[
              [`${data.featuredCount.toLocaleString()}+`, 'Businesses Listed'],
              [`${data.states?.length ?? 36}`, 'States Covered'],
              [`${data.categories?.length ?? 0}+`, 'Categories'],
            ].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', lineHeight: 1 }}>{val}</div>
                <div style={{ opacity: 0.8, fontSize: '0.8125rem', marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>
        {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}

        {/* Loading skeleton */}
        {loading && (
          <>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ height: 34, width: 100, borderRadius: 20, background: 'var(--border)', animation: 'shimmer 1.4s infinite' }} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        )}

        {data && (
          <>
            {/* Category browse */}
            {data.categories?.length > 0 && (
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.0625rem' }}>Browse by Category</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {data.categories.map(cat => (
                    <Link
                      key={cat}
                      to={`/discover/category/${encodeURIComponent(cat)}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        padding: '6px 16px',
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 20, fontSize: '0.875rem', fontWeight: 600,
                        color: 'var(--text)', textDecoration: 'none',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--green)';
                        (e.currentTarget as HTMLElement).style.background  = '#f0fdf4';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLElement).style.background  = 'var(--card)';
                      }}
                    >
                      <span>{getCategoryIcon(cat)}</span>
                      <span>{cat}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* State chips */}
            {data.states?.length > 0 && (
              <section style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Browse by State</h2>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{data.states.length} states</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {data.states.map(state => (
                    <Link
                      key={state.id}
                      to={`/discover/geo/${state.id}`}
                      style={{
                        display: 'inline-block', padding: '6px 14px',
                        background: 'var(--card)', border: '1px solid var(--border)',
                        borderRadius: 20, fontSize: '0.8125rem',
                        color: 'var(--text)', textDecoration: 'none',
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--green)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                    >
                      {state.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Trending listings */}
            {data.trending?.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Trending Businesses</h2>
                  <Link to="/discover/search?q=" style={{ fontSize: '0.875rem', color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
                    View all →
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                  {data.trending.map(l => <ListingCard key={l.id} listing={l} />)}
                </div>
              </section>
            )}

            {!data.trending?.length && !data.states?.length && !loading && (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem 0' }}>
                No listings yet — check back soon!
              </p>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  );
}
