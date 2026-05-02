/**
 * Category browsing page — /discover/category/:cat?page=…
 * D1-3: category grid + pagination
 */
import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { discoveryApi, type Listing } from '../lib/api';
import ListingCard from '../components/ListingCard';
import Pagination  from '../components/Pagination';

const PAGE_LIMIT = 20;

export default function Category() {
  const { cat } = useParams<{ cat: string }>();
  const [sp, setSp] = useSearchParams();
  const page = parseInt(sp.get('page') ?? '1', 10);

  const [listings, setListings] = useState<Listing[]>([]);
  const [total,    setTotal]    = useState(0);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(() => {
    if (!cat) return;
    setLoading(true); setError('');
    discoveryApi.category(cat, page)
      .then(d => {
        setListings(d.listings);
        setTotal(d.total ?? d.listings.length);
        setLoading(false);
      })
      .catch(e => { setError((e as Error).message); setLoading(false); });
  }, [cat, page]);

  useEffect(() => { load(); window.scrollTo(0, 0); }, [load]);

  function setPage(p: number) { const n = new URLSearchParams(sp); n.set('page', String(p)); setSp(n); }

  const label = cat ? decodeURIComponent(cat) : '';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>
      <nav style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <Link to="/discover">Home</Link> &rsaquo; {label}
      </nav>

      <h1 style={{ fontWeight: 700, fontSize: '1.375rem', marginBottom: '1.5rem' }}>
        {label}
        {total > 0 && (
          <span style={{ fontWeight: 400, fontSize: '1rem', color: 'var(--muted)', marginLeft: 8 }}>
            ({total.toLocaleString()} businesses)
          </span>
        )}
      </h1>

      {error   && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}

      {!loading && listings.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted)' }}>
          <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No listings for "{label}" yet.</p>
          <Link to="/discover">← Back to home</Link>
        </div>
      )}

      {!loading && listings.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
          <Pagination page={page} total={total} limit={PAGE_LIMIT} onChange={setPage} />
        </>
      )}
    </div>
  );
}
