/**
 * Search results page — /discover/search?q=…&place=…&page=…
 * D1-7: pagination + category/place filter chips
 */
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { discoveryApi, type SearchResult } from '../lib/api';
import ListingCard from '../components/ListingCard';
import Pagination  from '../components/Pagination';

const PAGE_LIMIT = 20;

export default function Search() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q      = params.get('q') ?? '';
  const place  = params.get('place') ?? undefined;
  const page   = parseInt(params.get('page') ?? '1', 10);

  const [data,    setData]    = useState<SearchResult | null>(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(() => {
    if (!q) { setData(null); return; }
    setLoading(true); setError('');
    discoveryApi.search(q, place, page)
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError((e as Error).message); setLoading(false); });
  }, [q, place, page]);

  useEffect(() => { doSearch(); }, [doSearch]);

  function setPage(p: number) {
    const next = new URLSearchParams(params);
    next.set('page', String(p));
    setParams(next);
    window.scrollTo(0, 0);
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <Link to="/discover">Home</Link> &rsaquo; Search
      </nav>

      {/* Heading */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontWeight: 700, fontSize: '1.375rem' }}>
          {q ? `Results for "${q}"` : 'Search'}
          {data?.total != null && (
            <span style={{ fontWeight: 400, fontSize: '1rem', color: 'var(--muted)', marginLeft: 8 }}>
              ({data.total.toLocaleString()} found)
            </span>
          )}
        </h1>

        {/* Active filters */}
        {place && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#dcfce7', color: '#15803d',
              borderRadius: 20, padding: '4px 12px',
              fontSize: '0.8125rem', fontWeight: 600,
            }}>
              📍 {place}
              <button
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.delete('place');
                  next.delete('page');
                  setParams(next);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                aria-label="Remove location filter"
              >✕</button>
            </span>
          </div>
        )}
      </div>

      {/* Refine search */}
      <form
        onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); navigate(`/discover/search?q=${encodeURIComponent((fd.get('q') as string ?? '').trim())}`); }}
        style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', maxWidth: 560 }}
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Refine your search…"
          style={{ flex: 1, borderRadius: 24, border: '1.5px solid var(--border)', padding: '0.55rem 1rem', fontSize: '0.9rem', background: 'var(--card)', color: 'inherit' }}
        />
        <button
          type="submit"
          style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 24, padding: '0.55rem 1.25rem', fontWeight: 700, cursor: 'pointer' }}
        >
          Search
        </button>
      </form>

      {/* States */}
      {!q && <p style={{ color: 'var(--muted)' }}>Enter a search term to find businesses.</p>}
      {error   && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              borderRadius: 12, height: 160,
              background: 'linear-gradient(90deg, var(--border) 25%, #e5e7eb 50%, var(--border) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s infinite',
            }} />
          ))}
        </div>
      )}

      {data && !loading && data.results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted)' }}>
          <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No results for &ldquo;{q}&rdquo;</p>
          <p>Try a different term or <Link to="/discover">browse all listings</Link>.</p>
        </div>
      )}

      {data && !loading && data.results.length > 0 && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            {data.results.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>

          <Pagination
            page={page}
            total={data.total}
            limit={PAGE_LIMIT}
            onChange={setPage}
          />

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
            Page {page} of {Math.ceil(data.total / PAGE_LIMIT)}
          </p>
        </>
      )}

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  );
}
