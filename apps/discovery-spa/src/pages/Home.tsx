/**
 * Discovery home — trending listings + state chips + category browse
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { discoveryApi, type DiscoverHome } from '../lib/api';
import ListingCard from '../components/ListingCard';

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
        <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
          Find Businesses in Nigeria
        </h1>
        <p style={{ fontSize: '1.0625rem', opacity: 0.88, marginBottom: '2rem', maxWidth: 540, margin: '0 auto 2rem' }}>
          Discover verified businesses, services, and products across every state and LGA.
        </p>
        <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: 520, margin: '0 auto', gap: '0.5rem' }}>
          <input
            type="search" placeholder="Search businesses, services, products..."
            value={query} onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, borderRadius: 28, border: 'none',
              padding: '0.75rem 1.25rem', fontSize: '1rem',
            }}
          />
          <button type="submit" style={{
            background: '#fff', color: 'var(--green)', border: 'none',
            borderRadius: 28, padding: '0.75rem 1.5rem',
            fontWeight: 700, fontSize: '0.9375rem',
          }}>
            Search
          </button>
        </form>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>

        {error   && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}
        {loading && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem 0' }}>Loading...</p>}

        {data && (
          <>
            {/* Category chips */}
            {data.categories?.length > 0 && (
              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.0625rem' }}>Browse by Category</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {data.categories.map(cat => (
                    <Link
                      key={cat}
                      to={`/discover/category/${encodeURIComponent(cat)}`}
                      style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        background: '#fff',
                        border: '1px solid var(--border)',
                        borderRadius: 20,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text)',
                        textDecoration: 'none',
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* State chips */}
            {data.states?.length > 0 && (
              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.0625rem' }}>Browse by State</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {data.states.map(state => (
                    <Link
                      key={state.id}
                      to={`/discover/geo/${state.id}`}
                      style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 20,
                        fontSize: '0.8125rem',
                        color: 'var(--text)',
                        textDecoration: 'none',
                      }}
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
                <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.0625rem' }}>Trending Near You</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '1rem',
                }}>
                  {data.trending.map(l => <ListingCard key={l.id} listing={l} />)}
                </div>
              </section>
            )}

            {!data.trending?.length && !data.states?.length && (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem 0' }}>
                No listings yet — check back soon!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
