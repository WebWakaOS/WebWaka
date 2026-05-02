/**
 * Search results page — /discover/search?q=…&place=…
 */
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { discoveryApi, type SearchResult } from '../lib/api';
import ListingCard from '../components/ListingCard';

export default function Search() {
  const [params]  = useSearchParams();
  const q         = params.get('q') ?? '';
  const place     = params.get('place') ?? undefined;
  const [data,    setData]    = useState<SearchResult | null>(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) { setLoading(false); return; }
    setLoading(true); setError('');
    discoveryApi.search(q, place)
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError((e as Error).message); setLoading(false); });
  }, [q, place]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>
      <nav style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <Link to="/discover">Home</Link> &rsaquo; Search
      </nav>

      <h1 style={{ fontWeight: 700, fontSize: '1.375rem', marginBottom: '1.5rem' }}>
        {q ? `Results for "${q}"` : 'Search'}
        {data?.total != null && (
          <span style={{ fontWeight: 400, fontSize: '1rem', color: 'var(--muted)', marginLeft: 8 }}>
            ({data.total} found)
          </span>
        )}
      </h1>

      {!q && <p style={{ color: 'var(--muted)' }}>Enter a search term to find businesses.</p>}
      {error   && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--muted)' }}>Searching...</p>}

      {data && data.results.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted)' }}>
          <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No results for &ldquo;{q}&rdquo;</p>
          <p>Try a different term or <Link to="/discover">browse all listings</Link>.</p>
        </div>
      )}

      {data && data.results.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
        }}>
          {data.results.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
